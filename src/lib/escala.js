
const PARADAS = [
  [0.0, [53, 35, 143]],
  [0.35, [155, 45, 159]],
  [0.65, [228, 71, 59]],
  [1.0, [255, 178, 26]],
];

export function corDaEscala(t) {
  const x = Math.min(Math.max(t, 0), 1);
  for (let i = 1; i < PARADAS.length; i++) {
    const [t1, c1] = PARADAS[i];
    if (x <= t1) {
      const [t0, c0] = PARADAS[i - 1];
      const k = (x - t0) / (t1 - t0);
      return c0.map((v, j) => Math.round(v + (c1[j] - v) * k));
    }
  }
  return PARADAS[PARADAS.length - 1][1];
}

export const GRADIENTE_CSS = `linear-gradient(90deg, ${PARADAS.map(
  ([t, c]) => `rgb(${c.join(",")}) ${t * 100}%`
).join(", ")})`;

// 66.666 -> "66,7"   |   349 -> "349"
export const formatarMbps = (v) =>
  Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
