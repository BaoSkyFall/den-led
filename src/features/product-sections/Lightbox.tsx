"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export type LightboxImage = { src: string; alt?: string };

type Props = {
  images: LightboxImage[];
  /** Index to open at, or null when closed. */
  openAt: number | null;
  onClose: () => void;
};

const MAX_ZOOM = 4;
const MIN_ZOOM = 1;

const distance = (a: React.Touch, b: React.Touch) =>
  Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

/**
 * Full-screen image viewer for the storefront.
 *
 * Built on the Radix dialog already in the project rather than a lightbox
 * dependency — the only things it needs beyond a modal are swipe, arrows and
 * pinch, and each is a few lines against pointer/touch events.
 *
 * Zoom and pan live in one transform so a single gesture handler drives both,
 * and resetting a slide is just clearing that transform.
 */
export default function Lightbox({ images, openAt, onClose }: Props) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Gesture bookkeeping. Refs, not state: these change on every touchmove and
  // re-rendering per frame would make the drag visibly lag the finger.
  const pinchStart = useRef<{ dist: number; zoom: number } | null>(null);
  const panStart = useRef<{
    x: number;
    y: number;
    ox: number;
    oy: number;
  } | null>(null);
  const swipeStart = useRef<number | null>(null);

  const isOpen = openAt !== null;

  const resetView = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (openAt === null) return;
    setIndex(openAt);
    resetView();
  }, [openAt, resetView]);

  const go = useCallback(
    (delta: number) => {
      if (images.length === 0) return;
      setIndex((i) => (i + delta + images.length) % images.length);
      resetView();
    },
    [images.length, resetView],
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, go]);

  if (!isOpen || images.length === 0) return null;

  const current = images[index] ?? images[0];
  const zoomed = zoom > 1;

  function onTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      pinchStart.current = {
        dist: distance(e.touches[0], e.touches[1]),
        zoom,
      };
      swipeStart.current = null;
      return;
    }
    if (e.touches.length === 1) {
      if (zoomed) {
        panStart.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          ox: offset.x,
          oy: offset.y,
        };
      } else {
        // Only track a swipe while unzoomed — otherwise dragging to look around
        // a magnified photo would keep flicking to the next one.
        swipeStart.current = e.touches[0].clientX;
      }
    }
  }

  function onTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2 && pinchStart.current) {
      const ratio =
        distance(e.touches[0], e.touches[1]) / pinchStart.current.dist;
      setZoom(clamp(pinchStart.current.zoom * ratio, MIN_ZOOM, MAX_ZOOM));
      return;
    }
    if (e.touches.length === 1 && panStart.current) {
      const p = panStart.current;
      setOffset({
        x: p.ox + (e.touches[0].clientX - p.x),
        y: p.oy + (e.touches[0].clientY - p.y),
      });
    }
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (pinchStart.current) {
      pinchStart.current = null;
      if (zoom <= MIN_ZOOM) resetView();
    }
    panStart.current = null;

    const start = swipeStart.current;
    swipeStart.current = null;
    if (start === null || zoomed) return;
    const dx = (e.changedTouches[0]?.clientX ?? start) - start;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  }

  return (
    <DialogPrimitive.Root
      open
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/95" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex items-center justify-center outline-none"
          // The image itself handles the gestures; without this Radix steals
          // the first touch to try to close the dialog.
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogPrimitive.Title className="sr-only">
            {current.alt || `Ảnh ${index + 1}`}
          </DialogPrimitive.Title>

          <div
            className="relative w-full h-full touch-none select-none"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onDoubleClick={() => (zoomed ? resetView() : setZoom(2))}
          >
            <Image
              key={current.src}
              src={current.src}
              alt={current.alt || `Ảnh ${index + 1}`}
              fill
              sizes="100vw"
              priority
              draggable={false}
              className="object-contain"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transition: pinchStart.current ? "none" : "transform 150ms",
              }}
            />
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center bg-black/60 text-white hover:bg-amber-500 hover:text-black transition-colors"
          >
            <X size={20} />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Ảnh trước"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center bg-black/60 text-white hover:bg-amber-500 hover:text-black transition-colors"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Ảnh tiếp"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center bg-black/60 text-white hover:bg-amber-500 hover:text-black transition-colors"
              >
                <ChevronRight size={22} />
              </button>
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs font-bold tracking-widest px-3 py-1.5">
                {index + 1} / {images.length}
              </span>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
