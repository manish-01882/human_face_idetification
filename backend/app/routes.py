from flask import Blueprint, request, jsonify, current_app
import numpy as np
import cv2
import joblib
import os
import traceback
from app.utils import allowed_file, preprocess_image_pair, encode_image_to_base64

api = Blueprint("api", __name__)

# Load the model and scaler
model = None
scaler = None


def init_models(app):
    """Initialize models when the application starts"""
    global model, scaler
    try:
        model_path = os.path.join(
            app.config["MODEL_FOLDER"], "best_random_forest_model_2.pkl"
        )
        scaler_path = os.path.join(app.config["MODEL_FOLDER"], "scaler_2.pkl")

        print(f"Looking for model at: {model_path}")
        print(f"Looking for scaler at: {scaler_path}")

        if not os.path.exists(model_path):
            print(f"❌ Model file not found at: {model_path}")
            return False

        if not os.path.exists(scaler_path):
            print(f"❌ Scaler file not found at: {scaler_path}")
            return False

        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        print("✅ Models loaded successfully")
        print(f"Model type: {type(model)}")
        print(f"Scaler type: {type(scaler)}")
        return True
    except Exception as e:
        print(f"❌ Error loading models: {str(e)}")
        print(traceback.format_exc())
        return False


@api.route("/api/compare", methods=["POST"])
def compare_images():
    try:
        if not model or not scaler:
            print("❌ Models not loaded")
            return jsonify({"error": "Models not loaded"}), 500

        if "before_image" not in request.files or "after_image" not in request.files:
            print("❌ Missing image files in request")
            return jsonify({"error": "Both before and after images are required"}), 400

        before_file = request.files["before_image"]
        after_file = request.files["after_image"]

        if before_file.filename == "" or after_file.filename == "":
            print("❌ Empty filenames")
            return jsonify({"error": "No selected files"}), 400

        # Validate before image
        is_valid_before, before_message = allowed_file(before_file)
        if not is_valid_before:
            print(f"❌ Invalid before image: {before_message}")
            return jsonify({"error": f"Before image: {before_message}"}), 400

        # Validate after image
        is_valid_after, after_message = allowed_file(after_file)
        if not is_valid_after:
            print(f"❌ Invalid after image: {after_message}")
            return jsonify({"error": f"After image: {after_message}"}), 400

        # Read images
        before_image_array = cv2.imdecode(
            np.frombuffer(before_file.read(), np.uint8), cv2.IMREAD_COLOR
        )
        after_image_array = cv2.imdecode(
            np.frombuffer(after_file.read(), np.uint8), cv2.IMREAD_COLOR
        )

        if before_image_array is None or after_image_array is None:
            print("❌ Failed to decode images")
            return jsonify({"error": "Failed to process images"}), 400

        print("✅ Processing images...")
        try:
            # Process images and get prediction
            features, before_img, after_img = preprocess_image_pair(
                before_image_array, after_image_array, scaler
            )
        except ValueError as ve:
            print(f"❌ Face detection error: {str(ve)}")
            return jsonify({"error": str(ve)}), 400
        except Exception as e:
            print(f"❌ Image processing error: {str(e)}")
            return jsonify({"error": "Failed to process images"}), 500

        print("✅ Making prediction...")
        prediction = model.predict(features)
        probability = model.predict_proba(features)[:, 1]

        print(f"✅ Prediction complete: {prediction[0]}, confidence: {probability[0]}")

        response = {
            "is_same_person": bool(prediction[0]),
            "confidence": float(probability[0]),
            "processed_before_image": encode_image_to_base64(before_img),
            "processed_after_image": encode_image_to_base64(after_img),
        }

        return jsonify(response)

    except Exception as e:
        print(f"❌ Error in compare_images: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


@api.route("/api/health", methods=["GET"])
def health_check():
    return (
        jsonify(
            {
                "status": "healthy",
                "model_loaded": bool(model and scaler),
                "model_type": str(type(model)) if model else None,
                "scaler_type": str(type(scaler)) if scaler else None,
            }
        ),
        200,
    )
