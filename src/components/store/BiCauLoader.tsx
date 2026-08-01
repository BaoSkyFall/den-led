import Image from "next/image";

/**
 * The projector-lens loader: concentric rings turning around the logo, with an
 * amber halo standing in for a DRL angel eye.
 *
 * Lifted out of `shop/[slug]/page.tsx`, where it was defined inline in an
 * 891-line file and so could not be used anywhere else. It holds no state and
 * runs entirely on CSS keyframes, so it stays a server component and a
 * `loading.tsx` can render it directly.
 *
 * `fullscreen` is the original behaviour and is reserved for a first, cold
 * entry to the site. Navigating between pages uses the progress bar and the
 * per-route skeletons instead — a full-screen takeover on every click reads as
 * the site being slow rather than as branding.
 */
export default function BiCauLoader({
  fullscreen = true,
  label = "Sân Chơi Đèn Led",
}: {
  fullscreen?: boolean;
  label?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-10 overflow-hidden ${
        fullscreen ? "min-h-screen bg-[#0a0a0a]" : "py-16"
      }`}
      role="status"
      aria-label="Đang tải"
    >
      <style>{`
        @keyframes bcOuterSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes bcInnerSpin {
          to { transform: rotate(-360deg); }
        }
        @keyframes bcDrlGlow {
          0%,100% {
            box-shadow: 0 0 6px 2px rgba(251,191,36,0.5),
                        0 0 14px 4px rgba(251,191,36,0.2),
                        inset 0 0 6px rgba(251,191,36,0.15);
          }
          50% {
            box-shadow: 0 0 12px 4px rgba(251,191,36,0.9),
                        0 0 28px 10px rgba(251,191,36,0.4),
                        inset 0 0 12px rgba(251,191,36,0.3);
          }
        }
        @keyframes bcLogoPulse {
          0%,100% {
            filter: drop-shadow(0 0 6px rgba(251,191,36,0.55))
                    drop-shadow(0 0 18px rgba(251,191,36,0.35));
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 12px rgba(251,191,36,0.85))
                    drop-shadow(0 0 32px rgba(251,191,36,0.55));
            transform: scale(1.06);
          }
        }
        @keyframes bcBeam {
          0%,100% { opacity: 0.08; }
          50% { opacity: 0.18; }
        }
        @keyframes bcAmbient {
          0%,100% { opacity: 0.12; }
          50% { opacity: 0.22; }
        }
        @keyframes bcChip {
          0%,100% { opacity:1; box-shadow: 0 0 3px 2px rgba(255,255,255,0.9); }
          50% { opacity:0.6; box-shadow: 0 0 5px 3px rgba(255,255,255,0.5); }
        }
        @keyframes bcTextBlink {
          0%,100% { opacity:1; }
          50% { opacity:0.4; }
        }
        /* Someone who asked the OS to stop animations should get a still
           lens rather than a spinning one. */
        @media (prefers-reduced-motion: reduce) {
          [data-bicau] *, [data-bicau] { animation: none !important; }
        }
      `}</style>

      <div className="relative flex items-center justify-center" data-bicau>
        {/* ── Ambient background glow ── */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 220,
            height: 220,
            background:
              "radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)",
            animation: "bcAmbient 2s ease-in-out infinite",
          }}
        />

        {/* ── Light beam projected forward ── */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "50%",
            left: "50%",
            width: 0,
            height: 0,
            borderLeft: "60px solid transparent",
            borderRight: "60px solid transparent",
            borderTop: "130px solid rgba(251,191,36,0.07)",
            transform: "translateX(-50%)",
            filter: "blur(10px)",
            animation: "bcBeam 2.5s ease-in-out infinite",
          }}
        />

        {/* ── Bi cầu assembly (110 × 110) ── */}
        <div className="relative" style={{ width: 110, height: 110 }}>
          {/* Outer dashed housing — slow CW */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: "1px dashed rgba(251,191,36,0.25)",
              animation: "bcOuterSpin 10s linear infinite",
            }}
          />

          {/* Segmented arc ring — medium CW */}
          <div
            className="absolute inset-1 rounded-full"
            style={{ animation: "bcOuterSpin 5s linear infinite" }}
          >
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              style={{ transform: "rotate(-90deg)" }}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <circle
                  key={i}
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke={
                    i % 2 === 0
                      ? "rgba(251,191,36,0.55)"
                      : "rgba(255,255,255,0.06)"
                  }
                  strokeWidth="3"
                  strokeDasharray="24 12"
                  strokeDashoffset={-(i * 18)}
                />
              ))}
            </svg>
          </div>

          {/* Counter-rotating tick ring */}
          <div
            className="absolute inset-5 rounded-full"
            style={{ animation: "bcInnerSpin 4s linear infinite" }}
          >
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              style={{ transform: "rotate(-90deg)" }}
            >
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
                strokeDasharray="6 18"
              />
            </svg>
          </div>

          {/* DRL angel-eye — amber pulse (kept as halo behind logo) */}
          <div
            className="absolute rounded-full"
            style={{
              inset: 18,
              border: "2px solid rgba(251,191,36,0.8)",
              animation: "bcDrlGlow 1.6s ease-in-out infinite",
            }}
          />

          {/* Logo — centre pulse */}
          <div
            className="absolute"
            style={{
              inset: 22,
              animation: "bcLogoPulse 2s ease-in-out infinite",
            }}
          >
            <Image
              src="/logo.png"
              alt="Sân Chơi Đèn Led"
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Label */}
      <div className="flex flex-col items-center gap-2 z-10" data-bicau>
        <p
          className="text-[9px] font-black tracking-[0.3em] uppercase text-amber-500"
          style={{ animation: "bcTextBlink 2s ease-in-out infinite" }}
        >
          {label}
        </p>
        <div className="flex items-center gap-1.5">
          {[0, 0.15, 0.3].map((delay) => (
            <div
              key={delay}
              className="w-1 h-1 rounded-full bg-white/30"
              style={{
                animation: `bcChip 1.2s ease-in-out infinite ${delay}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
