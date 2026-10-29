
from pathlib import Path
import json

import tensorflow as tf
from tensorflow.keras import layers, Model
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.callbacks import (
    EarlyStopping,
    ModelCheckpoint,
    ReduceLROnPlateau,
)

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "prepared"
MODEL_DIR = BASE_DIR / "models"

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS = 8
SEED = 42

tf.keras.utils.set_random_seed(SEED)
MODEL_DIR.mkdir(parents=True, exist_ok=True)


def load_dataset(crop, split, class_names=None):
    folder = DATA_DIR / crop / split

    dataset = tf.keras.utils.image_dataset_from_directory(
        folder,
        image_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="int",
        shuffle=(split == "train"),
        seed=SEED,
    )

    if class_names is not None and dataset.class_names != class_names:
        raise ValueError(
            f"Class mismatch in {folder}: "
            f"{dataset.class_names} != {class_names}"
        )

    return dataset


def make_class_weights(crop, class_names):
    counts = []

    for class_name in class_names:
        folder = DATA_DIR / crop / "train" / class_name
        count = sum(1 for path in folder.iterdir() if path.is_file())

        if count == 0:
            raise ValueError(f"No training images in {folder}")

        counts.append(count)

    total = sum(counts)
    number_of_classes = len(counts)

    return {
        index: total / (number_of_classes * count)
        for index, count in enumerate(counts)
    }


def build_model(number_of_classes):
    augmentation = tf.keras.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.08),
        layers.RandomZoom(0.10),
    ], name="augmentation")

    base = MobileNetV2(
        weights="imagenet",
        include_top=False,
        input_shape=(224, 224, 3),
    )
    base.trainable = False

    inputs = layers.Input(shape=(224, 224, 3))
    x = augmentation(inputs)
    x = layers.Rescaling(1.0 / 127.5, offset=-1)(x)
    x = base(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.25)(x)
    outputs = layers.Dense(
        number_of_classes,
        activation="softmax",
    )(x)

    model = Model(inputs, outputs)

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    return model


def train_crop(crop):
    print(f"\n{'=' * 50}")
    print(f"Training {crop.upper()} model")
    print(f"{'=' * 50}")

    train_ds = load_dataset(crop, "train")
    class_names = train_ds.class_names

    val_ds = load_dataset(crop, "validation", class_names)
    test_ds = load_dataset(crop, "test", class_names)

    print("Classes:", class_names)

    model = build_model(len(class_names))
    model.summary()

    model_path = MODEL_DIR / f"{crop}_model.keras"
    labels_path = MODEL_DIR / f"{crop}_labels.json"

    callbacks = [
        ModelCheckpoint(
            str(model_path),
            monitor="val_accuracy",
            save_best_only=True,
            mode="max",
            verbose=1,
        ),
        EarlyStopping(
            monitor="val_loss",
            patience=3,
            restore_best_weights=True,
            verbose=1,
        ),
        ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.3,
            patience=2,
            min_lr=0.00001,
            verbose=1,
        ),
    ]

    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS,
        callbacks=callbacks,
        class_weight=make_class_weights(crop, class_names),
    )

    # Reload the best checkpoint before evaluating.
    model = tf.keras.models.load_model(model_path)

    print(f"\nEvaluating {crop} model on held-out test data...")
    test_loss, test_accuracy = model.evaluate(test_ds, verbose=1)

    with labels_path.open("w") as file:
        json.dump(
            {
                "crop": crop,
                "class_names": class_names,
                "image_size": list(IMAGE_SIZE),
            },
            file,
            indent=2,
        )

    print(f"\n{crop.upper()} RESULTS")
    print(f"Test loss: {test_loss:.4f}")
    print(f"Test accuracy: {test_accuracy * 100:.2f}%")
    print(f"Saved model: {model_path}")
    print(f"Saved labels: {labels_path}")


if __name__ == "__main__":
    import sys

    allowed_crops = {"banana", "coconut"}

    crop = sys.argv[1].lower() if len(sys.argv) > 1 else "banana"

    if crop not in allowed_crops:
        raise ValueError("Choose either banana or coconut.")

    train_crop(crop)
