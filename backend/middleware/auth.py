from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

def jwt_required_custom(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
        except Exception as e:
            return jsonify({"error": "Unauthorized", "message": str(e)}), 401
        return fn(*args, **kwargs)
    return wrapper

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            identity = get_jwt_identity()
            if identity.get("role") != "admin":
                return jsonify({"error": "Admin access required"}), 403
        except Exception as e:
            return jsonify({"error": "Unauthorized", "message": str(e)}), 401
        return fn(*args, **kwargs)
    return wrapper
