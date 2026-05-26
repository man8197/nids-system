import { useEffect, useRef } from "react";

export function Particles({ density = 40 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const pts = Array.from({ length: density }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.6 + 0.4,
      hue: Math.random() > 0.5 ? 195 : 290,
    }));
    const tick = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > c.width) p.vx *= -1;
        if (p.y < 0 || p.y > c.height) p.vy *= -1;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue},90%,65%,0.7)`;
        ctx.shadowColor = `hsla(${p.hue},90%,65%,0.9)`;
        ctx.shadowBlur = 8;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      // connections
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.hypot(dx, dy);
          if (d < 110) {
            ctx.strokeStyle = `hsla(195,90%,65%,${(1 - d / 110) * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [density]);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none opacity-60" />;
}
