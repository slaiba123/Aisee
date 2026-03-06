# # backend/admin.py
# # Run this script to pre-register Pis before shipping
# # python admin.py add AIS-4829 ABC123
# # python admin.py list
# # python admin.py reset AIS-4829

# import sys, os, random, string
# from database import init_db, get_db, Device, reset_device

# def generate_code() -> str:
#     """Generate a unique device code like AIS-4829."""
#     digits = "".join(random.choices(string.digits, k=4))
#     return f"AIS-{digits}"

# def add_device(device_code: str, pi_serial: str):
#     init_db()
#     with get_db() as db:
#         existing = db.query(Device).filter(Device.device_code == device_code).first()
#         if existing:
#             print(f"✗ Code {device_code} already exists")
#             return
#         device = Device(device_code=device_code, pi_serial=pi_serial)
#         db.add(device)
#     print(f"✓ Added: {device_code} → Pi serial {pi_serial}")

# def list_devices():
#     init_db()
#     with get_db() as db:
#         devices = db.query(Device).all()
#         print(f"\n{'CODE':<12} {'PI SERIAL':<20} {'CLAIMED':<10} {'USER':<30} {'ACTIVE'}")
#         print("-" * 80)
#         for d in devices:
#             print(f"{d.device_code:<12} {d.pi_serial:<20} {str(d.claimed):<10} {(d.user_email or 'unclaimed'):<30} {d.is_active}")

# def reset(device_code: str):
#     init_db()
#     with get_db() as db:
#         reset_device(db, device_code)
#     print(f"✓ Reset: {device_code} — can be claimed again")

# def bulk_add(count: int):
#     """Generate and add multiple devices at once."""
#     init_db()
#     codes = []
#     with get_db() as db:
#         existing_codes = {d.device_code for d in db.query(Device).all()}
#         for i in range(count):
#             while True:
#                 code = generate_code()
#                 if code not in existing_codes:
#                     existing_codes.add(code)
#                     break
#             # Pi serial is unknown until you flash the Pi
#             # Use placeholder — update later with real serial
#             placeholder_serial = f"PENDING-{i+1:04d}"
#             device = Device(device_code=code, pi_serial=placeholder_serial)
#             db.add(device)
#             codes.append(code)
#     print(f"✓ Generated {count} device codes:")
#     for c in codes:
#         print(f"   {c}")
#     print("\nUpdate pi_serial for each device after flashing the Pi.")

# if __name__ == "__main__":
#     if len(sys.argv) < 2:
#         print("Usage:")
#         print("  python admin.py add <CODE> <PI_SERIAL>   — register one device")
#         print("  python admin.py bulk <COUNT>             — generate N codes")
#         print("  python admin.py list                     — show all devices")
#         print("  python admin.py reset <CODE>             — reset for re-claiming")
#         sys.exit(1)

#     cmd = sys.argv[1]
#     if cmd == "add" and len(sys.argv) == 4:
#         add_device(sys.argv[2].upper(), sys.argv[3])
#     elif cmd == "bulk" and len(sys.argv) == 3:
#         bulk_add(int(sys.argv[2]))
#     elif cmd == "list":
#         list_devices()
#     elif cmd == "reset" and len(sys.argv) == 3:
#         reset(sys.argv[2].upper())
#     else:
#         print("Invalid command")
#         sys.exit(1)


# backend/admin.py
# Run this script to pre-register Pis before shipping
# python admin.py add AIS-4829 ABC123
# python admin.py list
# python admin.py reset AIS-4829

import sys, os, random, string
from database import init_db, get_db, Device, reset_device

def generate_code() -> str:
    """Generate a unique device code like AIS-4829."""
    digits = "".join(random.choices(string.digits, k=4))
    return f"AIS-{digits}"

def add_device(device_code: str, pi_serial: str):
    init_db()
    with get_db() as db:
        existing = db.query(Device).filter(Device.device_code == device_code).first()
        if existing:
            print(f"✗ Code {device_code} already exists")
            return
        device = Device(device_code=device_code, pi_serial=pi_serial)
        db.add(device)
    print(f"✓ Added: {device_code} → Pi serial {pi_serial}")

def list_devices():
    init_db()
    with get_db() as db:
        devices = db.query(Device).all()
        print(f"\n{'CODE':<12} {'PI SERIAL':<20} {'CLAIMED':<10} {'USER':<30} {'ACTIVE'}")
        print("-" * 80)
        for d in devices:
            print(f"{d.device_code:<12} {d.pi_serial:<20} {str(d.claimed):<10} {(d.user_email or 'unclaimed'):<30} {d.is_active}")

def reset(device_code: str):
    init_db()
    with get_db() as db:
        reset_device(db, device_code)
    print(f"✓ Reset: {device_code} — can be claimed again")

def bulk_add(count: int):
    """Generate and add multiple devices at once."""
    init_db()
    codes = []
    with get_db() as db:
        existing_codes = {d.device_code for d in db.query(Device).all()}
        for i in range(count):
            while True:
                code = generate_code()
                if code not in existing_codes:
                    existing_codes.add(code)
                    break
            # Pi serial is unknown until you flash the Pi
            # Use placeholder — update later with real serial
            placeholder_serial = f"PENDING-{i+1:04d}"
            device = Device(device_code=code, pi_serial=placeholder_serial)
            db.add(device)
            codes.append(code)
    print(f"✓ Generated {count} device codes:")
    for c in codes:
        print(f"   {c}")
    print("\nUpdate pi_serial for each device after flashing the Pi.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python admin.py add <CODE> <PI_SERIAL>   — register one device")
        print("  python admin.py bulk <COUNT>             — generate N codes")
        print("  python admin.py list                     — show all devices")
        print("  python admin.py reset <CODE>             — reset for re-claiming")
        sys.exit(1)

    cmd = sys.argv[1]
    if cmd == "add" and len(sys.argv) == 4:
        add_device(sys.argv[2].upper(), sys.argv[3])
    elif cmd == "bulk" and len(sys.argv) == 3:
        bulk_add(int(sys.argv[2]))
    elif cmd == "list":
        list_devices()
    elif cmd == "reset" and len(sys.argv) == 3:
        reset(sys.argv[2].upper())
    else:
        print("Invalid command")
        sys.exit(1)
