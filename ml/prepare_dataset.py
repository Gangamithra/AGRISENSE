
from pathlib import Path
from collections import Counter
import hashlib
import json
import random
import shutil

from PIL import Image, UnidentifiedImageError

BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR / "datasets"
OUTPUT_DIR = BASE_DIR / "prepared"

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
SEED = 42

# Each image is mapped to the class given by its parent folder.
# We deliberately preserve the original disease folder names.
DATASETS = {
    "banana": {
        "root": DATASET_DIR / "banana",
        "classes": {
            "healthy": "Healthy",
            "fusarium_wilt": "Fusarium Wilt",
            "black_sigatoka": "Black Sigatoka",
        },
    },
    "coconut": {
        "root": DATASET_DIR / "coconut" / "extracted" / "images"
        / "Coconut Tree Disease Dataset",
        "classes": {
            "Bud Root Dropping": "Bud Root Dropping",
            "Gray Leaf Spot": "Gray Leaf Spot",
            "Stem Bleeding": "Stem Bleeding",
            "Leaf Rot": "Leaf Rot",
            "Bud Rot": "Bud Rot",
        },
    },
}


def image_hash(path):
    digest = hashlib.sha256()
    with path.open("rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def is_valid_image(path):
    try:
        with Image.open(path) as image:
            image.verify()
        with Image.open(path) as image:
            image.load()
        return True
    except (OSError, ValueError, UnidentifiedImageError):
        return False


def split_images(images):
    random.Random(SEED).shuffle(images)

    total = len(images)
    train_end = int(total * 0.70)
    val_end = int(total * 0.85)

    return {
        "train": images[:train_end],
        "validation": images[train_end:val_end],
        "test": images[val_end:],
    }


def main():
    if OUTPUT_DIR.exists():
        print(f"Output folder already exists: {OUTPUT_DIR}")
        print("Rename or remove it before preparing the dataset again.")
        return

    OUTPUT_DIR.mkdir(parents=True)

    seen_hashes = set()
    report = {
        "seed": SEED,
        "split_ratio": {
            "train": 0.70,
            "validation": 0.15,
            "test": 0.15,
        },
        "datasets": {},
        "invalid_images": [],
        "duplicate_images_skipped": [],
    }

    for crop, config in DATASETS.items():
        crop_root = config["root"]

        if not crop_root.exists():
            raise FileNotFoundError(
                f"Dataset folder not found for {crop}: {crop_root}"
            )

        crop_report = {}
        print(f"\nPreparing {crop.upper()} dataset")

        for folder_name, class_name in config["classes"].items():
            class_root = (
                crop_root / folder_name
                if crop == "coconut"
                else crop_root / folder_name
            )

            if not class_root.exists():
                raise FileNotFoundError(
                    f"Class folder not found: {class_root}"
                )

            valid_images = []

            for path in sorted(class_root.rglob("*")):
                if not path.is_file():
                    continue

                if path.suffix.lower() not in IMAGE_EXTENSIONS:
                    continue

                if not is_valid_image(path):
                    report["invalid_images"].append(str(path))
                    continue

                digest = image_hash(path)

                # Exact duplicate detection across both crop datasets.
                if digest in seen_hashes:
                    report["duplicate_images_skipped"].append(str(path))
                    continue

                seen_hashes.add(digest)
                valid_images.append(path)

            if len(valid_images) < 10:
                raise ValueError(
                    f"Too few valid images in {class_root}: "
                    f"{len(valid_images)}"
                )

            splits = split_images(valid_images)
            class_counts = {}

            for split_name, split_paths in splits.items():
                destination = (
                    OUTPUT_DIR / crop / split_name / class_name
                )
                destination.mkdir(parents=True, exist_ok=True)

                for index, source in enumerate(split_paths):
                    target = destination / (
                        f"{index:05d}_{source.name}"
                    )
                    shutil.copy2(source, target)

                class_counts[split_name] = len(split_paths)

            crop_report[class_name] = {
                "total": len(valid_images),
                **class_counts,
            }

            print(
                f"  {class_name}: {len(valid_images)} images "
                f"(train {class_counts['train']}, "
                f"validation {class_counts['validation']}, "
                f"test {class_counts['test']})"
            )

        report["datasets"][crop] = crop_report

    report_path = OUTPUT_DIR / "dataset_report.json"
    report_path.write_text(json.dumps(report, indent=2))

    print("\nDataset preparation complete.")
    print(f"Prepared images: {OUTPUT_DIR}")
    print(f"Report: {report_path}")
    print(f"Invalid images: {len(report['invalid_images'])}")
    print(
        "Exact duplicates skipped: "
        f"{len(report['duplicate_images_skipped'])}"
    )


if __name__ == "__main__":
    main()
