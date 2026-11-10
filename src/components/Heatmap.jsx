"use client";
import { useEffect, useRef } from "react";


export default function Heatmap({ planta, comodos, max, raio = 8 }) {
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const desenhar = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !img.clientWidth) return;

    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const teto = max ?? Math.max(...comodos.map((c) => c.valor), 1);
    const r = (raio / 100) * canvas.width;

    for (const c of comodos) {
      const t = Math.min(c.valor / teto, 1); 
      const hue = 120 * (1 - t); 
      const cx = (c.x / 100) * canvas.width;
      const cy = (c.y / 100) * canvas.height;

      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `hsla(${hue}, 90%, 50%, 0.85)`);
      g.addColorStop(1, `hsla(${hue}, 90%, 50%, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#000";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${c.nome}: ${c.valor}`, cx, cy + r + 12);
    }
  };

  useEffect(() => {
    desenhar();
    const obs = new ResizeObserver(desenhar);
    if (imgRef.current) obs.observe(imgRef.current);
    return () => obs.disconnect();
  }, [comodos, max, raio]);

  return (
    <div style={{ position: "relative", maxWidth: 700 }}>
      <img
        ref={imgRef}
        src={planta}
        alt="Planta da residência"
        onLoad={desenhar}
        style={{ width: "100%", display: "block" }}
      />
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />
    </div>
  );
}
