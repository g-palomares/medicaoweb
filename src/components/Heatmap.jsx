"use client";
import { useEffect, useRef } from "react";
import { corDaEscala, formatarMbps } from "@/lib/escala";
import s from "./Heatmap.module.css";

const DURACAO = 650;
const suave = (p) => 1 - Math.pow(1 - p, 3);


export default function Heatmap({ planta, comodos, max, raio = 11, descricao }) {
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const exibido = useRef(null);
  const quadro = useRef(0);
  const props = useRef({});
  props.current = { comodos, max, raio };

  function pintar(estado) {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !img.clientWidth || !img.clientHeight) return;
    const { comodos, raio } = props.current;

    const dpr = window.devicePixelRatio || 1;
    const w = img.clientWidth;
    const h = img.clientHeight;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const r = (raio / 100) * w;
    const pontos = comodos.map((c) => ({
      nome: c.nome,
      cx: (c.x / 100) * w,
      cy: (c.y / 100) * h,
      ...(estado[c.nome] ?? { valor: 0, t: 0 }),
    }));

    // 1) manchas de calor
    for (const p of pontos) {
      const [R, G, B] = corDaEscala(p.t);
      const g = ctx.createRadialGradient(p.cx, p.cy, 0, p.cx, p.cy, r);
      g.addColorStop(0, `rgba(${R},${G},${B},0.88)`);
      g.addColorStop(0.45, `rgba(${R},${G},${B},0.6)`);
      g.addColorStop(1, `rgba(${R},${G},${B},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.cx, p.cy, r, 0, Math.PI * 2);
      ctx.fill();
    }


    const familia = getComputedStyle(canvas).fontFamily;
    const ALTURA = 24;
    const FOLGA = 10;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";

    for (const p of pontos) {
      ctx.beginPath();
      ctx.arc(p.cx, p.cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#16223a";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#fff";
      ctx.stroke();

      const valorTxt = formatarMbps(p.valor);
      ctx.font = `400 12px ${familia}`;
      const larguraNome = ctx.measureText(p.nome).width;
      ctx.font = `600 13px ${familia}`;
      const larguraValor = ctx.measureText(valorTxt).width;

      const largura = 10 + larguraNome + 8 + larguraValor + 10;
      const x = Math.min(Math.max(p.cx - largura / 2, 4), w - largura - 4);
      let y = p.cy + FOLGA;
      if (y + ALTURA > h - 4) y = p.cy - FOLGA - ALTURA;

      ctx.beginPath();
      ctx.roundRect(x, y, largura, ALTURA, 6);
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#c6cdd9";
      ctx.stroke();

      ctx.font = `400 12px ${familia}`;
      ctx.fillStyle = "#56627a";
      ctx.fillText(p.nome, x + 10, y + ALTURA / 2 + 0.5);
      ctx.font = `600 13px ${familia}`;
      ctx.fillStyle = "#16223a";
      ctx.fillText(valorTxt, x + 10 + larguraNome + 8, y + ALTURA / 2 + 0.5);
    }
  }

  function levar() {
    const img = imgRef.current;
    if (!img || !img.complete || !img.clientHeight) return;
    const { comodos, max } = props.current;
    const teto = max || 1;
    const alvo = Object.fromEntries(
      comodos.map((c) => [c.nome, { valor: c.valor, t: Math.min(c.valor / teto, 1) }])
    );
    const de = exibido.current ?? {};
    cancelAnimationFrame(quadro.current);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      exibido.current = alvo;
      pintar(alvo);
      return;
    }

    const inicio = performance.now();
    const passo = (agora) => {
      const p = Math.min((agora - inicio) / DURACAO, 1);
      const k = suave(p);
      const atual = {};
      for (const nome in alvo) {
        const a = de[nome] ?? { valor: 0, t: 0 };
        atual[nome] = {
          valor: a.valor + (alvo[nome].valor - a.valor) * k,
          t: a.t + (alvo[nome].t - a.t) * k,
        };
      }
      exibido.current = atual;
      pintar(atual);
      if (p < 1) quadro.current = requestAnimationFrame(passo);
    };
    quadro.current = requestAnimationFrame(passo);
  }

  useEffect(() => {
    levar();
    return () => cancelAnimationFrame(quadro.current);
  }, [comodos, max, raio]);

  useEffect(() => {
    const obs = new ResizeObserver(() => exibido.current && pintar(exibido.current));
    if (imgRef.current) obs.observe(imgRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div className={s.moldura}>
      <div className={s.interno} role="img" aria-label={descricao}>
        <img ref={imgRef} src={planta} alt="" onLoad={levar} className={s.planta} />
        <canvas ref={canvasRef} className={s.camada} aria-hidden="true" />
      </div>
    </div>
  );
}
