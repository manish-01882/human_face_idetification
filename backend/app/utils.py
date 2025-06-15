import os
import cv2
import numpy as np
from skimage.feature import local_binary_pattern, hog
from mtcnn import MTCNN
import base64

detector = MTCNN()

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB in bytes


def allowed_file(file):
    # Check file extension
    if not (
        "." in file.filename
        and file.filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    ):
        return (
            False,
            "Invalid file format. Only JPG, JPEG, PNG, and WEBP formats are allowed.",
        )

    # Check file size
    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)  # Reset file pointer to beginning

    if size > MAX_FILE_SIZE:
        return (
            False,
            f"File size exceeds maximum limit of 15 MB. Current size: {size / (1024 * 1024):.2f} MB",
        )

    return True, "File is valid"


def detect_and_crop_face(image_array, size=(128, 128)):
    """
    Detect and crop face from image array using MTCNN
    """
    img_rgb = cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB)
    result = detector.detect_faces(img_rgb)
    if len(result) == 0:
        raise ValueError("No face detected in image")
    x, y, w, h = result[0]["box"]
    face = img_rgb[y : y + h, x : x + w]
    face = cv2.resize(face, size)
    face_gray = cv2.cvtColor(face, cv2.COLOR_RGB2GRAY)
    return face_gray


def extract_features(image):
    """
    Extract LBP and HOG features from a single image
    """
    # Extract LBP features
    lbp = local_binary_pattern(image, P=8, R=1, method="uniform")
    lbp_hist, _ = np.histogram(lbp.ravel(), bins=np.arange(0, 11), density=True)

    # Extract HOG features
    hog_features = hog(
        image, pixels_per_cell=(8, 8), cells_per_block=(2, 2), visualize=False
    )

    return lbp_hist, hog_features


def preprocess_image_pair(before_img_array, after_img_array, scaler):
    """
    Preprocess image pair and extract features
    """
    # Detect and crop faces
    before_face = detect_and_crop_face(before_img_array)
    after_face = detect_and_crop_face(after_img_array)

    # Extract features for both images
    before_lbp, before_hog = extract_features(before_face)
    after_lbp, after_hog = extract_features(after_face)

    # Calculate feature differences
    diff_lbp = np.abs(before_lbp - after_lbp)
    diff_hog = np.abs(before_hog - after_hog)

    # Combine features
    combined_features = np.concatenate([diff_lbp, diff_hog])

    # Scale features
    scaled_features = scaler.transform(combined_features.reshape(1, -1))

    return scaled_features, before_face, after_face


def encode_image_to_base64(image):
    """
    Encode image to base64 string
    """
    _, buffer = cv2.imencode(".jpg", cv2.cvtColor(image, cv2.COLOR_GRAY2BGR))
    return base64.b64encode(buffer).decode("utf-8")
