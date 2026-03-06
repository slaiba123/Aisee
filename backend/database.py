# # backend/database.py
# # Three tables: devices + users + oauth_states
# # Supabase (PostgreSQL) in production, SQLite for local dev

# import os
# from datetime import datetime, timedelta
# from sqlalchemy import create_engine, Column, String, Boolean, Text, DateTime, ForeignKey
# from sqlalchemy.orm import declarative_base, sessionmaker, Session
# from contextlib import contextmanager

# DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./aisee.db")

# engine = create_engine(
#     DATABASE_URL,
#     connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
#     pool_pre_ping=True,
# )
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Base = declarative_base()


# # ── Models ────────────────────────────────────────────────────────────────────

# class Device(Base):
#     """
#     One row per Pi you manufacture.
#     YOU insert this row before shipping the Pi.
#     google_token stays NULL until user completes setup.
#     """
#     __tablename__ = "devices"

#     device_code  = Column(String(16),  primary_key=True)
#     pi_serial    = Column(String(64),  unique=True, nullable=False)
#     google_token = Column(Text,        nullable=True)    # Fernet-encrypted OAuth token JSON
#     claimed      = Column(Boolean,     default=False)
#     user_email   = Column(String(255), nullable=True)
#     created_at   = Column(DateTime,    default=datetime.utcnow)
#     claimed_at   = Column(DateTime,    nullable=True)
#     last_seen    = Column(DateTime,    nullable=True)
#     is_active    = Column(Boolean,     default=True)     # False = revoked


# class User(Base):
#     """One row per user who signs in with Google."""
#     __tablename__ = "users"

#     google_id    = Column(String(64),  primary_key=True)
#     email        = Column(String(255), unique=True, nullable=False)
#     name         = Column(String(255), nullable=True)
#     device_code  = Column(String(16),  ForeignKey("devices.device_code"), nullable=True)
#     created_at   = Column(DateTime,    default=datetime.utcnow)
#     last_login   = Column(DateTime,    default=datetime.utcnow)


# class OAuthState(Base):
#     """
#     Stores OAuth state strings in DB instead of memory.
#     Production-safe: survives server restarts + multiple instances.
#     Each state is one-time use and expires in 5 minutes.
#     """
#     __tablename__ = "oauth_states"

#     state      = Column(String(256), primary_key=True)
#     expires_at = Column(DateTime,    nullable=False)
#     created_at = Column(DateTime,    default=datetime.utcnow)


# # ── Setup ─────────────────────────────────────────────────────────────────────

# def init_db():
#     Base.metadata.create_all(bind=engine)
#     print("✓ Database ready")


# @contextmanager
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#         db.commit()
#     except Exception:
#         db.rollback()
#         raise
#     finally:
#         db.close()


# # ── OAuth State CRUD ──────────────────────────────────────────────────────────

# def save_oauth_state(db: Session, state: str, ttl_seconds: int = 300):
#     """Store a new OAuth state. Called when generating the Google login URL."""
#     # Clean up any expired states first
#     db.query(OAuthState).filter(
#         OAuthState.expires_at < datetime.utcnow()
#     ).delete()

#     record = OAuthState(
#         state=state,
#         expires_at=datetime.utcnow() + timedelta(seconds=ttl_seconds)
#     )
#     db.add(record)


# def consume_oauth_state(db: Session, state: str) -> bool:
#     """
#     Validate and consume a state string (one-time use).
#     Returns True if valid, False if not found or expired.
#     Deletes the record after use regardless.
#     """
#     record = db.query(OAuthState).filter(OAuthState.state == state).first()

#     if not record:
#         return False  # Never existed

#     # Delete it — one time use whether valid or not
#     db.delete(record)

#     if record.expires_at < datetime.utcnow():
#         return False  # Existed but expired

#     return True  # Valid


# # ── Device CRUD ───────────────────────────────────────────────────────────────

# def get_device(db: Session, device_code: str) -> Device | None:
#     return db.query(Device).filter(Device.device_code == device_code).first()

# def claim_device(db: Session, device_code: str,
#                  encrypted_token: str, user_email: str) -> Device:
#     device = get_device(db, device_code)
#     if not device:
#         raise ValueError("Device code not found")
#     if not device.is_active:
#         raise ValueError("Device has been revoked")
#     device.google_token = encrypted_token
#     device.claimed      = True
#     device.user_email   = user_email
#     device.claimed_at   = datetime.utcnow()
#     return device

# def get_token(db: Session, device_code: str) -> str | None:
#     device = db.query(Device).filter(
#         Device.device_code == device_code,
#         Device.claimed     == True,
#         Device.is_active   == True,
#     ).first()
#     return device.google_token if device else None

# def touch_device(db: Session, device_code: str):
#     db.query(Device).filter(Device.device_code == device_code).update(
#         {"last_seen": datetime.utcnow()}
#     )

# def update_token(db: Session, device_code: str, encrypted_token: str):
#     db.query(Device).filter(Device.device_code == device_code).update(
#         {"google_token": encrypted_token}
#     )

# def revoke_device(db: Session, device_code: str):
#     db.query(Device).filter(Device.device_code == device_code).update(
#         {"is_active": False, "google_token": None}
#     )

# def reset_device(db: Session, device_code: str):
#     db.query(Device).filter(Device.device_code == device_code).update({
#         "claimed": False, "google_token": None,
#         "user_email": None, "is_active": True, "claimed_at": None,
#     })


# # ── User CRUD ─────────────────────────────────────────────────────────────────

# def upsert_user(db: Session, google_id: str, email: str,
#                 name: str, device_code: str = None) -> User:
#     user = db.query(User).filter(User.google_id == google_id).first()
#     if user:
#         user.last_login  = datetime.utcnow()
#         if device_code:
#             user.device_code = device_code
#     else:
#         user = User(google_id=google_id, email=email,
#                     name=name, device_code=device_code)
#         db.add(user)
#     return user


# backend/database.py
# Three tables: devices + users + oauth_states
# Supabase (PostgreSQL) in production, SQLite for local dev

import os
from datetime import datetime, timedelta
from sqlalchemy import create_engine, Column, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from contextlib import contextmanager

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./aisee.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ── Models ────────────────────────────────────────────────────────────────────

class Device(Base):
    """
    One row per Pi you manufacture.
    YOU insert this row before shipping the Pi.
    google_token stays NULL until user completes setup.
    """
    __tablename__ = "devices"

    device_code  = Column(String(16),  primary_key=True)
    pi_serial    = Column(String(64),  unique=True, nullable=False)
    google_token = Column(Text,        nullable=True)    # Fernet-encrypted OAuth token JSON
    claimed      = Column(Boolean,     default=False)
    user_email   = Column(String(255), nullable=True)
    created_at   = Column(DateTime,    default=datetime.utcnow)
    claimed_at   = Column(DateTime,    nullable=True)
    last_seen    = Column(DateTime,    nullable=True)
    is_active    = Column(Boolean,     default=True)     # False = revoked


class User(Base):
    """One row per user who signs in with Google."""
    __tablename__ = "users"

    google_id    = Column(String(64),  primary_key=True)
    email        = Column(String(255), unique=True, nullable=False)
    name         = Column(String(255), nullable=True)
    device_code  = Column(String(16),  ForeignKey("devices.device_code"), nullable=True)
    created_at   = Column(DateTime,    default=datetime.utcnow)
    last_login   = Column(DateTime,    default=datetime.utcnow)


class OAuthState(Base):
    """
    Stores OAuth state strings in DB instead of memory.
    Production-safe: survives server restarts + multiple instances.
    Each state is one-time use and expires in 5 minutes.
    """
    __tablename__ = "oauth_states"

    state      = Column(String(256), primary_key=True)
    expires_at = Column(DateTime,    nullable=False)
    created_at = Column(DateTime,    default=datetime.utcnow)


# ── Setup ─────────────────────────────────────────────────────────────────────

def init_db():
    Base.metadata.create_all(bind=engine)
    print("✓ Database ready")


@contextmanager
def get_db():
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


# ── OAuth State CRUD ──────────────────────────────────────────────────────────

def save_oauth_state(db: Session, state: str, ttl_seconds: int = 300):
    """Store a new OAuth state. Called when generating the Google login URL."""
    # Clean up any expired states first
    db.query(OAuthState).filter(
        OAuthState.expires_at < datetime.utcnow()
    ).delete()

    record = OAuthState(
        state=state,
        expires_at=datetime.utcnow() + timedelta(seconds=ttl_seconds)
    )
    db.add(record)


def consume_oauth_state(db: Session, state: str) -> bool:
    """
    Validate and consume a state string (one-time use).
    Returns True if valid, False if not found or expired.
    Deletes the record after use regardless.
    """
    record = db.query(OAuthState).filter(OAuthState.state == state).first()

    if not record:
        return False  # Never existed

    # Delete it — one time use whether valid or not
    db.delete(record)

    if record.expires_at < datetime.utcnow():
        return False  # Existed but expired

    return True  # Valid


# ── Device CRUD ───────────────────────────────────────────────────────────────

def get_device(db: Session, device_code: str) -> Device | None:
    return db.query(Device).filter(Device.device_code == device_code).first()

def claim_device(db: Session, device_code: str,
                 encrypted_token: str, user_email: str) -> Device:
    device = get_device(db, device_code)
    if not device:
        raise ValueError("Device code not found")
    if not device.is_active:
        raise ValueError("Device has been revoked")
    device.google_token = encrypted_token
    device.claimed      = True
    device.user_email   = user_email
    device.claimed_at   = datetime.utcnow()
    return device

def get_token(db: Session, device_code: str) -> str | None:
    device = db.query(Device).filter(
        Device.device_code == device_code,
        Device.claimed     == True,
        Device.is_active   == True,
    ).first()
    return device.google_token if device else None

def touch_device(db: Session, device_code: str):
    db.query(Device).filter(Device.device_code == device_code).update(
        {"last_seen": datetime.utcnow()}
    )

def update_token(db: Session, device_code: str, encrypted_token: str):
    db.query(Device).filter(Device.device_code == device_code).update(
        {"google_token": encrypted_token}
    )

def revoke_device(db: Session, device_code: str):
    db.query(Device).filter(Device.device_code == device_code).update(
        {"is_active": False, "google_token": None}
    )

def reset_device(db: Session, device_code: str):
    db.query(Device).filter(Device.device_code == device_code).update({
        "claimed": False, "google_token": None,
        "user_email": None, "is_active": True, "claimed_at": None,
    })


# ── User CRUD ─────────────────────────────────────────────────────────────────

def upsert_user(db: Session, google_id: str, email: str,
                name: str, device_code: str = None) -> User:
    user = db.query(User).filter(User.google_id == google_id).first()
    if user:
        user.last_login  = datetime.utcnow()
        if device_code:
            user.device_code = device_code
    else:
        user = User(google_id=google_id, email=email,
                    name=name, device_code=device_code)
        db.add(user)
    return user
