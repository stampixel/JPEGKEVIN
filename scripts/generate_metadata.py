#!/usr/bin/env python3
"""
Generate or update metadata.json for Michigan Daily photos.

Usage:
    python scripts/generate_metadata.py

This script will:
- Scan the michigan-daily folder for image files
- Preserve existing descriptions for photos that already have entries
- Add placeholder entries for new photos
- Remove entries for photos that no longer exist
"""

import json
import os
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
MICHIGAN_DAILY_DIR = PROJECT_ROOT / "src" / "assets" / "michigan-daily"
METADATA_FILE = MICHIGAN_DAILY_DIR / "metadata.json"

# Supported image extensions
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".svg"}


def get_image_files(directory: Path) -> list[str]:
    """Get all image files in the directory."""
    images = []
    for file in directory.iterdir():
        if file.suffix.lower() in IMAGE_EXTENSIONS:
            images.append(file.name)
    return sorted(images)


def load_existing_metadata(filepath: Path) -> dict:
    """Load existing metadata or return empty structure."""
    if filepath.exists():
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            print(f"Warning: Could not read {filepath}, starting fresh")
    return {"photos": {}}


def generate_metadata(directory: Path, metadata_file: Path) -> None:
    """Generate or update metadata.json based on current photos."""
    
    # Get current images
    images = get_image_files(directory)
    print(f"Found {len(images)} images in {directory.name}/")
    
    # Load existing metadata
    existing = load_existing_metadata(metadata_file)
    existing_photos = existing.get("photos", {})
    
    # Build new metadata, preserving existing descriptions
    new_photos = {}
    added = []
    preserved = []
    removed = []
    
    for image in images:
        if image in existing_photos:
            # Preserve existing entry
            new_photos[image] = existing_photos[image]
            preserved.append(image)
        else:
            # Add new placeholder entry
            new_photos[image] = {
                "description": "Edit this description",
                "date": ""
            }
            added.append(image)
    
    # Track removed photos
    for image in existing_photos:
        if image not in images:
            removed.append(image)
    
    # Save updated metadata
    output = {"photos": new_photos}
    with open(metadata_file, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
        f.write("\n")  # Add trailing newline
    
    # Print summary
    print(f"\nMetadata updated: {metadata_file}")
    if added:
        print(f"  + Added {len(added)} new entries:")
        for img in added:
            print(f"      {img}")
    if preserved:
        print(f"  = Preserved {len(preserved)} existing entries")
    if removed:
        print(f"  - Removed {len(removed)} stale entries:")
        for img in removed:
            print(f"      {img}")


if __name__ == "__main__":
    if not MICHIGAN_DAILY_DIR.exists():
        print(f"Error: Directory not found: {MICHIGAN_DAILY_DIR}")
        exit(1)
    
    generate_metadata(MICHIGAN_DAILY_DIR, METADATA_FILE)
