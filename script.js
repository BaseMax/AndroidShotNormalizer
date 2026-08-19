// AndroidShotNormalizer - Copyright 2026, Seyyed Ali Mohammadiyeh
// Repository: https://github.com/BaseMax/AndroidShotNormalizer

const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const gallery = document.getElementById('gallery');
const status = document.getElementById('status');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const clearBtn = document.getElementById('clearBtn');

let results = [];
let objectURLs = [];

dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});

downloadAllBtn.addEventListener('click', downloadAll);
clearBtn.addEventListener('click', clearAll);

async function handleFiles(fileList) {
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) {
        status.textContent = 'Please select image files.';
        return;
    }

    objectURLs.forEach(url => URL.revokeObjectURL(url));
    objectURLs = [];
    results = [];
    gallery.innerHTML = '';

    status.textContent = `Processing ${files.length} image(s)...`;
    if (files.length < 3) {
        status.textContent += ' (Note: At least 3 images are recommended)';
    }

    for (const file of files) {
        try {
            const result = await processFile(file);
            const outputName = makeOutputName(file.name, result.width, result.height);
            results.push({ ...result, fileName: outputName });
            addResult(file.name, result, outputName);
        } catch (err) {
            console.error('Error processing', file.name, err);
            status.textContent = `Error processing ${file.name}`;
        }
    }

    status.textContent = `Processing of ${files.length} image(s) complete.`;
    if (files.length < 3) status.textContent += ' (Note: At least 3 images are recommended)';
}

async function processFile(file) {
    const img = await loadImage(file);
    const target = getTargetDimensions(img.width, img.height);
    const canvas = cropAndResize(img, target.width, target.height);
    const blob = await exportWithMaxSize(canvas, target.width, target.height, 3 * 1024 * 1024);
    return {
        blob,
        width: target.width,
        height: target.height,
        original: { width: img.width, height: img.height, size: file.size },
        outputSize: blob.size
    };
}

async function loadImage(file) {
    if ('createImageBitmap' in window) {
        try {
            return await createImageBitmap(file, { imageOrientation: 'from-image' });
        } catch (e) {
            // Fallback to regular Image loading
        }
    }
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Could not load image'));
        };
        img.src = url;
    });
}

function getTargetDimensions(w, h) {
    if (w >= h) {
        return { width: 1600, height: 900, ratio: 16 / 9 };
    } else {
        return { width: 900, height: 1600, ratio: 9 / 16 };
    }
}

function cropAndResize(img, targetW, targetH) {
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');

    const sourceRatio = img.width / img.height;
    const targetRatio = targetW / targetH;
    let sx, sy, sw, sh;

    if (sourceRatio > targetRatio) {
        sw = img.height * targetRatio;
        sh = img.height;
        sx = (img.width - sw) / 2;
        sy = 0;
    } else {
        sh = img.width / targetRatio;
        sw = img.width;
        sx = 0;
        sy = (img.height - sh) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
    return canvas;
}

async function exportWithMaxSize(canvas, width, height, maxSize) {
    let quality = 0.92;
    let blob;
    do {
        blob = await new Promise((resolve, reject) => {
            canvas.toBlob((b) => {
                if (b) resolve(b);
                else reject(new Error('toBlob returned null'));
            }, 'image/jpeg', quality);
        });
        if (blob.size <= maxSize || quality <= 0.3) break;
        quality -= 0.05;
    } while (quality >= 0.3);
    return blob;
}

function makeOutputName(originalName, width, height) {
    const base = originalName.replace(/\.[^/.]+$/, '');
    const orientation = width >= height ? '16x9' : '9x16';
    return `${base}_${width}x${height}_${orientation}.jpg`;
}

function addResult(originalName, result, outputName) {
    const url = URL.createObjectURL(result.blob);
    objectURLs.push(url);

    const card = document.createElement('div');
    card.className = 'card';

    const img = document.createElement('img');
    img.src = url;
    img.alt = originalName;
    img.loading = 'lazy';

    const info = document.createElement('div');
    info.className = 'info';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = `File: ${originalName}`;

    const origDimSpan = document.createElement('span');
    origDimSpan.textContent = `Original dimensions: ${result.original.width}×${result.original.height}`;

    const dimSpan = document.createElement('span');
    dimSpan.textContent = `Output dimensions: ${result.width}×${result.height} (${result.width >= result.height ? '16:9' : '9:16'})`;

    const sizeSpan = document.createElement('span');
    sizeSpan.textContent = `Output size: ${(result.outputSize / 1024 / 1024).toFixed(2)} MB (max 3 MB)`;

    info.appendChild(nameSpan);
    info.appendChild(origDimSpan);
    info.appendChild(dimSpan);
    info.appendChild(sizeSpan);

    const downloadLink = document.createElement('a');
    downloadLink.className = 'download';
    downloadLink.href = url;
    downloadLink.download = outputName;
    downloadLink.textContent = 'Download';

    card.appendChild(img);
    card.appendChild(info);
    card.appendChild(downloadLink);

    gallery.appendChild(card);
}

function clearAll() {
    gallery.innerHTML = '';
    objectURLs.forEach(url => URL.revokeObjectURL(url));
    objectURLs = [];
    results = [];
    status.textContent = '';
    fileInput.value = '';
}

async function downloadAll() {
    if (results.length === 0) {
        status.textContent = 'No images processed yet.';
        return;
    }
    if (typeof JSZip === 'undefined') {
        alert('JSZip library not loaded. Please use individual download or check your internet connection.');
        return;
    }

    const zip = new JSZip();
    results.forEach(r => {
        zip.file(r.fileName, r.blob);
    });

    status.textContent = 'Building ZIP file...';
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resized_images.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    status.textContent = 'ZIP file ready.';
}
