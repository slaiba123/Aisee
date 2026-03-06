# test_pi.py
# Simulates exactly what the Pi does
# Run this after completing setup in browser

import requests, base64, sys

SERVER_URL  = "http://localhost:8000"
DEVICE_CODE = "AIS-4567"   # Must match what you registered + set up


def test_status():
    """Check if device is claimed."""
    resp = requests.get(f"{SERVER_URL}/ocr/status/{DEVICE_CODE}")
    print(f"Status: {resp.json()}")


def test_ocr_with_file(image_path: str):
    """Send a real image file to OCR."""
    with open(image_path, "rb") as f:
        image_b64 = base64.b64encode(f.read()).decode()

    print(f"Sending {image_path} for OCR...")
    resp = requests.post(
        f"{SERVER_URL}/ocr/process",
        json={
            "device_code": DEVICE_CODE,
            "image_data":  image_b64,
        },
        timeout=60,
        stream=True,
    )

    print(f"Response status: {resp.status_code}")

    if resp.status_code == 200:
        # Save the MP3 audio response
        with open("result.mp3", "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)
        print("✓ Audio saved to result.mp3")
        print(f"  Extracted text preview: {resp.headers.get('X-Extracted-Text', 'see audio')}")

        # Play it (macOS/Linux)
        import subprocess, platform
        if platform.system() == "Darwin":
            subprocess.run(["afplay", "result.mp3"])
        elif platform.system() == "Linux":
            subprocess.run(["mpg123", "result.mp3"])

    elif resp.status_code == 403:
        print("✗ Device not set up — complete setup at localhost:5173/setup first")
    elif resp.status_code == 422:
        print("✗ No text found in image")
    else:
        print(f"✗ Error: {resp.text}")


def test_ocr_with_sample():
    """
    No image? Generate a simple test image with Urdu text.
    Requires: pip install Pillow arabic-reshaper python-bidi
    """
    try:
        from PIL import Image, ImageDraw, ImageFont
        import arabic_reshaper
        from bidi.algorithm import get_display

        # Sample Urdu text
        urdu_text = "یہ ایک تجربہ ہے"

        reshaped = arabic_reshaper.reshape(urdu_text)
        display_text = get_display(reshaped)

        img = Image.new("RGB", (400, 100), color="white")
        draw = ImageDraw.Draw(img)
        draw.text((20, 30), display_text, fill="black")
        img.save("test_urdu.jpg")
        print("✓ Created test_urdu.jpg")
        test_ocr_with_file("test_urdu.jpg")

    except ImportError:
        print("Install Pillow for sample image: pip install Pillow")
        print("Or provide your own image: python test_pi.py myimage.jpg")


if __name__ == "__main__":
    print(f"=== Fake Pi Test ===")
    print(f"Device: {DEVICE_CODE}")
    print(f"Server: {SERVER_URL}\n")

    # Check status first
    test_status()

    # Run OCR
    if len(sys.argv) > 1:
        # Use provided image: python test_pi.py myimage.jpg
        test_ocr_with_file(sys.argv[1])
    else:
        # Generate sample image
        test_ocr_with_sample()