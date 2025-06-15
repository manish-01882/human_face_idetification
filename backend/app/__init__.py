from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()


def create_app():
    app = Flask(__name__)
    CORS(app)

    # Configuration
    app.config["UPLOAD_FOLDER"] = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "uploads"
    )
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB max file size
    app.config["MODEL_FOLDER"] = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "models"
    )

    # Create required directories
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    os.makedirs(app.config["MODEL_FOLDER"], exist_ok=True)

    # Register routes and initialize models
    from app.routes import api, init_models

    app.register_blueprint(api)

    # Initialize models
    if not init_models(app):
        print("❌ Failed to initialize models")
    else:
        print("✅ Models initialized successfully")

    return app
