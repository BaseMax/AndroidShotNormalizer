# AndroidShotNormalizer

**Purpose‑built for Android developers:** Transform screenshots into store‑compliant 16:9 or 9:16 images. Handles orientation automatically, enforces maximum dimensions, and compresses each output to stay below 3 MB.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![GitHub repo size](https://img.shields.io/github/repo-size/BaseMax/AndroidShotNormalizer)

AndroidShotNormalizer is a **single‑file, fully client‑side** web tool that normalizes Android app screenshots to the exact aspect ratios required by Google Play and other app stores. No server upload, no backend, no data leaves your browser.

Simply drop your images, and the tool will:

- Automatically detect whether each image is landscape or portrait.
- Crop (center‑crop) and resize to **1600×900** for landscape (16:9) or **900×1600** for portrait (9:16).
- Ensure output dimensions never exceed **3000 px** (the chosen sizes are already smaller).
- Compress each image to **under 3 MB** by dynamically reducing JPEG quality.
- Provide individual download links and a **ZIP archive** of all processed images.

## Features

- 🖼️ **Batch processing** – handle multiple images at once.
- 🧭 **Automatic orientation detection** – landscape → 16:9, portrait → 9:16.
- ✂️ **Center‑crop** to preserve the exact aspect ratio without distortion.
- 📏 **Fixed output dimensions** – 1600×900 or 900×1600 pixels.
- 📦 **Size limit enforcement** – outputs are guaranteed to be below 3 MB.
- 🔒 **100% client‑side** – images never leave your computer.
- 📥 **Download individually or as a ZIP** – for easy packaging.

## Demo

Open `index.html` in any modern browser. No installation required.

## Usage

1. Clone or download this repository:
   ```bash
   git clone https://github.com/BaseMax/AndroidShotNormalizer.git
   ```

2. Open index.html in your web browser.

3. Drag & drop your screenshots onto the dashed area, or click to select files.

The tool automatically processes each image and shows a preview with download button.

4. To download all images at once, click Download All (ZIP).

## How It Works

The entire logic is implemented in vanilla JavaScript:

Image loading uses createImageBitmap (with EXIF orientation support) or falls back to Image.

Aspect ratio handling:

  - If width >= height → target is 16:9 (1600×900).
  - If height > width → target is 9:16 (900×1600).
  - Cropping centers the source image to match the target ratio.
  - JPEG export starts at quality 0.92 and decreases until the output is ≤ 3 MB.
  - ZIP generation uses the JSZip library (loaded via CDN).

## Requirements

Any modern browser (Chrome, Firefox, Edge, Safari).

Internet connection only if you want to use the "Download All (ZIP)" feature (JSZip is loaded from CDN). Individual downloads work offline.

## File Structure

```
AndroidShotNormalizer/
├── index.html    # The complete web (HTML + CSS)
├── script.js     # The complete javascript function (JS)
└── README.md
```

## License

MIT License

Copyright (c) 2026 Seyyed Ali Mohammadiyeh
