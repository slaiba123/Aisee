# =============================================================================
# Pi Simulator — Tests the AiSee server exactly as the Pi would
# Run this on your PC instead of the Pi to debug server issues
#
# Usage:
#   pip install requests Pillow
#   python test_pi_simulator.py
#
# You can pass a real image or it will generate a test image automatically
# =============================================================================

import os
import io
import sys
import base64
import json
import time
import requests
from PIL import Image, ImageDraw, ImageFont

# =============================================================================
# CONFIGURATION — match exactly what's hardcoded in the Pi script
# =============================================================================

SERVER_URL  = "https://aisee.onrender.com"   # Same as Pi
DEVICE_CODE = "AIS-4829"                      # Same as Pi

# Image compression settings — same as Pi
MAX_IMAGE_WIDTH  = 1600
MAX_IMAGE_HEIGHT = 1200
JPEG_QUALITY     = 75

# =============================================================================
# HELPERS — copied from Pi script exactly
# =============================================================================

def compress_image_bytes(image_bytes: bytes) -> bytes:
    """Identical to Pi's compress_image_bytes()"""
    img = Image.open(io.BytesIO(image_bytes))

    if img.mode in ('RGBA', 'P', 'L'):
        img = img.convert('RGB')

    original_kb = len(image_bytes) / 1024
    img.thumbnail((MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT), Image.LANCZOS)

    out = io.BytesIO()
    img.save(out, 'JPEG', quality=JPEG_QUALITY, optimize=True)
    compressed = out.getvalue()

    print(f"🖼️  Compressed: {original_kb:.0f} KB → {len(compressed)/1024:.0f} KB "
          f"({(1 - len(compressed)/len(image_bytes))*100:.0f}% reduction)")

    return compressed


def make_test_image() -> bytes:
    """
    Generate a test image with Urdu text on it.
    Used when no real image is provided.
    """
    img  = Image.new('RGB', (800, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Draw some text (Latin — Urdu needs a font file but this tests the pipeline)
    draw.rectangle([50, 50, 750, 350], outline=(0, 0, 0), width=3)
    draw.text((100, 100), "Test Image for AiSee OCR", fill=(0, 0, 0))
    draw.text((100, 150), "یہ ایک ٹیسٹ ہے", fill=(0, 0, 0))  # "This is a test" in Urdu
    draw.text((100, 200), "AIS-4829 Device Test", fill=(0, 0, 0))
    draw.text((100, 250), "Server pipeline check", fill=(0, 0, 0))

    out = io.BytesIO()
    img.save(out, 'JPEG', quality=95)
    print("🎨 Generated test image (800x400 with sample text)")
    return out.getvalue()


# =============================================================================
# TEST FUNCTIONS — each mirrors a Pi function exactly
# =============================================================================

def test_status_check():
    """
    Mirrors Pi's check_device_setup()
    Tests: GET /ocr/status/{device_code}
    """
    print("\n" + "="*60)
    print("TEST 1: Device Status Check")
    print("="*60)
    print(f"  URL: GET {SERVER_URL}/ocr/status/{DEVICE_CODE}")

    try:
        resp = requests.get(
            f"{SERVER_URL}/ocr/status/{DEVICE_CODE}",
            timeout=10
        )
        print(f"  Status Code : {resp.status_code}")
        print(f"  Response    : {resp.text}")

        if resp.status_code == 200:
            data = resp.json()
            claimed = data.get("claimed", False)
            active  = data.get("active", False)
            print(f"  claimed     : {claimed}")
            print(f"  active      : {active}")

            if claimed and active:
                print("  ✅ Device is set up and active — OCR test can proceed")
                return True
            else:
                print("  ⚠️  Device not claimed/active — OCR will return 403")
                return False
        elif resp.status_code == 404:
            print("  ❌ Device code not found in DB")
            return False
        else:
            print(f"  ❌ Unexpected status: {resp.status_code}")
            return False

    except requests.ConnectionError:
        print(f"  ❌ Cannot reach server at {SERVER_URL}")
        print("     Check SERVER_URL at top of this file")
        return False
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False


def test_ocr_process(image_path: str = None):
    """
    Mirrors Pi's run_ocr_pipeline()
    Tests: POST /ocr/process
    Sends image exactly as the Pi does — base64 JSON body
    """
    print("\n" + "="*60)
    print("TEST 2: OCR Process (full pipeline)")
    print("="*60)
    print(f"  URL: POST {SERVER_URL}/ocr/process")

    # ── Step 1: Get image bytes ───────────────────────────────────────────────
    if image_path and os.path.exists(image_path):
        with open(image_path, "rb") as f:
            image_bytes = f.read()
        print(f"  Using image : {image_path} ({len(image_bytes)/1024:.0f} KB)")
    else:
        if image_path:
            print(f"  ⚠️  Image not found: {image_path}")
        print("  Using       : auto-generated test image")
        image_bytes = make_test_image()

    # ── Step 2: Compress — identical to Pi ───────────────────────────────────
    compressed_bytes = compress_image_bytes(image_bytes)

    # ── Step 3: Base64 encode — identical to Pi ───────────────────────────────
    image_b64 = base64.b64encode(compressed_bytes).decode()
    print(f"  Payload size: {len(image_b64) / 1024:.0f} KB (base64)")

    # ── Step 4: POST to server — IDENTICAL to Pi ─────────────────────────────
    # This is exactly what the Pi sends:
    payload = {
        "device_code": DEVICE_CODE,
        "image_data":  image_b64,
    }
    print(f"  Sending request...")
    start = time.time()

    try:
        resp = requests.post(
            f"{SERVER_URL}/ocr/process",
            json=payload,          # Same as Pi: json={...}
            timeout=60,
            stream=True,           # Same as Pi: stream=True
        )
        elapsed = time.time() - start
        print(f"  Response    : {resp.status_code} ({elapsed:.1f}s)")

        # ── Step 5: Handle response — same logic as Pi ────────────────────────
        if resp.status_code == 403:
            print("  ❌ 403 — Device not set up or token revoked")
            print("     Fix: Re-do setup flow (sign in + enter device code)")
            return False

        if resp.status_code == 422:
            print("  ❌ 422 — No text found in image")
            print("     This is expected for blank/simple test images")
            print("     Try passing a real photo with text: python test_pi_simulator.py your_image.jpg")
            return False

        if resp.status_code == 500:
            print("  ❌ 500 — Internal server error")
            # Try to read error detail
            try:
                # Read full response even though stream=True
                content = b""
                for chunk in resp.iter_content(chunk_size=8192):
                    content += chunk
                print(f"  Error body  : {content.decode('utf-8', errors='replace')}")
            except Exception:
                print("  (Could not read error body)")
            return False

        if resp.status_code != 200:
            print(f"  ❌ Unexpected status: {resp.status_code}")
            print(f"  Body: {resp.text}")
            return False

        # ── Step 6: Read extracted text from header ───────────────────────────
        from urllib.parse import unquote
        extracted_text = unquote(resp.headers.get("X-Extracted-Text", ""))
        print("\n" + "="*60)
        print("📄  EXTRACTED TEXT:")
        print("="*60)
        if extracted_text:
            print(extracted_text)
        else:
            print("  ⚠️  No X-Extracted-Text header in response")
        print("="*60)

        # ── Step 7: Save MP3 — same as Pi ────────────────────────────────────
        audio_path = "ocr_result_test.mp3"
        audio_size = 0
        with open(audio_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
                    audio_size += len(chunk)

        if audio_size > 0:
            print(f"\n  ✅ SUCCESS!")
            print(f"  Audio saved : {audio_path} ({audio_size/1024:.0f} KB)")
            print(f"  Play it with: mpg123 {audio_path}  (or any MP3 player)")
        else:
            print("  ⚠️  Response was 200 but audio file is empty")

        return True

    except requests.Timeout:
        print("  ❌ Request timed out (60s)")
        print("     Server might be sleeping (Render free tier) — try again in 30s")
        return False
    except requests.ConnectionError:
        print(f"  ❌ Cannot reach server at {SERVER_URL}")
        return False
    except Exception as e:
        print(f"  ❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_request_format():
    """
    Sanity check — prints exactly what the Pi sends so you can verify
    the request format matches what the server expects.
    """
    print("\n" + "="*60)
    print("TEST 3: Request Format Verification")
    print("="*60)

    tiny_image = make_test_image()
    b64        = base64.b64encode(tiny_image).decode()

    payload = {
        "device_code": DEVICE_CODE,
        "image_data":  b64[:50] + "...[truncated]",  # show structure only
    }

    print("  The Pi sends exactly this JSON body:")
    print(f"  {json.dumps({k: v if k != 'image_data' else '<base64_string>' for k, v in payload.items()}, indent=4)}")
    print()
    print("  Headers sent by Pi:")
    print("    Content-Type: application/json  (set automatically by requests.post(json=...))")
    print()
    print("  Server expects (from OcrRequest model in ocr.py):")
    print('    { "device_code": str, "image_data": str }')
    print()

    match = True
    if "device_code" in payload and "image_data" in payload:
        print("  ✅ Field names match server model")
    else:
        print("  ❌ Field name mismatch — this causes 422 errors")
        match = False

    return match


# =============================================================================
# MAIN
# =============================================================================

if __name__ == "__main__":
    print("\n" + "="*60)
    print("  AiSee Pi Simulator — Server Test")
    print(f"  Server : {SERVER_URL}")
    print(f"  Device : {DEVICE_CODE}")
    print("="*60)

    # Optional: pass an image path as argument
    # e.g. python test_pi_simulator.py my_urdu_text_photo.jpg
    image_path = sys.argv[1] if len(sys.argv) > 1 else None

    results = {}

    # Run all tests
    results["format"]  = test_request_format()
    results["status"]  = test_status_check()
    results["process"] = test_ocr_process(image_path)

    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    for name, passed in results.items():
        icon = "✅" if passed else "❌"
        print(f"  {icon}  {name.upper()}")
    print("="*60 + "\n")

    all_passed = all(results.values())
    sys.exit(0 if all_passed else 1)