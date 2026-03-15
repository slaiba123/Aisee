# backend/ocr.py
# Core OCR logic — Google Drive for OCR, gTTS for Text-to-Speech
# Smart Urdu/English splitting — each language segment gets its own gTTS call
# then audio chunks are concatenated into a single MP3 stream.

import io, os, re, time, tempfile
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload
from gtts import gTTS
from pydantic import BaseModel

from database import get_db, touch_device, get_device
from auth import get_drive_service


# ── Router ────────────────────────────────────────────────────────────────────

router = APIRouter()


# ── Language Detection + Splitting ───────────────────────────────────────────

URDU_RE = re.compile(r"[\u0600-\u06ff\u0750-\u077f\ufb50-\ufdff\ufe70-\ufeFF]+")
ENG_RE  = re.compile(r"[a-zA-Z0-9][a-zA-Z0-9\s,.\-']*")


def split_by_language(text: str) -> list[tuple[str, str]]:
    """
    Split mixed Urdu/English text into ordered segments, each tagged with
    its language ('ur' or 'en').

    Example:
        "یہ ایک test ہے"
        → [('یہ ایک ', 'ur'), ('test', 'en'), (' ہے', 'ur')]

    Rules:
    - A segment is 'ur' if it contains any Urdu characters
    - A segment is 'en' if it contains only ASCII letters/digits/punctuation
    - Pure whitespace/punctuation segments are merged into the previous segment
    - Consecutive segments of the same language are merged
    """
    if not text.strip():
        return []

    segments = []
    i = 0

    while i < len(text):
        # Try to match Urdu at current position
        m_urdu = URDU_RE.match(text, i)
        if m_urdu:
            segments.append((m_urdu.group(), "ur"))
            i = m_urdu.end()
            continue

        # Try to match English word(s) at current position
        m_eng = ENG_RE.match(text, i)
        if m_eng:
            segments.append((m_eng.group(), "en"))
            i = m_eng.end()
            continue

        # Whitespace or punctuation — append to last segment or skip
        char = text[i]
        if segments:
            segments[-1] = (segments[-1][0] + char, segments[-1][1])
        i += 1

    # Merge consecutive same-language segments
    merged = []
    for seg_text, lang in segments:
        if merged and merged[-1][1] == lang:
            merged[-1] = (merged[-1][0] + seg_text, lang)
        else:
            merged.append((seg_text, lang))

    # Filter out segments that are only whitespace/punctuation (no speakable content)
    result = []
    for seg_text, lang in merged:
        stripped = seg_text.strip()
        if stripped and re.search(r"[\w\u0600-\u06ff]", stripped):
            result.append((seg_text.strip(), lang))

    return result


# ── TTS ───────────────────────────────────────────────────────────────────────

def _gtts_segment(text: str, lang: str) -> bytes:
    """Convert a single text segment to MP3 bytes using gTTS."""
    tts = gTTS(text=text, lang=lang, slow=False)
    buf = io.BytesIO()
    tts.write_to_fp(buf)
    buf.seek(0)
    return buf.read()


def _concatenate_mp3s(mp3_chunks: list[bytes]) -> io.BytesIO:
    """
    Concatenate multiple MP3 byte chunks into a single BytesIO buffer.
    Simple byte concatenation works for MP3 (each chunk is a valid MP3 frame sequence).
    """
    buf = io.BytesIO()
    for chunk in mp3_chunks:
        buf.write(chunk)
    buf.seek(0)
    return buf


def text_to_speech(text: str) -> io.BytesIO:
    """
    Convert mixed Urdu/English text to a single MP3 stream.

    Strategy:
    1. Split text into language-tagged segments
    2. Call gTTS separately for each segment with the correct lang code
    3. Concatenate all MP3 chunks into one buffer
    4. Fall back to full-text Urdu TTS if splitting fails

    This gives natural pronunciation for both scripts without needing
    edge-tts or any paid API.
    """
    segments = split_by_language(text)

    # If no segments detected, treat entire text as Urdu
    if not segments:
        segments = [(text, "ur")]

    print(f"🗣️  TTS segments ({len(segments)} total):")
    for seg_text, lang in segments:
        preview = seg_text[:40] + ("..." if len(seg_text) > 40 else "")
        print(f"   [{lang}] {preview}")

    mp3_chunks = []
    errors     = []

    for seg_text, lang in segments:
        try:
            chunk = _gtts_segment(seg_text, lang)
            mp3_chunks.append(chunk)
        except Exception as e:
            errors.append(f"[{lang}] '{seg_text[:30]}': {e}")
            # Try the other language as fallback for this segment
            fallback_lang = "en" if lang == "ur" else "ur"
            try:
                chunk = _gtts_segment(seg_text, fallback_lang)
                mp3_chunks.append(chunk)
                print(f"   ⚠️  Fell back to [{fallback_lang}] for segment")
            except Exception:
                print(f"   ❌ Skipping segment — both langs failed: {seg_text[:30]}")

    if not mp3_chunks:
        # Everything failed — last resort: full text as Urdu
        print("⚠️  All segments failed, trying full text as Urdu...")
        try:
            chunk = _gtts_segment(text, "ur")
            mp3_chunks.append(chunk)
        except Exception as e:
            raise HTTPException(500, f"TTS completely failed: {str(e)}")

    if errors:
        print(f"⚠️  TTS had {len(errors)} segment error(s) (recovered)")

    return _concatenate_mp3s(mp3_chunks)


# ── OCR Text Cleaning ─────────────────────────────────────────────────────────

def _clean_ocr_text(raw: str) -> str:
    """
    Clean Google Drive OCR output before passing to TTS.
    Handles Urdu, English, and mixed text.
    """
    if not raw or not raw.strip():
        return ""

    t = raw.replace("\ufeff", "")                               # BOM
    t = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", t)   # control chars
    t = re.sub(r"[_\s]*_[_\s]*", " ", t)                       # underscores
    t = re.sub(r"[*#@&^~`<>{}\[\]\\]", "", t)                  # noise chars

    # Fix common OCR artifacts next to Urdu characters
    urdu = r"[\u0600-\u06ff\u0750-\u077f\ufb50-\ufdff\ufe70-\ufeFF]"
    t = re.sub(r"(?<=" + urdu + r")[lI1|/\\](?=" + urdu + r")", "", t)
    t = re.sub(r"(?<=\s)[lI1|/\\](?=\s)", " ", t)

    # Collapse duplicate punctuation
    t = re.sub(r"[\u06D4]{2,}", "\u06D4", t)   # ۔۔ → ۔
    t = re.sub(r"[\u060C]{2,}", "\u060C", t)   # ،، → ،
    t = re.sub(r"[\u061F]{2,}", "\u061F", t)   # ؟؟ → ؟
    t = re.sub(r"\.{3,}", ".", t)              # ... → .
    t = re.sub(r"-{2,}", " ", t)               # --- → space

    # Filter lines — keep only those with actual Urdu or English words
    urdu_p = re.compile(r"[\u0600-\u06ff\u0750-\u077f\ufb50-\ufdff\ufe70-\ufeFF]")
    eng_p  = re.compile(r"[a-zA-Z]{2,}")
    final  = []

    for line in t.split("\n"):
        s = re.sub(r"[ \t]+", " ", line).strip()
        if not s:
            final.append("")
            continue
        if urdu_p.search(s) or eng_p.search(s):
            final.append(s)
            continue
        if re.match(r"^[\d\s\u06F0-\u06F9\u0660-\u0669]+[\u06D4\.\,]?$", s):
            continue
        if re.match(r"^[^\w\u0600-\u06ff]+$", s):
            continue
        final.append(s)

    # Collapse multiple blank lines
    out, prev_blank = [], False
    for l in final:
        blank = not l.strip()
        if blank and prev_blank:
            continue
        out.append(l)
        prev_blank = blank

    result = " ".join(l for l in out if l.strip())
    result = re.sub(r"\s+", " ", result).strip()
    return result


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/status/{device_code}")
def device_status(device_code: str):
    """Pi calls this on boot to check if it's been set up yet."""
    with get_db() as db:
        device = get_device(db, device_code)
        if not device:
            raise HTTPException(404, "Unknown device code")
        return {"claimed": device.claimed, "active": device.is_active}


class OcrRequest(BaseModel):
    device_code: str   # "AIS-4829" — hardcoded in Pi
    image_data:  str   # base64-encoded image bytes


@router.post("/process")
def process_ocr(body: OcrRequest):
    """
    1. Receives image from Pi
    2. Uses device's stored Google token to run Drive OCR
    3. Cleans extracted text
    4. Splits by language, converts each segment with gTTS
    5. Concatenates MP3 chunks and streams back to Pi
    """
    import base64
    import traceback

    with get_db() as db:
        try:
            drive = get_drive_service(body.device_code, db)
        except HTTPException as e:
            raise e
        except Exception as e:
            raise HTTPException(403, f"Device auth failed: {str(e)}")

        try:
            image_bytes = base64.b64decode(body.image_data)
        except Exception:
            raise HTTPException(400, "Invalid image data")

        tmp_img = os.path.join(
            tempfile.gettempdir(),
            f"ocr_{body.device_code}_{int(time.time())}.jpg"
        )
        with open(tmp_img, "wb") as f:
            f.write(image_bytes)

        tmp_drive_file_id = None

        try:
            # ── Upload to Google Drive with OCR ───────────────────────────────
            file_metadata = {
                "name":     f"AiSee_OCR_{int(time.time())}",
                "mimeType": "application/vnd.google-apps.document",
            }
            media = MediaFileUpload(tmp_img, resumable=True)

            uploaded = drive.files().create(
                body=file_metadata,
                media_body=media,
                ocrLanguage="ur",
                fields="id"
            ).execute()

            tmp_drive_file_id = uploaded.get("id")

            # Wait for OCR processing
            time.sleep(3)

            # ── Export as plain text ──────────────────────────────────────────
            request = drive.files().export_media(
                fileId=tmp_drive_file_id,
                mimeType="text/plain"
            )
            fh = io.BytesIO()
            downloader = MediaIoBaseDownload(fh, request)
            done = False
            while not done:
                _, done = downloader.next_chunk()

            raw_text     = fh.getvalue().decode("utf-8")
            cleaned_text = _clean_ocr_text(raw_text)

            if not cleaned_text.strip():
                raise HTTPException(422, "No readable text found in image")

            print(f"\n📄 Extracted text ({len(cleaned_text)} chars):")
            print("="*60)
            print(cleaned_text)
            print("="*60)

            # ── Text to Speech (smart Urdu/English split + gTTS) ─────────────
            audio_buffer = text_to_speech(cleaned_text)

            touch_device(db, body.device_code)

            # Send extracted text in header so Pi can print it to terminal
            from urllib.parse import quote
            safe_text = quote(cleaned_text, safe="")

            return StreamingResponse(
                audio_buffer,
                media_type="audio/mpeg",
                headers={"X-Extracted-Text": safe_text},
            )

        except HTTPException:
            raise
        except Exception as e:
            traceback.print_exc()
            raise HTTPException(500, f"OCR pipeline failed: {str(e)}")

        finally:
            try:
                if os.path.exists(tmp_img):
                    os.remove(tmp_img)
            except Exception:
                pass

            # Clean up Google Drive temp file
            if tmp_drive_file_id:
                try:
                    drive.files().delete(fileId=tmp_drive_file_id).execute()
                except Exception:
                    pass


#####edge implementation

# # backend/ocr.py
# # Core OCR logic — Google Drive for OCR, edge-tts for high quality TTS
# # Handles mixed Urdu/English text natively (no splitting needed)

# import io, os, re, time, tempfile, asyncio
# from fastapi import APIRouter, HTTPException
# from fastapi.responses import StreamingResponse
# from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload
# import edge_tts
# from pydantic import BaseModel

# from database import get_db, touch_device
# from auth import get_drive_service


# # ── TTS Voice Config ──────────────────────────────────────────────────────────

# # Primary voice — natural Urdu male voice, also handles English words natively
# URDU_VOICE = "ur-PK-AsadNeural"

# # Fallback voices if primary fails
# FALLBACK_VOICES = [
#     "ur-PK-UzmaNeural",   # Urdu female
#     "en-US-AriaNeural",   # English fallback
# ]


# # ── TTS ───────────────────────────────────────────────────────────────────────

# async def _tts_async(text: str, voice: str) -> io.BytesIO:
#     """
#     Convert text to MP3 using edge-tts.
#     edge-tts uses Microsoft Edge's neural TTS engine — no API key needed.
#     The Urdu neural voice handles mixed Urdu/English text natively in one call.
#     """
#     communicate = edge_tts.Communicate(text, voice=voice)
#     buf = io.BytesIO()
#     async for chunk in communicate.stream():
#         if chunk["type"] == "audio":
#             buf.write(chunk["data"])
#     buf.seek(0)

#     if buf.getbuffer().nbytes == 0:
#         raise ValueError(f"edge-tts returned empty audio for voice {voice}")

#     return buf


# def text_to_speech(text: str) -> io.BytesIO:
#     """
#     Synchronous wrapper around async edge-tts.
#     Tries primary Urdu voice first, falls back if it fails.
#     """
#     try:
#         return asyncio.run(_tts_async(text, URDU_VOICE))
#     except Exception:
#         pass

#     for voice in FALLBACK_VOICES:
#         try:
#             return asyncio.run(_tts_async(text, voice))
#         except Exception:
#             continue

#     raise HTTPException(500, "TTS failed for all available voices")


# # ── OCR Text Cleaning ─────────────────────────────────────────────────────────

# def _clean_ocr_text(raw: str) -> str:
#     """
#     Clean Google Drive OCR output before passing to TTS.
#     Handles Urdu, English, and mixed text.
#     """
#     if not raw or not raw.strip():
#         return ""

#     t = raw.replace("\ufeff", "")                               # BOM
#     t = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", t)   # control chars
#     t = re.sub(r"[_\s]*_[_\s]*", " ", t)                       # underscores
#     t = re.sub(r"[*#@&^~`<>{}\[\]\\]", "", t)                  # noise chars

#     # Fix common OCR artifacts next to Urdu characters
#     urdu = r"[\u0600-\u06ff\u0750-\u077f\ufb50-\ufdff\ufe70-\ufeFF]"
#     t = re.sub(r"(?<=" + urdu + r")[lI1|/\\](?=" + urdu + r")", "", t)
#     t = re.sub(r"(?<=\s)[lI1|/\\](?=\s)", " ", t)

#     # Collapse duplicate punctuation
#     t = re.sub(r"[\u06D4]{2,}", "\u06D4", t)   # ۔۔ → ۔
#     t = re.sub(r"[\u060C]{2,}", "\u060C", t)   # ،، → ،
#     t = re.sub(r"[\u061F]{2,}", "\u061F", t)   # ؟؟ → ؟
#     t = re.sub(r"\.{3,}", ".", t)              # ... → .
#     t = re.sub(r"-{2,}", " ", t)              # --- → space

#     # Filter lines — keep only those with actual Urdu or English words
#     urdu_p = re.compile(r"[\u0600-\u06ff\u0750-\u077f\ufb50-\ufdff\ufe70-\ufeFF]")
#     eng_p  = re.compile(r"[a-zA-Z]{2,}")
#     final  = []

#     for line in t.split("\n"):
#         s = re.sub(r"[ \t]+", " ", line).strip()
#         if not s:
#             final.append("")
#             continue
#         if urdu_p.search(s) or eng_p.search(s):
#             final.append(s)
#             continue
#         if re.match(r"^[\d\s\u06F0-\u06F9\u0660-\u0669]+[\u06D4\.\,]?$", s):
#             continue
#         if re.match(r"^[^\w\u0600-\u06ff]+$", s):
#             continue
#         final.append(s)

#     # Collapse multiple blank lines
#     out, prev_blank = [], False
#     for l in final:
#         blank = not l.strip()
#         if blank and prev_blank:
#             continue
#         out.append(l)
#         prev_blank = blank

#     result = " ".join(l for l in out if l.strip())
#     result = re.sub(r"\s+", " ", result).strip()
#     return result


# # ── Router ────────────────────────────────────────────────────────────────────

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
#     device_code: str   # "AIS-4829" — hardcoded in Pi
#     image_data:  str   # base64-encoded image bytes


# @router.post("/process")
# def process_ocr(body: OcrRequest):
#     """
#     1. Receives image from Pi
#     2. Uses device's stored Google token to run Drive OCR
#     3. Cleans extracted text
#     4. Converts to speech with edge-tts (Microsoft Neural voices)
#     5. Streams MP3 back to Pi
#     """
#     import base64

#     with get_db() as db:
#         try:
#             drive = get_drive_service(body.device_code, db)
#         except HTTPException as e:
#             raise e
#         except Exception as e:
#             raise HTTPException(403, f"Device auth failed: {str(e)}")

#         try:
#             image_bytes = base64.b64decode(body.image_data)
#         except Exception:
#             raise HTTPException(400, "Invalid image data")

#         tmp_img = os.path.join(
#             tempfile.gettempdir(),
#             f"ocr_{body.device_code}_{int(time.time())}.jpg"
#         )
#         with open(tmp_img, "wb") as f:
#             f.write(image_bytes)

#         tmp_drive_file_id = None

#         try:
#             # ── Upload to Google Drive with OCR ───────────────────────────────
#             file_metadata = {
#                 "name":     f"AiSee_OCR_{int(time.time())}",
#                 "mimeType": "application/vnd.google-apps.document",
#             }
#             media = MediaFileUpload(tmp_img, resumable=True)

#             uploaded = drive.files().create(
#                 body=file_metadata,
#                 media_body=media,
#                 ocrLanguage="ur",
#                 fields="id"
#             ).execute()

#             tmp_drive_file_id = uploaded.get("id")

#             # Wait for OCR processing
#             time.sleep(3)

#             # ── Export as plain text ──────────────────────────────────────────
#             request = drive.files().export_media(
#                 fileId=tmp_drive_file_id,
#                 mimeType="text/plain"
#             )
#             fh = io.BytesIO()
#             downloader = MediaIoBaseDownload(fh, request)
#             done = False
#             while not done:
#                 _, done = downloader.next_chunk()

#             raw_text     = fh.getvalue().decode("utf-8")
#             cleaned_text = _clean_ocr_text(raw_text)

#             if not cleaned_text.strip():
#                 raise HTTPException(422, "No readable text found in image")

#             # ── Text to Speech (edge-tts) ─────────────────────────────────────
#             # ur-PK-AsadNeural reads Urdu natively and handles English words
#             # naturally without needing to split the text by language
#             audio_buffer = text_to_speech(cleaned_text)

#             touch_device(db, body.device_code)

#             # Send extracted text in header so Pi can print it to terminal
#             # HTTP headers must be ASCII — encode Urdu text as UTF-8 then percent-encode
#             from urllib.parse import quote
#             safe_text = quote(cleaned_text, safe="")

#             return StreamingResponse(
#                 audio_buffer,
#                 media_type="audio/mpeg",
#                 headers={"X-Extracted-Text": safe_text},
#             )

#         finally:
#             try:
#                 if os.path.exists(tmp_img):
#                     os.remove(tmp_img)
#             except Exception:
#                 pass

#             # Clean up Google Drive temp file
#             if tmp_drive_file_id:
#                 try:
#                     drive.files().delete(fileId=tmp_drive_file_id).execute()
#                 except Exception:
#                     pass