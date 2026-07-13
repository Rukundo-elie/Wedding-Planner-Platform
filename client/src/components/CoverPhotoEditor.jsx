import React, { useEffect, useRef, useState } from 'react';
import { Move, ZoomIn, X } from 'lucide-react';
import { COVER_ASPECT, COVER_OUTPUT_WIDTH, cropCoverImage, getCoverPreviewMetrics } from '../utils/cropCoverImage';

const CoverPhotoEditor = ({ imageSrc, onSave, onCancel, saving = false }) => {
  const containerRef = useRef(null);
  const dragRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      setContainerSize({ width, height });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const clampOffset = (nextOffset, nextZoom = zoom) => {
    if (!imageSize.width || !containerSize.width) return nextOffset;

    const metrics = getCoverPreviewMetrics(
      imageSize.width,
      imageSize.height,
      containerSize.width,
      containerSize.height,
      nextZoom,
    );

    const maxX = Math.max(0, (metrics.width - containerSize.width) / 2);
    const maxY = Math.max(0, (metrics.height - containerSize.height) / 2);

    return {
      x: Math.min(maxX, Math.max(-maxX, nextOffset.x)),
      y: Math.min(maxY, Math.max(-maxY, nextOffset.y)),
    };
  };

  const handlePointerDown = (event) => {
    if (saving) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    };
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current || saving) return;

    const deltaX = event.clientX - dragRef.current.startX;
    const deltaY = event.clientY - dragRef.current.startY;
    setOffset(clampOffset({
      x: dragRef.current.originX + deltaX,
      y: dragRef.current.originY + deltaY,
    }));
  };

  const handlePointerUp = (event) => {
    if (!dragRef.current) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
  };

  const handleZoomChange = (value) => {
    const nextZoom = Number(value);
    setZoom(nextZoom);
    setOffset((current) => clampOffset(current, nextZoom));
  };

  const handleSave = async () => {
    const scaleFactor = containerSize.width
      ? COVER_OUTPUT_WIDTH / containerSize.width
      : 1;

    const croppedImage = await cropCoverImage(imageSrc, {
      zoom,
      offsetX: offset.x * scaleFactor,
      offsetY: offset.y * scaleFactor,
    });

    onSave(croppedImage);
  };

  const previewMetrics = imageSize.width
    ? getCoverPreviewMetrics(
      imageSize.width,
      imageSize.height,
      containerSize.width || 1,
      containerSize.height || 1,
      zoom,
    )
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Adjust Cover Photo</h3>
            <p className="text-sm text-gray-500">Drag to reposition and use the slider to zoom in or out.</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
            aria-label="Close editor"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div
            ref={containerRef}
            className="relative w-full overflow-hidden rounded-2xl border border-rose-100 bg-gray-950 touch-none cursor-grab active:cursor-grabbing"
            style={{ aspectRatio: `${COVER_ASPECT} / 1` }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {previewMetrics && (
              <img
                src={imageSrc}
                alt="Cover preview"
                draggable={false}
                className="absolute left-1/2 top-1/2 max-w-none select-none pointer-events-none"
                style={{
                  width: `${previewMetrics.width}px`,
                  height: `${previewMetrics.height}px`,
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                }}
              />
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-4 py-3 text-xs font-medium text-white flex items-center gap-2">
              <Move className="h-4 w-4" />
              Drag the photo to fit the banner
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-700 flex items-center gap-2">
                <ZoomIn className="h-4 w-4 text-rose-500" />
                Zoom
              </span>
              <span className="text-gray-500">{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(e) => handleZoomChange(e.target.value)}
              disabled={saving}
              className="w-full accent-rose-600"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-2xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !previewMetrics}
            className="rounded-2xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-500 transition disabled:bg-rose-400"
          >
            {saving ? 'Saving...' : 'Save Cover Photo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoverPhotoEditor;
