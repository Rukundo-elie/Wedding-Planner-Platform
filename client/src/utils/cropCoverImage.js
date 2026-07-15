export const COVER_ASPECT = 3;
export const COVER_OUTPUT_WIDTH = 1200;

export const readImageFile = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('Unable to read image file.'));
  reader.readAsDataURL(file);
});

export const cropCoverImage = (
  imageSrc,
  {
    zoom = 1,
    offsetX = 0,
    offsetY = 0,
    aspect = COVER_ASPECT,
    outputWidth = COVER_OUTPUT_WIDTH,
  },
) => new Promise((resolve, reject) => {
  const img = new Image();

  img.onload = () => {
    const outputHeight = Math.round(outputWidth / aspect);
    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Unable to process image.'));
      return;
    }

    const baseScale = Math.max(outputWidth / img.width, outputHeight / img.height);
    const scale = baseScale * zoom;
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;
    const drawX = (outputWidth - drawWidth) / 2 + offsetX;
    const drawY = (outputHeight - drawHeight) / 2 + offsetY;

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    resolve(canvas.toDataURL('image/jpeg', 0.88));
  };

  img.onerror = () => reject(new Error('Unable to load image.'));
  img.src = imageSrc;
});

export const getCoverPreviewMetrics = (imageWidth, imageHeight, containerWidth, containerHeight, zoom = 1) => {
  const baseScale = Math.max(containerWidth / imageWidth, containerHeight / imageHeight);
  const scale = baseScale * zoom;

  return {
    width: imageWidth * scale,
    height: imageHeight * scale,
    baseScale,
  };
};
