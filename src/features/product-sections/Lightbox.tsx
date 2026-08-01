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
 * Image viewer for the storefront: a panel over a dimmed page rather than a
 * full-bleed takeover, with the rest of the gallery on a strip underneath so
 * the customer can see what else there is and jump straight to it.
 *
 * Built on the Radix dialog already in the project rather than a lightbox
 * dependency — the only things it needs beyond a modal are swipe, arrows and
 * pinch, and each is a few lines against touch events.
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
  const stripRef = useRef<HTMLDivElement>(null);

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

  // Keep the active thumbnail in view when the arrows or a swipe move the
  // selection past the edge of the strip. Scrolls the strip itself rather than
  // scrollIntoView, which would walk every scroll ancestor including the page.
  useEffect(() => {
    const strip = stripRef.current;
    const thumb = strip?.children[index] as HTMLElement | undefined;
    if (!strip || !thumb) return;
    const stripBox = strip.getBoundingClientRect();
    const thumbBox = thumb.getBoundingClientRect();
    strip.scrollTo({
      left:
        strip.scrollLeft +
        thumbBox.left -
        stripBox.left -
        (stripBox.width - thumbBox.width) / 2,
      behavior: "smooth",
    });
  }, [index, isOpen]);

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
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 outline-none"
          // The image handles the gestures; without this Radix takes the first
          // touch to try to dismiss the dialog.
          onOpenAutoFocus={(e) => e.preventDefault()}
          // Radix treats everything inside Content as "inside", and Content is
          // the full-viewport centring wrapper here — so the dimmed margin
          // around the panel needs to close the dialog explicitly.
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <DialogPrimitive.Title className="sr-only">
            {current.alt || `Ảnh ${index + 1}`}
          </DialogPrimitive.Title>

          <div
            className="relative flex flex-col w-full max-w-4xl max-h-[88vh] bg-[#111111] border border-white/10 shadow-2xl overflow-hidden"
            // Clicks inside the panel must not reach the overlay and close it.
            onClick={(e) => e.stopPropagation()}
          >
            {/* Stage */}
            <div
              className="relative flex-1 min-h-0 bg-[#0a0a0a] touch-none select-none overflow-hidden"
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
                sizes="(max-width: 896px) 100vw, 896px"
                priority
                draggable={false}
                className="object-contain"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  transition: pinchStart.current ? "none" : "transform 150ms",
                }}
              />

              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng"
                className="absolute top-2 right-2 z-10 w-10 h-10 flex items-center justify-center bg-black/70 text-white hover:bg-amber-500 hover:text-black transition-colors"
              >
                <X size={18} />
              </button>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Ảnh trước"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-black/70 text-white hover:bg-amber-500 hover:text-black transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Ảnh tiếp"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-black/70 text-white hover:bg-amber-500 hover:text-black transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 bg-black/70 text-white text-[10px] font-bold tracking-widest px-2.5 py-1">
                    {index + 1} / {images.length}
                  </span>
                </>
              )}
            </div>

            {/* Gallery strip — one row that scrolls sideways, so a product with
                many photos never grows the panel past the viewport. */}
            {images.length > 1 && (
              <div
                ref={stripRef}
                className="shrink-0 flex gap-2 overflow-x-auto border-t border-white/10 p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {images.map((img, i) => (
                  <button
                    key={`${img.src}-${i}`}
                    type="button"
                    onClick={() => {
                      setIndex(i);
                      resetView();
                    }}
                    aria-label={`Ảnh ${i + 1}`}
                    className={`relative shrink-0 w-14 sm:w-16 aspect-square overflow-hidden border-2 transition-colors ${
                      index === i
                        ? "border-amber-500"
                        : "border-white/10 hover:border-white/40"
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
