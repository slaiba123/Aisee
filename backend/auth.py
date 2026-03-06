# # backend/auth.py
# import os, json, time
# os.environ["OAUTHLIB_RELAX_TOKEN_SCOPE"] = "1"  # Avoid "Token's scope does not match client scopes" error
# from fastapi import APIRouter, HTTPException, Response, Cookie, Header
# from fastapi.responses import RedirectResponse
# from google_auth_oauthlib.flow import Flow
# from google.oauth2.credentials import Credentials
# from google.auth.transport.requests import Request
# from googleapiclient.discovery import build
# from cryptography.fernet import Fernet
# from jose import jwt, JWTError
# from pydantic import BaseModel

# from database import (
#     get_db, claim_device, upsert_user, get_device, revoke_device,
#     save_oauth_state, consume_oauth_state,   # ← DB-based state, not memory
# )

# router = APIRouter()

# # ── Config ────────────────────────────────────────────────────────────────────
# CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID")
# CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
# FERNET_KEY    = os.getenv("FERNET_KEY", "").encode()
# JWT_SECRET    = os.getenv("JWT_SECRET", "")
# FRONTEND_URL  = os.getenv("FRONTEND_URL", "http://localhost:5173")
# BACKEND_URL   = os.getenv("BACKEND_URL",  "http://localhost:8000")
# IS_PROD       = os.getenv("ENV", "dev") == "production"
# REDIRECT_URI  = f"{BACKEND_URL}/auth/callback"

# SCOPES = ["https://www.googleapis.com/auth/drive.file", "openid", "email", "profile"]


# # ── Crypto ────────────────────────────────────────────────────────────────────

# def encrypt(data: str) -> str:
#     return Fernet(FERNET_KEY).encrypt(data.encode()).decode()

# def decrypt(data: str) -> str:
#     return Fernet(FERNET_KEY).decrypt(data.encode()).decode()

# def make_session_jwt(google_id: str, device_code: str) -> str:
#     return jwt.encode(
#         {"google_id": google_id, "device_code": device_code,
#          "exp": time.time() + 86400 * 7},
#         JWT_SECRET, algorithm="HS256"
#     )

# def verify_session(token: str) -> dict:
#     try:
#         return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
#     except JWTError:
#         raise HTTPException(401, "Session expired — please log in again")


# # ── Drive service ─────────────────────────────────────────────────────────────

# def get_drive_service(device_code: str, db):
#     """
#     Builds a Google Drive client using the token stored for this device.
#     Identical to your original OCR script — token comes from DB not token.json.
#     Auto-refreshes expired tokens and saves back to DB.
#     """
#     from database import get_token, update_token

#     encrypted = get_token(db, device_code)
#     if not encrypted:
#         raise HTTPException(403, "Device not set up or has been revoked")

#     token_json = json.loads(decrypt(encrypted))

#     creds = Credentials(
#         token=token_json.get("token"),
#         refresh_token=token_json.get("refresh_token"),
#         token_uri=token_json.get("token_uri", "https://oauth2.googleapis.com/token"),
#         client_id=CLIENT_ID,
#         client_secret=CLIENT_SECRET,
#         scopes=SCOPES,
#     )

#     if creds.expired and creds.refresh_token:
#         creds.refresh(Request())
#         updated = {
#             "token":         creds.token,
#             "refresh_token": creds.refresh_token,
#             "token_uri":     creds.token_uri,
#             "scopes":        list(creds.scopes or []),
#         }
#         update_token(db, device_code, encrypt(json.dumps(updated)))
#         db.commit()

#     return build("drive", "v3", credentials=creds)


# # ── OAuth Flow ────────────────────────────────────────────────────────────────

# def _make_flow():
#     return Flow.from_client_config(
#         {"web": {
#             "client_id":     CLIENT_ID,
#             "client_secret": CLIENT_SECRET,
#             "auth_uri":      "https://accounts.google.com/o/oauth2/auth",
#             "token_uri":     "https://oauth2.googleapis.com/token",
#         }},
#         scopes=SCOPES,
#         redirect_uri=REDIRECT_URI,
#     )


# # ── Routes ────────────────────────────────────────────────────────────────────

# @router.get("/google/url")
# def get_auth_url():
#     """
#     Step 1: Frontend requests Google login URL.
#     Saves state to DB — survives server restarts and multiple instances.
#     """
#     flow = _make_flow()
#     auth_url, state = flow.authorization_url(
#         access_type="offline",
#         prompt="consent",
#     )

#     # Save state to DB (not memory — production safe)
#     with get_db() as db:
#         save_oauth_state(db, state, ttl_seconds=300)  # 5 min TTL

#     return {"url": auth_url}


# @router.get("/callback")
# def oauth_callback(code: str, state: str):
#     """
#     Step 2: Google redirects here after user approves.
#     Validates state from DB (one-time use), saves user + encrypted token.
#     Redirects to frontend /setup with a short-lived pending JWT in URL.
#     """
#     # Validate and consume state from DB
#     with get_db() as db:
#         valid = consume_oauth_state(db, state)

#     if not valid:
#         raise HTTPException(400, "Invalid or expired login session — please try again")

#     flow = _make_flow()
#     flow.fetch_token(code=code)
#     creds = flow.credentials

#     # Get user info from Google
#     info      = build("oauth2", "v2", credentials=creds).userinfo().get().execute()
#     google_id = info["id"]
#     email     = info["email"]
#     name      = info.get("name", "")

#     # Build token JSON — same structure as token.json in your original OCR script
#     token_data = {
#         "token":         creds.token,
#         "refresh_token": creds.refresh_token,
#         "token_uri":     creds.token_uri,
#         "scopes":        list(creds.scopes or []),
#     }
#     encrypted_token = encrypt(json.dumps(token_data))

#     # Save user to DB
#     with get_db() as db:
#         upsert_user(db, google_id, email, name)

#     # Pack everything into a short-lived JWT
#     # Frontend reads this from the URL param after redirect
#     pending_jwt = jwt.encode(
#         {
#             "google_id": google_id,
#             "email":     email,
#             "name":      name,
#             "token":     encrypted_token,
#             "exp":       time.time() + 600,  # 10 minutes to enter device code
#         },
#         JWT_SECRET,
#         algorithm="HS256",
#     )

#     # Redirect to frontend setup page — JWT in URL param, no cookies needed
#     return RedirectResponse(url=f"{FRONTEND_URL}/setup?pending={pending_jwt}")


# class SetupBody(BaseModel):
#     device_code: str
#     pending_jwt: str    # Short-lived JWT from URL param


# @router.post("/setup")
# def complete_setup(body: SetupBody):
#     """
#     Step 3: User enters their card code.
#     Decodes pending JWT, links Google token to device in DB.
#     Returns a session JWT stored in localStorage by frontend.
#     """
#     try:
#         data = jwt.decode(body.pending_jwt, JWT_SECRET, algorithms=["HS256"])
#     except JWTError:
#         raise HTTPException(400, "Session expired — please sign in with Google again")

#     google_id = data["google_id"]
#     email     = data["email"]
#     name      = data["name"]
#     enc_token = data["token"]
#     code      = body.device_code.strip().upper()

#     with get_db() as db:
#         device = get_device(db, code)
#         if not device:
#             raise HTTPException(404, "Device code not found — check the code on your card")
#         if device.claimed and device.user_email != email:
#             raise HTTPException(409, "This device is already linked to another account")

#         claim_device(db, code, enc_token, email)
#         upsert_user(db, google_id, email, name, device_code=code)

#     session_token = make_session_jwt(google_id, code)
#     return {
#         "status":        "ok",
#         "device_code":   code,
#         "session_token": session_token,
#     }


# @router.get("/me")
# def get_me(authorization: str = Header(None)):
#     """
#     Returns current user info.
#     Reads session JWT from Authorization header (stored in localStorage).
#     """
#     if not authorization or not authorization.startswith("Bearer "):
#         return {"logged_in": False}
#     token = authorization.split(" ", 1)[1]
#     try:
#         payload = verify_session(token)
#     except HTTPException:
#         return {"logged_in": False}

#     with get_db() as db:
#         device_code = payload.get("device_code")
#         device      = get_device(db, device_code) if device_code else None
#         return {
#             "logged_in":     True,
#             "google_id":     payload["google_id"],
#             "device_code":   device_code,
#             "device_active": device.is_active if device else False,
#             "claimed":       device.claimed   if device else False,
#             "last_seen":     device.last_seen.isoformat() if device and device.last_seen else None,
#         }


# @router.post("/revoke")
# def revoke(authorization: str = Header(None)):
#     """User disconnects their glasses — Pi stops working immediately."""
#     if not authorization or not authorization.startswith("Bearer "):
#         raise HTTPException(401, "Not logged in")
#     token   = authorization.split(" ", 1)[1]
#     payload = verify_session(token)
#     code    = payload.get("device_code")
#     if not code:
#         raise HTTPException(400, "No device linked")
#     with get_db() as db:
#         revoke_device(db, code)
#     return {"status": "revoked"}


# @router.post("/logout")
# def logout():
#     # Session is in localStorage — client just deletes it
#     # Nothing to do server-side
#     return {"status": "ok"}


# backend/auth.py
import os, json, time
from fastapi import APIRouter, HTTPException, Response, Cookie, Header
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from cryptography.fernet import Fernet
from jose import jwt, JWTError
from pydantic import BaseModel

from database import (
    get_db, claim_device, upsert_user, get_device, revoke_device,
    save_oauth_state, consume_oauth_state,   # ← DB-based state, not memory
)

router = APIRouter()

# ── Config ────────────────────────────────────────────────────────────────────
CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID")
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
FERNET_KEY    = os.getenv("FERNET_KEY", "").encode()
JWT_SECRET    = os.getenv("JWT_SECRET", "")
FRONTEND_URL  = os.getenv("FRONTEND_URL", "http://localhost:5173")
BACKEND_URL   = os.getenv("BACKEND_URL",  "http://localhost:8000")
IS_PROD       = os.getenv("ENV", "dev") == "production"
REDIRECT_URI  = f"{BACKEND_URL}/auth/callback"

SCOPES = ["https://www.googleapis.com/auth/drive.file", "openid", "email", "profile"]


# ── Crypto ────────────────────────────────────────────────────────────────────

def encrypt(data: str) -> str:
    return Fernet(FERNET_KEY).encrypt(data.encode()).decode()

def decrypt(data: str) -> str:
    return Fernet(FERNET_KEY).decrypt(data.encode()).decode()

def make_session_jwt(google_id: str, device_code: str) -> str:
    return jwt.encode(
        {"google_id": google_id, "device_code": device_code,
         "exp": time.time() + 86400 * 7},
        JWT_SECRET, algorithm="HS256"
    )

def verify_session(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except JWTError:
        raise HTTPException(401, "Session expired — please log in again")


# ── Drive service ─────────────────────────────────────────────────────────────

def get_drive_service(device_code: str, db):
    """
    Builds a Google Drive client using the token stored for this device.
    Identical to your original OCR script — token comes from DB not token.json.
    Auto-refreshes expired tokens and saves back to DB.
    """
    from database import get_token, update_token

    encrypted = get_token(db, device_code)
    if not encrypted:
        raise HTTPException(403, "Device not set up or has been revoked")

    token_json = json.loads(decrypt(encrypted))

    creds = Credentials(
        token=token_json.get("token"),
        refresh_token=token_json.get("refresh_token"),
        token_uri=token_json.get("token_uri", "https://oauth2.googleapis.com/token"),
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        scopes=SCOPES,
    )

    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        updated = {
            "token":         creds.token,
            "refresh_token": creds.refresh_token,
            "token_uri":     creds.token_uri,
            "scopes":        list(creds.scopes or []),
        }
        update_token(db, device_code, encrypt(json.dumps(updated)))
        db.commit()

    return build("drive", "v3", credentials=creds)


# ── OAuth Flow ────────────────────────────────────────────────────────────────

def _make_flow():
    return Flow.from_client_config(
        {"web": {
            "client_id":     CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "auth_uri":      "https://accounts.google.com/o/oauth2/auth",
            "token_uri":     "https://oauth2.googleapis.com/token",
        }},
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI,
    )


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/google/url")
def get_auth_url():
    """
    Step 1: Frontend requests Google login URL.
    Saves state to DB — survives server restarts and multiple instances.
    """
    flow = _make_flow()
    auth_url, state = flow.authorization_url(
        access_type="offline",
        prompt="consent",
    )

    # Save state to DB (not memory — production safe)
    with get_db() as db:
        save_oauth_state(db, state, ttl_seconds=300)  # 5 min TTL

    return {"url": auth_url}


@router.get("/callback")
def oauth_callback(code: str, state: str):
    """
    Step 2: Google redirects here after user approves.
    Validates state from DB (one-time use), saves user + encrypted token.
    Redirects to frontend /setup with a short-lived pending JWT in URL.
    """
    # Validate and consume state from DB
    with get_db() as db:
        valid = consume_oauth_state(db, state)

    if not valid:
        raise HTTPException(400, "Invalid or expired login session — please try again")

    flow = _make_flow()
    flow.fetch_token(code=code)
    creds = flow.credentials

    # Get user info from Google
    info      = build("oauth2", "v2", credentials=creds).userinfo().get().execute()
    google_id = info["id"]
    email     = info["email"]
    name      = info.get("name", "")

    # Build token JSON — same structure as token.json in your original OCR script
    token_data = {
        "token":         creds.token,
        "refresh_token": creds.refresh_token,
        "token_uri":     creds.token_uri,
        "scopes":        list(creds.scopes or []),
    }
    encrypted_token = encrypt(json.dumps(token_data))

    # Save user to DB
    with get_db() as db:
        upsert_user(db, google_id, email, name)

    # Pack everything into a short-lived JWT
    # Frontend reads this from the URL param after redirect
    pending_jwt = jwt.encode(
        {
            "google_id": google_id,
            "email":     email,
            "name":      name,
            "token":     encrypted_token,
            "exp":       time.time() + 600,  # 10 minutes to enter device code
        },
        JWT_SECRET,
        algorithm="HS256",
    )

    # Redirect to frontend setup page — JWT in URL param, no cookies needed
    return RedirectResponse(url=f"{FRONTEND_URL}/setup?pending={pending_jwt}")


class SetupBody(BaseModel):
    device_code: str
    pending_jwt: str    # Short-lived JWT from URL param


@router.post("/setup")
def complete_setup(body: SetupBody):
    """
    Step 3: User enters their card code.
    Decodes pending JWT, links Google token to device in DB.
    Returns a session JWT stored in localStorage by frontend.
    """
    try:
        data = jwt.decode(body.pending_jwt, JWT_SECRET, algorithms=["HS256"])
    except JWTError:
        raise HTTPException(400, "Session expired — please sign in with Google again")

    google_id = data["google_id"]
    email     = data["email"]
    name      = data["name"]
    enc_token = data["token"]
    code      = body.device_code.strip().upper()

    with get_db() as db:
        device = get_device(db, code)
        if not device:
            raise HTTPException(404, "Device code not found — check the code on your card")
        if device.claimed and device.user_email != email:
            raise HTTPException(409, "This device is already linked to another account")

        claim_device(db, code, enc_token, email)
        upsert_user(db, google_id, email, name, device_code=code)

    session_token = make_session_jwt(google_id, code)
    return {
        "status":        "ok",
        "device_code":   code,
        "session_token": session_token,
    }


@router.get("/me")
def get_me(authorization: str = Header(None)):
    """
    Returns current user info.
    Reads session JWT from Authorization header (stored in localStorage).
    """
    if not authorization or not authorization.startswith("Bearer "):
        return {"logged_in": False}
    token = authorization.split(" ", 1)[1]
    try:
        payload = verify_session(token)
    except HTTPException:
        return {"logged_in": False}

    with get_db() as db:
        device_code = payload.get("device_code")
        device      = get_device(db, device_code) if device_code else None
        return {
            "logged_in":     True,
            "google_id":     payload["google_id"],
            "device_code":   device_code,
            "device_active": device.is_active if device else False,
            "claimed":       device.claimed   if device else False,
            "last_seen":     device.last_seen.isoformat() if device and device.last_seen else None,
        }


@router.post("/revoke")
def revoke(authorization: str = Header(None)):
    """User disconnects their glasses — Pi stops working immediately."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Not logged in")
    token   = authorization.split(" ", 1)[1]
    payload = verify_session(token)
    code    = payload.get("device_code")
    if not code:
        raise HTTPException(400, "No device linked")
    with get_db() as db:
        revoke_device(db, code)
    return {"status": "revoked"}


@router.post("/logout")
def logout():
    # Session is in localStorage — client just deletes it
    # Nothing to do server-side
    return {"status": "ok"}
