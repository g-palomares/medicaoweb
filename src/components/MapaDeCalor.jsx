"use client";
import { useEffect, useState } from "react";
import Heatmap from "./Heatmap";
import Segmentado from "./Segmentado";
import { GRADIENTE_CSS, formatarMbps } from "@/lib/escala";
import s from "./MapaDeCalor.module.css";

const BANDAS = [
  { valor: "2.4", banda: "2.4", rotulo: "2,4 GHz" },
  { valor: "5", banda: "5", rotulo: "5 GHz" },
];

export default function MapaDeCalor() {
  const [resumo, setResumo] = useState(null);
  const [comodos, setComodos] = useState(null);
  const [banda, setBanda] = useState("5");

  useEffect(() => {
    fetch("/api/resumo").then((r) => r.json()).then(setResumo);
    fetch("/api/comodos").then((r) => r.json()).then(setComodos);
  }, []);

  if (!resumo || !comodos) return null;

  const doBanda = resumo.filter((r) => r.banda === banda);
  const max = Math.max(...doBanda.map((r) => r.media), 1);
  const andares = [...new Set(comodos.map((c) => c.andar))];
  const rotuloBanda = BANDAS.find((b) => b.valor === banda).rotulo;

  return (
    <>
      <div className={s.controles}>
        <div className="campo">
          <span className="rotulo">Banda</span>
          <Segmentado nome="banda-mapa" rotulo="Banda do mapa" valor={banda} onChange={setBanda} opcoes={BANDAS} />
        </div>

        <div className={s.legenda}>
          <span className="rotulo">Download médio em {rotuloBanda}</span>
          <div className={s.escala} style={{ background: GRADIENTE_CSS }} />
          <div className={s.extremos}>
            <span>0</span>
            <span>{formatarMbps(max)} Mbps</span>
          </div>
        </div>
      </div>

      {andares.map((andar) => {
        const pontos = comodos
          .filter((c) => c.andar === andar)
          .map((c) => ({
            nome: c.nome, x: c.x, y: c.y,
            valor: doBanda.find((r) => r.comodo === c.nome)?.media ?? 0,
          }));
        const descricao =
          `Planta do andar ${andar}, ${rotuloBanda}. ` +
          pontos.map((p) => `${p.nome}: ${formatarMbps(p.valor)} Mbps`).join("; ");
        return (
          <section key={andar} className={s.andar} aria-label={`Andar ${andar}`}>
            <h2 className="secao-titulo">Andar {andar}</h2>
            <Heatmap
              planta={`/plantas/andar-${andar}.png`}
              max={max}
              comodos={pontos}
              descricao={descricao}
            />
          </section>
        );
      })}
    </>
  );
}
