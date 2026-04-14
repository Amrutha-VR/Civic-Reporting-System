from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from config.db import get_db
from models.issue import create_issue, issue_to_dict, VALID_STATUSES, VALID_CATEGORIES
from bson import ObjectId
from datetime import datetime, timezone
import os

issues_bp = Blueprint("issues", __name__, url_prefix="/api/issues")

def paginate(query, page, per_page):
    total = query.count_documents({}) if hasattr(query, "count_documents") else 0
    items = list(query.skip((page - 1) * per_page).limit(per_page))
    return items, total

@issues_bp.route("/", methods=["GET"])
def get_issues():
    db = get_db()
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))
    status = request.args.get("status")
    category = request.args.get("category")
    search = request.args.get("search", "")
    sort_by = request.args.get("sort", "created_at")

    filt = {}
    if status and status in VALID_STATUSES:
        filt["status"] = status
    if category and category in VALID_CATEGORIES:
        filt["category"] = category
    if search:
        filt["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"address": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]

    sort_dir = -1
    sort_field = "created_at" if sort_by == "date" else "votes"
    cursor = db.issues.find(filt).sort(sort_field, sort_dir)
    total = db.issues.count_documents(filt)
    items = list(cursor.skip((page - 1) * per_page).limit(per_page))

    return jsonify({
        "issues": [issue_to_dict(i) for i in items],
        "total": total,
        "page": page,
        "pages": (total + per_page - 1) // per_page,
    }), 200

@issues_bp.route("/<issue_id>", methods=["GET"])
def get_issue(issue_id):
    db = get_db()
    try:
        issue = db.issues.find_one({"_id": ObjectId(issue_id)})
    except Exception:
        return jsonify({"error": "Invalid issue ID"}), 400
    if not issue:
        return jsonify({"error": "Issue not found"}), 404
    return jsonify(issue_to_dict(issue)), 200

@issues_bp.route("/", methods=["POST"])
@jwt_required()
def create():
    identity = get_jwt_identity()
    db = get_db()

    title = request.form.get("title", "").strip()
    category = request.form.get("category", "")
    description = request.form.get("description", "").strip()
    address = request.form.get("address", "").strip()
    lat = request.form.get("lat", 0)
    lng = request.form.get("lng", 0)

    if not title or not description or not address:
        return jsonify({"error": "title, description, and address are required"}), 400
    if category not in VALID_CATEGORIES:
        return jsonify({"error": f"Invalid category"}), 400

    # Handle photo upload
    image_url = None
    if "image" in request.files:
        file = request.files["image"]
        if file and file.filename:
            upload_dir = os.path.join(current_app.root_path, "uploads")
            os.makedirs(upload_dir, exist_ok=True)
            from werkzeug.utils import secure_filename
            import uuid
            ext = os.path.splitext(secure_filename(file.filename))[1]
            filename = f"{uuid.uuid4().hex}{ext}"
            file.save(os.path.join(upload_dir, filename))
            image_url = f"/uploads/{filename}"

    doc = create_issue(title, category, description, address, lat, lng,
                       identity["username"], image_url)
    result = db.issues.insert_one(doc)
    db.users.update_one({"username": identity["username"]}, {"$inc": {"issues_reported": 1}})
    doc["_id"] = result.inserted_id
    return jsonify(issue_to_dict(doc)), 201

@issues_bp.route("/<issue_id>/vote", methods=["POST"])
@jwt_required()
def vote(issue_id):
    identity = get_jwt_identity()
    db = get_db()
    try:
        oid = ObjectId(issue_id)
    except Exception:
        return jsonify({"error": "Invalid ID"}), 400

    issue = db.issues.find_one({"_id": oid})
    if not issue:
        return jsonify({"error": "Issue not found"}), 404

    username = identity["username"]
    if username in issue.get("voted_by", []):
        # Toggle off
        db.issues.update_one({"_id": oid}, {
            "$inc": {"votes": -1}, "$pull": {"voted_by": username}
        })
        voted = False
    else:
        db.issues.update_one({"_id": oid}, {
            "$inc": {"votes": 1}, "$push": {"voted_by": username}
        })
        voted = True

    updated = db.issues.find_one({"_id": oid})
    return jsonify({"votes": updated["votes"], "voted": voted}), 200

@issues_bp.route("/<issue_id>/comment", methods=["POST"])
@jwt_required()
def add_comment(issue_id):
    identity = get_jwt_identity()
    db = get_db()
    try:
        oid = ObjectId(issue_id)
    except Exception:
        return jsonify({"error": "Invalid ID"}), 400

    data = request.get_json()
    text = data.get("text", "").strip()
    if not text:
        return jsonify({"error": "Comment text required"}), 400

    comment = {
        "user": identity["username"],
        "text": text,
        "date": datetime.now(timezone.utc).isoformat(),
    }
    db.issues.update_one({"_id": oid}, {
        "$push": {"comments": comment},
        "$set": {"updated_at": datetime.now(timezone.utc)}
    })
    return jsonify(comment), 201

@issues_bp.route("/<issue_id>/status", methods=["PATCH"])
@jwt_required()
def update_status(issue_id):
    identity = get_jwt_identity()
    db = get_db()
    try:
        oid = ObjectId(issue_id)
    except Exception:
        return jsonify({"error": "Invalid ID"}), 400

    data = request.get_json()
    new_status = data.get("status")
    if new_status not in VALID_STATUSES:
        return jsonify({"error": "Invalid status"}), 400

    issue = db.issues.find_one({"_id": oid})
    if not issue:
        return jsonify({"error": "Not found"}), 404

    # Only reporter or admin can update
    if issue["reporter"] != identity["username"] and identity.get("role") != "admin":
        return jsonify({"error": "Not authorized"}), 403

    db.issues.update_one({"_id": oid}, {"$set": {
        "status": new_status,
        "updated_at": datetime.now(timezone.utc)
    }})
    return jsonify({"status": new_status}), 200

@issues_bp.route("/stats/summary", methods=["GET"])
def stats():
    db = get_db()
    pipeline = [{"$group": {"_id": "$status", "count": {"$sum": 1}}}]
    result = list(db.issues.aggregate(pipeline))
    summary = {"Open": 0, "In Progress": 0, "Resolved": 0, "total": db.issues.count_documents({})}
    for r in result:
        summary[r["_id"]] = r["count"]
    return jsonify(summary), 200
