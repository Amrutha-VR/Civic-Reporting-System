from datetime import datetime, timezone
import bcrypt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))

def create_user(username: str, email: str, password: str) -> dict:
    return {
        "username": username,
        "email": email,
        "password_hash": hash_password(password),
        "role": "citizen",
        "issues_reported": 0,
        "joined_at": datetime.now(timezone.utc),
        "is_active": True,
    }

def user_to_public(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "role": user.get("role", "citizen"),
        "issues_reported": user.get("issues_reported", 0),
        "joined_at": user.get("joined_at", "").isoformat() if hasattr(user.get("joined_at",""), "isoformat") else "",
    }
