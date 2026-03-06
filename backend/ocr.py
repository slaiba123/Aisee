# # backend/ocr.py
# # Core OCR logic — identical to your original script
# # Difference: token comes from DB (by device_code) not from token.json file

# import io, os, time, tempfile
# from fastapi import APIRouter, HTTPException, Header
# from fastapi.responses import StreamingResponse
# from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload
# from gtts import gTTS
# from pydantic import BaseModel

# from database import get_db, touch_device
# from auth import get_drive_service

# router = APIRouter()


# @router.get("/status/{device_code}")
# def device_status(device_code: str):
#     """Pi calls this on boot to check if it's been set up yet."""
#     with get_db() as db:
#         from database import get_device
#         device = get_device(db, device_code)
#         if not device:
#             raise HTTPException(404, "Unknown device code")
#         return {"claimed": device.claimed, "active": device.is_active}


# class OcrRequest(BaseModel):
#     device_code: str    # "AIS-4829" — hardcoded in Pi, sent with every request
#     image_data:  str    # base64-encoded image bytes


# @router.post("/process")
# def process_ocr(body: OcrRequest):
#     """
#     Receives image from Pi with its device_code.
#     Looks up that device's Google token from DB.
#     Runs OCR using YOUR exact same logic from the original script.
#     Returns MP3 audio stream of the extracted Urdu text.
#     """
#     import base64

#     with get_db() as db:
#         # Get Drive service using this device's stored Google token
#         # This is the key step — same as build('drive','v3',credentials=creds)
#         # in your original script, but token comes from DB not token.json
#         try:
#             drive = get_drive_service(body.device_code, db)
#         except HTTPException as e:
#             raise e
#         except Exception as e:
#             raise HTTPException(403, f"Device auth failed: {str(e)}")

#         # Decode image
#         try:
#             image_bytes = base64.b64decode(body.image_data)
#         except Exception:
#             raise HTTPException(400, "Invalid image data")

#         # Save image to temp file
#         tmp_img = os.path.join(tempfile.gettempdir(), f"ocr_{body.device_code}_{int(time.time())}.jpg")
#         with open(tmp_img, "wb") as f:
#             f.write(image_bytes)

#         try:
#             # ── EXACT SAME LOGIC AS YOUR ORIGINAL SCRIPT ─────────────────────

#             # Upload image to Google Drive with OCR enabled
#             output_name   = f"AiSee OCR {int(time.time())}"
#             file_metadata = {
#                 "name":     output_name,
#                 "mimeType": "application/vnd.google-apps.document",
#             }
#             media = MediaFileUpload(tmp_img, resumable=True)

#             file = drive.files().create(
#                 body=file_metadata,
#                 media_body=media,
#                 ocrLanguage="ur",       # Urdu OCR — same as your script
#                 fields="id, name, webViewLink"
#             ).execute()

#             file_id = file.get("id")

#             # Wait for OCR to process — same as your script
#             time.sleep(3)

#             # Export as plain text — same as your script
#             request = drive.files().export_media(
#                 fileId=file_id,
#                 mimeType="text/plain"
#             )
#             fh = io.BytesIO()
#             downloader = MediaIoBaseDownload(fh, request)
#             done = False
#             while not done:
#                 _, done = downloader.next_chunk()

#             # Clean text — same as your script
#             extracted_text = fh.getvalue().decode("utf-8")
#             extracted_text = extracted_text.replace("\ufeff", "")   # Remove BOM
#             extracted_text = "\n".join(
#                 line for line in extracted_text.split("\n")
#                 if line.strip().replace("_", "").strip()
#             )

#             if not extracted_text.strip():
#                 raise HTTPException(422, "No text found in image")

#             # ── TEXT TO SPEECH — same as your script ─────────────────────────
#             tts = gTTS(text=extracted_text, lang="ur", slow=False)
#             audio_buffer = io.BytesIO()
#             tts.write_to_fp(audio_buffer)
#             audio_buffer.seek(0)

#             # Update Pi last_seen in DB
#             touch_device(db, body.device_code)

#             # Stream MP3 back to Pi
#             return StreamingResponse(
#                 audio_buffer,
#                 media_type="audio/mpeg",
#                 headers={"X-Extracted-Text": "ok"}  # First 200 chars in header
#             )

#         finally:
#             # Windows: explicitly close file handle before deleting
#             try:
#                 if 'media' in dir() and hasattr(media, '_fd') and media._fd:
#                     media._fd.close()
#             except Exception:
#                 pass
#             try:
#                 if os.path.exists(tmp_img):
#                     os.remove(tmp_img)
#             except Exception:
#                 pass  # Non-critical — temp file cleanup, ignore on Windows


# backend/ocr.py
# Core OCR logic — identical to your original script
# Difference: token comes from DB (by device_code) not from token.json file

import io, os, time, tempfile
from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import StreamingResponse
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload
from gtts import gTTS
from pydantic import BaseModel

from database import get_db, touch_device
from auth import get_drive_service

router = APIRouter()


@router.get("/status/{device_code}")
def device_status(device_code: str):
    """Pi calls this on boot to check if it's been set up yet."""
    with get_db() as db:
        from database import get_device
        device = get_device(db, device_code)
        if not device:
            raise HTTPException(404, "Unknown device code")
        return {"claimed": device.claimed, "active": device.is_active}


class OcrRequest(BaseModel):
    device_code: str    # "AIS-4829" — hardcoded in Pi, sent with every request
    image_data:  str    # base64-encoded image bytes


@router.post("/process")
def process_ocr(body: OcrRequest):
    """
    Receives image from Pi with its device_code.
    Looks up that device's Google token from DB.
    Runs OCR using YOUR exact same logic from the original script.
    Returns MP3 audio stream of the extracted Urdu text.
    """
    import base64

    with get_db() as db:
        # Get Drive service using this device's stored Google token
        # This is the key step — same as build('drive','v3',credentials=creds)
        # in your original script, but token comes from DB not token.json
        try:
            drive = get_drive_service(body.device_code, db)
        except HTTPException as e:
            raise e
        except Exception as e:
            raise HTTPException(403, f"Device auth failed: {str(e)}")

        # Decode image
        try:
            image_bytes = base64.b64decode(body.image_data)
        except Exception:
            raise HTTPException(400, "Invalid image data")

        # Save image to temp file
        tmp_img = os.path.join(tempfile.gettempdir(), f"ocr_{body.device_code}_{int(time.time())}.jpg")
        with open(tmp_img, "wb") as f:
            f.write(image_bytes)

        try:
            # ── EXACT SAME LOGIC AS YOUR ORIGINAL SCRIPT ─────────────────────

            # Upload image to Google Drive with OCR enabled
            output_name   = f"AiSee OCR {int(time.time())}"
            file_metadata = {
                "name":     output_name,
                "mimeType": "application/vnd.google-apps.document",
            }
            media = MediaFileUpload(tmp_img, resumable=True)

            file = drive.files().create(
                body=file_metadata,
                media_body=media,
                ocrLanguage="ur",       # Urdu OCR — same as your script
                fields="id, name, webViewLink"
            ).execute()

            file_id = file.get("id")

            # Wait for OCR to process — same as your script
            time.sleep(3)

            # Export as plain text — same as your script
            request = drive.files().export_media(
                fileId=file_id,
                mimeType="text/plain"
            )
            fh = io.BytesIO()
            downloader = MediaIoBaseDownload(fh, request)
            done = False
            while not done:
                _, done = downloader.next_chunk()

            # Clean text — same as your script
            extracted_text = fh.getvalue().decode("utf-8")
            extracted_text = extracted_text.replace("\ufeff", "")   # Remove BOM
            extracted_text = "\n".join(
                line for line in extracted_text.split("\n")
                if line.strip().replace("_", "").strip()
            )

            if not extracted_text.strip():
                raise HTTPException(422, "No text found in image")

            # ── TEXT TO SPEECH — same as your script ─────────────────────────
            tts = gTTS(text=extracted_text, lang="ur", slow=False)
            audio_buffer = io.BytesIO()
            tts.write_to_fp(audio_buffer)
            audio_buffer.seek(0)

            # Update Pi last_seen in DB
            touch_device(db, body.device_code)

            # Stream MP3 back to Pi
            return StreamingResponse(
                audio_buffer,
                media_type="audio/mpeg",
                headers={"X-Extracted-Text": "ok"}  # First 200 chars in header
            )

        finally:
            # Windows: explicitly close file handle before deleting
            try:
                if 'media' in dir() and hasattr(media, '_fd') and media._fd:
                    media._fd.close()
            except Exception:
                pass
            try:
                if os.path.exists(tmp_img):
                    os.remove(tmp_img)
            except Exception:
                pass  # Non-critical — temp file cleanup, ignore on Windows
