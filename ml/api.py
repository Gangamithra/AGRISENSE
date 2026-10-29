from pathlib import Path
import io
import json
import os
import asyncio

from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel

import numpy as np
import tensorflow as tf
from PIL import Image, UnidentifiedImageError
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
gemini_client = (
    genai.Client(api_key=GEMINI_API_KEY)
    if GEMINI_API_KEY
    else None
)
MODEL_DIR = BASE_DIR / "models"
IMAGE_SIZE = (224, 224)
MAX_FILE_SIZE = 10 * 1024 * 1024

app = FastAPI(title="AGRISENSE Crop Disease API")
class TranslationRequest(BaseModel):
    texts: list[str]
    target_language: str

# Development origins. Restrict these to your actual origins in deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

MODELS = {}
CLASS_NAMES = {}

for crop in ("banana", "coconut"):
    model_path = MODEL_DIR / f"{crop}_model.keras"
    labels_path = MODEL_DIR / f"{crop}_labels.json"

    if not model_path.exists() or not labels_path.exists():
        raise RuntimeError(f"Missing model or labels for {crop}")

    MODELS[crop] = tf.keras.models.load_model(model_path)

    with labels_path.open() as file:
        CLASS_NAMES[crop] = json.load(file)["class_names"]

    if MODELS[crop].output_shape[-1] != len(CLASS_NAMES[crop]):
        raise RuntimeError(f"Model and labels mismatch for {crop}")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "models": list(MODELS.keys()),
    }


@app.post("/predict/{crop}")
async def predict(crop: str, file: UploadFile = File(...)):
    crop = crop.lower()

    if crop not in MODELS:
        raise HTTPException(
            status_code=400,
            detail="Crop must be banana or coconut.",
        )

    if file.content_type not in {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/bmp",
    }:
        raise HTTPException(
            status_code=415,
            detail="Upload a JPEG, PNG, WEBP, or BMP image.",
        )

    content = await file.read(MAX_FILE_SIZE + 1)

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Image must be 10 MB or smaller.",
        )

    if not content:
        raise HTTPException(status_code=400, detail="Image is empty.")

    try:
        with Image.open(io.BytesIO(content)) as image:
            image = image.convert("RGB")
            image = image.resize(IMAGE_SIZE)
            array = np.asarray(image, dtype=np.float32)
    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a valid image.",
        )

    # Match the training preprocessing: RGB values scaled to [-1, 1].
    batch = np.expand_dims(array, axis=0)
    probabilities = MODELS[crop].predict(batch, verbose=0)[0]

    index = int(np.argmax(probabilities))
    class_name = CLASS_NAMES[crop][index]

    return {
        "crop": crop,
        "predicted_class": class_name,
        "confidence": round(float(probabilities[index]), 4),
        "probabilities": {
            name: round(float(probabilities[i]), 4)
            for i, name in enumerate(CLASS_NAMES[crop])
        },
        "model_note": (
            "Confidence is the model's score, not a calibrated "
            "probability of a correct diagnosis."
        ),
    }

@app.post("/translate")
async def translate(request: TranslationRequest):
    if request.target_language not in {"English", "Tamil"}:
        raise HTTPException(
            status_code=400,
            detail="Target language must be English or Tamil.",
        )

    if not request.texts or len(request.texts) > 50:
        raise HTTPException(
            status_code=400,
            detail="Send between 1 and 50 text items.",
        )

    if any(not text.strip() or len(text) > 2000 for text in request.texts):
        raise HTTPException(
            status_code=400,
            detail="Each text must contain 1–2000 characters.",
        )

    if request.target_language == "English":
        return {
            "target_language": "English",
            "translations": request.texts,
            "fallback": False,
        }

    if gemini_client is None:
        return {
            "target_language": "Tamil",
            "translations": request.texts,
            "fallback": True,
            "message": "Tamil translation is temporarily unavailable.",
        }

    prompt = f"""
Translate each input text into Tamil for AGRISENSE farmers.

Rules:
1. Preserve English disease names exactly, such as Black Sigatoka,
   Fusarium Wilt, Bud Rot, and Stem Bleeding.
2. When a disease name appears, add a meaningful Tamil explanation
   in parentheses immediately after it, when supported by the input
   or a reliable, established meaning.
3. Translate the remaining sentence into natural, simple Tamil.
4. Preserve numbers, percentages, and measurements.
5. Do not invent symptoms, treatments, or agricultural facts.
6. Return only a JSON array of strings, in the same order and count.

Example:
Input: ["Black Sigatoka detected on banana leaves."]
Output:
["Black Sigatoka (வாழை இலைகளில் கரும்புள்ளிகளை ஏற்படுத்தும் நோய்) கண்டறியப்பட்டுள்ளது."]

Input texts:
{json.dumps(request.texts, ensure_ascii=False)}
"""

    try:
        response = await asyncio.wait_for(
            asyncio.to_thread(
                gemini_client.models.generate_content,
                model="gemini-3.8-flash",
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "response_schema": list[str],
                },
            ),
            timeout=12,
        )

        translated = json.loads(response.text)

        if (
            not isinstance(translated, list)
            or len(translated) != len(request.texts)
            or not all(isinstance(item, str) for item in translated)
        ):
            raise ValueError("Unexpected translation response.")

        return {
            "target_language": "Tamil",
            "translations": translated,
            "fallback": False,
        }

    except Exception as error:
        print("Gemini translation unavailable:", repr(error), flush=True)

        return {
            "target_language": "Tamil",
            "translations": request.texts,
            "fallback": True,
            "message": "Tamil translation is temporarily unavailable. Showing original text.",
        }
