
from pathlib import Path
import sys

import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay,
)

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "prepared"

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 16


def main():
    crop = sys.argv[1].lower() if len(sys.argv) > 1 else "banana"

    if crop not in {"banana", "coconut"}:
        raise ValueError("Choose banana or coconut.")

    model_path = MODEL_DIR / f"{crop}_model.keras"
    test_dir = DATA_DIR / crop / "test"

    if not model_path.exists():
        raise FileNotFoundError(f"Model not found: {model_path}")

    model = tf.keras.models.load_model(model_path)

    test_ds = tf.keras.utils.image_dataset_from_directory(
        test_dir,
        image_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        shuffle=False,
        label_mode="int",
    )

    class_names = test_ds.class_names

    all_true = []
    all_pred = []

    for images, labels in test_ds:
        probabilities = model.predict(images, verbose=0)
        predictions = np.argmax(probabilities, axis=1)

        all_true.extend(labels.numpy().tolist())
        all_pred.extend(predictions.tolist())

    print(f"\n{crop.upper()} CLASSIFICATION REPORT\n")
    print(
        classification_report(
            all_true,
            all_pred,
            labels=list(range(len(class_names))),
            target_names=class_names,
            digits=4,
            zero_division=0,
        )
    )

    matrix = confusion_matrix(
        all_true,
        all_pred,
        labels=list(range(len(class_names))),
    )

    print("Confusion matrix (rows = actual, columns = predicted):")
    print(matrix)

    output_path = MODEL_DIR / f"{crop}_confusion_matrix.png"

    display = ConfusionMatrixDisplay(
        confusion_matrix=matrix,
        display_labels=class_names,
    )
    display.plot(xticks_rotation=45, cmap="Blues", values_format="d")
    plt.title(f"{crop.title()} Disease Classification")
    plt.tight_layout()
    plt.savefig(output_path, dpi=160)
    plt.close()

    print(f"\nSaved confusion matrix image: {output_path}")


if __name__ == "__main__":
    main()
