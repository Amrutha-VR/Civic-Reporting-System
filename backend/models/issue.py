from datetime import datetime, timezone

VALID_STATUSES = ["Open", "In Progress", "Resolved"]
VALID_CATEGORIES = [
    "Pothole", "Broken Streetlight", "Garbage Overflow",
    "Water Leakage", "Graffiti", "Fallen Tree",
    "Damaged Sidewalk", "Illegal Dumping", "Traffic Signal", "Other"
]

def create_issue(title, category, description, address, lat, lng, reporter_username, image_url=None):
    return {
        "title": title,
        "category": category,
        "description": description,
        "address": address,
        "location": {
            "type": "Point",
            "coordinates": [float(lng), float(lat)]   # GeoJSON: [lng, lat]
        },
        "image_url": image_url,
        "status": "Open",
        "votes": 0,
        "voted_by": [],
        "reporter": reporter_username,
        "comments": [],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

def issue_to_dict(issue: dict) -> dict:
    coords = issue.get("location", {}).get("coordinates", [0, 0])
    return {
        "id": str(issue["_id"]),
        "title": issue["title"],
        "category": issue["category"],
        "description": issue["description"],
        "address": issue["address"],
        "lat": coords[1],
        "lng": coords[0],
        "image_url": issue.get("image_url"),
        "status": issue["status"],
        "votes": issue.get("votes", 0),
        "voted_by": issue.get("voted_by", []),
        "reporter": issue["reporter"],
        "comments": issue.get("comments", []),
        "created_at": issue["created_at"].isoformat() if hasattr(issue.get("created_at"), "isoformat") else "",
        "updated_at": issue["updated_at"].isoformat() if hasattr(issue.get("updated_at"), "isoformat") else "",
    }
