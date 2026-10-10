import { useEffect, useRef } from 'react';

const COLORS = ['#7ef9e3', '#1fd1c3', '#d06bff', '#ff8fd8', '#ffd98a', '#fdf6ff'];

interface Sparkle {
  x: number;
  y: number;
  size: number;
  color: string;
  phase: number;
  twinkle: number;
  drift: number;
  rise: number;
}

interface Bubble {
  x: number;
  y: number;
  radius: number;
  rise: number;
  sway: number;
  phase: number;
  alpha: number;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)]!;

/**
 * Ambient glitter layer: drifting bubbles and twinkling sparkles on a fixed
 * canvas behind the page. Decorative only, and it renders a single static
 * frame when the user prefers reduced motion.
 */
export function Sparkles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let sparkles: Sparkle[] = [];
    let bubbles: Bubble[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Density scales with viewport area, capped so large screens stay smooth.
      const area = width * height;
      const sparkleCount = Math.min(150, Math.round(area / 10000));
      const bubbleCount = Math.min(30, Math.round(area / 52000));

      sparkles = Array.from({ length: sparkleCount }, () => ({
        x: rand(0, width),
        y: rand(0, height),
        size: rand(0.8, 2.5),
        color: pick(COLORS),
        phase: rand(0, Math.PI * 2),
        twinkle: rand(0.6, 2.1),
        drift: rand(-6, 6),
        rise: rand(4, 17)
      }));

      bubbles = Array.from({ length: bubbleCount }, () => ({
        x: rand(0, width),
        y: rand(0, height) + height,
        radius: rand(3, 12),
        rise: rand(14, 42),
        sway: rand(6, 20),
        phase: rand(0, Math.PI * 2),
        alpha: rand(0.06, 0.2)
      }));
    };

    /** Wrap a rising object back to the bottom once it floats off the top. */
    const wrap = (y: number, margin: number) =>
      ((y % (height + margin * 2)) + height + margin * 2) % (height + margin * 2) - margin;

    const drawSparkle = (s: Sparkle, x: number, y: number, alpha: number) => {
      const r = s.size;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = s.color;

      // Four-point sparkle drawn as crossed tapers.
      ctx.beginPath();
      ctx.moveTo(x, y - r * 3.2);
      ctx.quadraticCurveTo(x, y, x + r * 3.2, y);
      ctx.quadraticCurveTo(x, y, x, y + r * 3.2);
      ctx.quadraticCurveTo(x, y, x - r * 3.2, y);
      ctx.quadraticCurveTo(x, y, x, y - r * 3.2);
      ctx.fill();

      ctx.globalAlpha = alpha * 0.45;
      ctx.beginPath();
      ctx.arc(x, y, r * 1.4, 0, Math.PI * 2);
      ctx.fill();
    };

    const render = (elapsed: number) => {
      ctx.clearRect(0, 0, width, height);

      bubbles.forEach((b) => {
        const y = wrap(b.y - elapsed * b.rise, 60);
        const x = b.x + Math.sin(elapsed * 0.6 + b.phase) * b.sway;

        ctx.globalAlpha = b.alpha;
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = '#bff8ef';
        ctx.beginPath();
        ctx.arc(x, y, b.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = b.alpha * 1.4;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x - b.radius * 0.33, y - b.radius * 0.36, b.radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
      });

      sparkles.forEach((s) => {
        const pulse = Math.sin(elapsed * s.twinkle + s.phase);
        const alpha = Math.max(0, pulse) * 0.8;
        if (alpha < 0.02) return;

        const y = wrap(s.y - elapsed * s.rise, 40);
        const x = s.x + Math.sin(elapsed * 0.4 + s.phase) * s.drift;
        drawSparkle(s, x, y, alpha);
      });

      ctx.globalAlpha = 1;
    };

    resize();

    let frame = 0;
    let start: number | null = null;

    if (reduceMotion) {
      render(1.2);
    } else {
      const tick = (timestamp: number) => {
        if (start === null) start = timestamp;
        render((timestamp - start) / 1000);
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }

    let resizeTimer: number | undefined;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        if (reduceMotion) render(1.2);
      }, 150);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}
    />
  );
}
