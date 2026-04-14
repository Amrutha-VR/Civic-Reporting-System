from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity
from flask_jwt_extended import jwt_required
from config.db import get_db
from models.user import create_user, verify_password, user_to_public
from datetime import timedelta

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not username or not email or not password:
        return jsonify({"error": "All fields required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if len(username) < 3:
        return jsonify({"error": "Username must be at least 3 characters"}), 400

    db = get_db()
    if db.users.find_one({"username": username}):
        return jsonify({"error": "Username already taken"}), 409
    if db.users.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 409

    user_doc = create_user(username, email, password)
    result = db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    token = create_access_token(
        identity={"id": str(result.inserted_id), "username": username, "role": "citizen"},
        expires_delta=timedelta(days=7)
    )
    return jsonify({"token": token, "user": user_to_public(user_doc)}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    db = get_db()
    user = db.users.find_one({"username": username})
    if not user or not verify_password(password, user["password_hash"]):
        return jsonify({"error": "Invalid username or password"}), 401

    token = create_access_token(
        identity={"id": str(user["_id"]), "username": username, "role": user.get("role", "citizen")},
        expires_delta=timedelta(days=7)
    )
    return jsonify({"token": token, "user": user_to_public(user)}), 200

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    identity = get_jwt_identity()
    db = get_db()
    from bson import ObjectId
    user = db.users.find_one({"_id": ObjectId(identity["id"])})
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user_to_public(user)), 200
