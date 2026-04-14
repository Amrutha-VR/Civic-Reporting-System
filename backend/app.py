import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)

    # Config
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-secret-change-in-prod")
    app.config["MAX_CONTENT_LENGTH"] = int(os.getenv("MAX_CONTENT_LENGTH", 10 * 1024 * 1024))
    app.config["UPLOAD_FOLDER"] = os.path.join(app.root_path, "uploads")

    # Extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    JWTManager(app)

    # Database
    from config.db import connect_db
    connect_db()

    # Blueprints
    from routes.auth import auth_bp
    from routes.issues import issues_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(issues_bp)

    # Serve uploaded images
    @app.route("/uploads/<filename>")
    def uploaded_file(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    @app.route("/api/health")
    def health():
        return {"status": "ok", "message": "CivicAlert API running"}, 200

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=os.getenv("FLASK_ENV") == "development", port=5000)
