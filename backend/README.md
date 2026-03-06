# AiSee — Complete Setup & Deployment Guide

## Project Structure
```
aisee/
├── backend/
│   ├── main.py          ← FastAPI entry point
│   ├── database.py      ← SQLAlchemy models (devices + users)
│   ├── auth.py          ← Google OAuth + device linking
│   ├── ocr.py           ← OCR logic (your original script adapted)
│   ├── admin.py         ← CLI to pre-register Pis before shipping
│   ├── requirements.txt
│   └── .env.example
├── pi_client/
│   ├── pi_client.py     ← Pre-installed on every Pi
│   └── aisee.service    ← Systemd autostart
└── frontend/
    └── src/
        ├── api.js        ← API calls
        └── SetupPage.jsx ← Setup UI (2 steps: Google login + enter code)
```

---

## ONE-TIME CLOUD SETUP (you do this once)

### 1. Google Cloud Console
```
1. Go to console.cloud.google.com
2. New project → name it "AiSee"
3. APIs & Services → Library → Enable:
     ✅ Google Drive API
     ✅ Google Docs API
4. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
     Type: Web application
     Authorized redirect URIs:
       https://aisee-api.railway.app/auth/callback
5. Copy CLIENT_ID and CLIENT_SECRET
```

### 2. Supabase (Free Database)
```
1. Go to supabase.com → New project
2. Settings → Database → Connection string (URI mode)
3. Copy the connection string → this is your DATABASE_URL
   Looks like: postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

### 3. Railway (Free Backend Hosting)
```
1. Go to railway.app → New project → Deploy from GitHub
2. Point to your backend folder
3. Add these environment variables in Railway dashboard:
     GOOGLE_CLIENT_ID      = (from Google Cloud)
     GOOGLE_CLIENT_SECRET  = (from Google Cloud)
     FERNET_KEY            = (generate below)
     JWT_SECRET            = (generate below)
     DATABASE_URL          = (from Supabase)
     FRONTEND_URL          = https://aisee.vercel.app
     BACKEND_URL           = https://aisee-api.railway.app
     ENV                   = production
4. Railway gives you a URL like: https://aisee-api.railway.app

Generate keys (run once on your laptop):
   python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
   python -c "import secrets; print(secrets.token_hex(32))"
```

### 4. Vercel (Free Frontend Hosting)
```
1. Go to vercel.com → New project → Import from GitHub
2. Point to your frontend folder
3. Add environment variable:
     VITE_API_URL = https://aisee-api.railway.app
4. Vercel gives you: https://aisee.vercel.app
```

---

## FOR EACH PI YOU MANUFACTURE

### Step 1: Register in DB before shipping
```bash
# On your laptop (with DATABASE_URL set):
python admin.py add AIS-4829 ABC123DEF456
#                   ^code     ^pi serial

# Or generate multiple at once:
python admin.py bulk 50
```

### Step 2: Flash the Pi
```
1. Flash Raspberry Pi OS to SD card
2. Install dependencies:
     pip3 install requests gtts picamera2
3. Copy pi_client.py to /home/pi/aisee/
4. Edit pi_client.py — set DEVICE_CODE to this Pi's code:
     DEVICE_CODE = "AIS-4829"
     SERVER_URL  = "https://aisee-api.railway.app"
5. Install autostart service:
     sudo cp aisee.service /etc/systemd/system/
     sudo systemctl enable aisee
```

### Step 3: Ship
```
Box contains:
  ✅ Pi 5 (with pi_client.py pre-installed, DEVICE_CODE hardcoded)
  ✅ Card printed with: "Your device code: AIS-4829"
```

---

## USER EXPERIENCE (what the user does)

```
1. Plugs in glasses
2. Glasses announce: "Visit aisee.com. Enter code A I S 4 8 2 9"
3. User opens aisee.com/setup on phone
4. Clicks "Continue with Google" → approves permissions
5. Types AIS-4829 from card
6. Done. Glasses announce "Setup complete!"
```

Total user setup time: ~2 minutes. No technical knowledge needed.

---

## DAILY USE (automatic, no user action)

```
User wears glasses
Camera captures text
Pi sends {device_code + image} to server
Server:
  1. Looks up AIS-4829 in DB
  2. Gets encrypted Google token
  3. Decrypts → builds Drive service (same as your OCR script)
  4. Uploads image → Google OCR → gets Urdu text
  5. gTTS → MP3
  6. Streams audio back to Pi
Pi plays audio through speaker
```

---

## ADMIN COMMANDS

```bash
# See all devices
python admin.py list

# Reset a device (let it be claimed again)
python admin.py reset AIS-4829
```

---

## ADD /ocr/status ENDPOINT (needed by Pi)
Add this to backend/ocr.py:

```python
@router.get("/status/{device_code}")
def device_status(device_code: str):
    with get_db() as db:
        device = get_device(db, device_code)
        if not device:
            raise HTTPException(404, "Unknown device")
        return {"claimed": device.claimed, "active": device.is_active}
```

---

## SECURITY SUMMARY

```
Printed card stolen before setup  → attacker can claim it first
                                    FIX: user calls you → admin.py reset → re-ship card

Printed card stolen after setup   → already claimed → useless

Pi stolen                         → attacker can send OCR requests as that user
                                    FIX: user clicks "Disconnect Glasses" on website
                                         google_token deleted from DB immediately
                                         Pi starts getting 403 errors

Google token in Supabase          → encrypted with Fernet (AES-128)
                                    even if DB is breached, unreadable without FERNET_KEY

Your API keys                     → only in Railway dashboard
                                    never in code, never on Pi, never seen by users
```
