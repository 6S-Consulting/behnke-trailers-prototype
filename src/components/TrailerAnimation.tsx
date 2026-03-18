import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

/**
 * Trailer assembly SVG animation driven by discovery step (0–3).
 * Renders as an absolute-positioned background layer.
 * Uses Tailwind v3 CSS variable syntax: hsl(var(--primary))
 */
const TrailerAnimation = ({ step }: { step: number }) => {
  const progress = useMotionValue(0);

  useEffect(() => {
    const targets = [0, 0.33, 0.66, 1];
    animate(progress, targets[step] ?? 0, { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] });
  }, [step, progress]);

  // Equipment
  const equipX       = useTransform(progress, [0, 0.1, 0.66, 0.9], [0, 0, 0, -180]);
  const equipY       = useTransform(progress, [0.7, 0.9], [0, -20]);
  const equipScale   = useTransform(progress, [0, 0.08], [0.8, 1]);
  const equipOpacity = useTransform(progress, [0, 0.08], [0, 1]);

  // Ground
  const groundWidth = useTransform(progress, [0, 0.2], ["0%", "100%"]);

  // Frame
  const frameOpacity = useTransform(progress, [0.15, 0.25], [0, 1]);
  const frameDrawn   = useTransform(progress, [0.15, 0.4], [0, 1]);

  // Axles
  const axle1X      = useTransform(progress, [0.25, 0.4],  [80, 0]);
  const axle2X      = useTransform(progress, [0.3,  0.45], [80, 0]);
  const axleOpacity = useTransform(progress, [0.25, 0.35], [0, 1]);

  // Wheels
  const wheelScale    = useTransform(progress, [0.35, 0.5],        [0, 1]);
  const wheelRotation = useTransform(progress, [0.66, 0.9],        [0, 360]);

  // Deck
  const deckOpacity = useTransform(progress, [0.42, 0.52], [0, 1]);
  const deckScaleX  = useTransform(progress, [0.42, 0.55], [0, 1]);

  // Ramp
  const rampRotation = useTransform(progress, [0.5, 0.62, 0.85, 0.95], [90, 0, 0, 90]);
  const rampOpacity  = useTransform(progress, [0.5, 0.58], [0, 1]);

  // Tongue
  const tongueOpacity = useTransform(progress, [0.3, 0.4],  [0, 1]);
  const tongueDrawn   = useTransform(progress, [0.3, 0.48], [0, 1]);

  // Suspension
  const suspensionY = useTransform(progress, [0.8, 0.92], [0, 3]);

  // Overall scene (subtle watermark opacity)
  const sceneOpacity = useTransform(progress, [0, 0.05], [0.15, 0.25]);

  // Tailwind v3 color tokens
  const C = {
    primary:        "hsl(var(--primary))",
    primary15:      "hsl(var(--primary) / 0.15)",
    primary8:       "hsl(var(--primary) / 0.08)",
    primary10:      "hsl(var(--primary) / 0.10)",
    primary30:      "hsl(var(--primary) / 0.30)",
    primary40:      "hsl(var(--primary) / 0.40)",
    primary50:      "hsl(var(--primary) / 0.50)",
    primary60:      "hsl(var(--primary) / 0.60)",
    primary80:      "hsl(var(--primary) / 0.80)",
    primary90:      "hsl(var(--primary) / 0.90)",
    fg70:           "hsl(var(--foreground) / 0.70)",
    fg60:           "hsl(var(--foreground) / 0.60)",
    fg50:           "hsl(var(--foreground) / 0.50)",
    fg40:           "hsl(var(--foreground) / 0.40)",
    fg30:           "hsl(var(--foreground) / 0.30)",
    muted80:        "hsl(var(--muted-foreground) / 0.80)",
    mutedFg:        "hsl(var(--muted-foreground))",
    bg40:           "hsl(var(--background) / 0.40)",
  };

  return (
    <motion.div
      style={{ opacity: sceneOpacity }}
      className="absolute inset-0 flex items-start justify-center pt-[100px] pointer-events-none select-none overflow-hidden z-0"
    >
      <div className="relative w-full max-w-5xl h-[400px]">

        {/* Ground line */}
        <motion.div
          style={{ width: groundWidth }}
          className="absolute bottom-[60px] left-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-primary/20"
        />

        <svg
          viewBox="0 0 900 350"
          className="absolute inset-0 w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ── Tongue ── */}
          <motion.g style={{ opacity: tongueOpacity }}>
            <motion.line x1="220" y1="230" x2="140" y2="230"
              stroke={C.primary} strokeWidth="4" strokeLinecap="round"
              style={{ pathLength: tongueDrawn }} />
            <motion.circle cx="135" cy="230" r="6"
              stroke={C.primary} strokeWidth="2" fill="none"
              style={{ opacity: tongueDrawn }} />
            <motion.line x1="140" y1="230" x2="160" y2="250"
              stroke={C.primary} strokeWidth="3"
              style={{ pathLength: tongueDrawn }} />
          </motion.g>

          {/* ── Frame ── */}
          <motion.g style={{ opacity: frameOpacity }}>
            <motion.rect x="220" y="224" width="420" height="12" rx="2"
              fill={C.primary15} stroke={C.primary} strokeWidth="2"
              style={{ scaleX: frameDrawn, transformOrigin: "220px 230px" }} />
            {[280, 340, 400, 460, 520, 580].map((x, idx) => (
              <motion.line key={idx} x1={x} y1="226" x2={x} y2="236"
                stroke={C.primary50} strokeWidth="2"
                style={{ opacity: frameDrawn }} />
            ))}
          </motion.g>

          {/* ── Axles ── */}
          <motion.g style={{ opacity: axleOpacity }}>
            <motion.g style={{ x: axle1X }}>
              <rect x="380" y="240" width="60" height="6" rx="3" fill={C.mutedFg} />
              <motion.rect x="380" y="240" width="60" height="6" rx="3"
                fill={C.primary30} style={{ y: suspensionY }} />
            </motion.g>
            <motion.g style={{ x: axle2X }}>
              <rect x="520" y="240" width="60" height="6" rx="3" fill={C.mutedFg} />
              <motion.rect x="520" y="240" width="60" height="6" rx="3"
                fill={C.primary30} style={{ y: suspensionY }} />
            </motion.g>
          </motion.g>

          {/* ── Wheels ── */}
          <motion.g style={{ scale: wheelScale, transformOrigin: "450px 270px" }}>
            {[375, 445, 525, 595].map((cx) => (
              <motion.g key={cx} style={{ rotate: wheelRotation, transformOrigin: `${cx}px 268px` }}>
                <circle cx={cx} cy={268} r={22} fill={C.muted80} stroke={C.fg60} strokeWidth={3} />
                <circle cx={cx} cy={268} r={14} fill="none" stroke={C.fg30} strokeWidth={1} />
                <circle cx={cx} cy={268} r={5}  fill={C.primary} />
              </motion.g>
            ))}
          </motion.g>

          {/* ── Deck ── */}
          <motion.g style={{ opacity: deckOpacity }}>
            <motion.rect x="220" y="212" width="420" height="12" rx="1"
              fill={C.primary8} stroke={C.primary40} strokeWidth="1"
              style={{ scaleX: deckScaleX, transformOrigin: "220px 218px" }} />
          </motion.g>

          {/* ── Ramp ── */}
          <motion.g style={{ opacity: rampOpacity }}>
            <motion.g style={{ rotate: rampRotation, transformOrigin: "640px 224px" }}>
              <rect x="640" y="212" width="80" height="12" rx="1"
                fill={C.primary10} stroke={C.primary50} strokeWidth="1.5" />
            </motion.g>
          </motion.g>

          {/* ── Equipment (Excavator) ── */}
          <motion.g style={{ x: equipX, y: equipY, scale: equipScale, opacity: equipOpacity, transformOrigin: "700px 180px" }}>
            <rect x="650" y="200" width="120" height="16" rx="8" fill={C.fg70} />
            <rect x="656" y="203" width="108" height="10" rx="5" fill={C.fg40} />
            <circle cx="670" cy="208" r="6" fill={C.fg50} stroke={C.fg70} strokeWidth="1" />
            <circle cx="710" cy="208" r="6" fill={C.fg50} stroke={C.fg70} strokeWidth="1" />
            <circle cx="750" cy="208" r="6" fill={C.fg50} stroke={C.fg70} strokeWidth="1" />
            <rect x="660" y="168" width="100" height="34" rx="4" fill={C.primary} />
            <rect x="665" y="172" width="40"  height="22" rx="2" fill={C.primary60} />
            <rect x="710" y="155" width="45"  height="45" rx="4" fill={C.primary90} />
            <rect x="715" y="160" width="35"  height="20" rx="2"
              fill={C.bg40} stroke={C.primary60} strokeWidth="1" />
            <line x1="670" y1="172" x2="620" y2="130" stroke={C.primary} strokeWidth="8" strokeLinecap="round" />
            <line x1="620" y1="130" x2="590" y2="170" stroke={C.primary} strokeWidth="6" strokeLinecap="round" />
            <path d="M 580 170 L 590 170 L 600 190 L 575 190 Z" fill={C.primary80} />
            <line x1="575" y1="190" x2="600" y2="190" stroke={C.primary} strokeWidth="3" strokeLinecap="round" />
            <line x1="680" y1="180" x2="640" y2="145" stroke={C.mutedFg} strokeWidth="3" strokeLinecap="round" />
            <circle cx="680" cy="180" r="3" fill={C.mutedFg} />
          </motion.g>
        </svg>

        {/* Glow blob */}
        <motion.div
          style={{ opacity: frameOpacity }}
          className="absolute bottom-[55%] left-[25%] w-[50%] h-20 bg-primary/5 blur-3xl rounded-full pointer-events-none"
        />
      </div>
    </motion.div>
  );
};

export default TrailerAnimation;
