"use client";
import { useEffect, useState } from "react";
import Heatmap from "./Heatmap";

export default function MapaDeCalor() {
  const [resumo, setResumo] = useState([]);
  const [comodos, setComodos] = useState([]);
  const [banda, setBanda] = useState("5");

  useEffect(() => {
    fetch("/api/resumo").then((r) => r.json()).then(setResumo);
    fetch("/api/comodos").then((r) => r.json()).then(setComodos);
  }, []);

  const doBanda = resumo.filter((r) => r.banda === banda);
  const max = Math.max(...doBanda.map((r) => r.media), 1);
  const andares = [...new Set(comodos.map((c) => c.andar))];

  return (
    <div>
      <select value={banda} onChange={(e) => setBanda(e.target.value)}>
        <option value="2.4">2,4 GHz</option>
        <option value="5">5 GHz</option>
      </select>
      <p>Vermelho = mais rápido, verde = mais lento (escala da banda escolhida, máx. {max} Mbps).</p>
      {andares.map((andar) => (
        <div key={andar}>
          <h3>Andar {andar}</h3>
          <Heatmap
            planta={`/plantas/andar-${andar}.png`}
            max={max}
            comodos={comodos
              .filter((c) => c.andar === andar)
              .map((c) => ({
                nome: c.nome, x: c.x, y: c.y,
                valor: doBanda.find((r) => r.comodo === c.nome)?.media ?? 0,
              }))}
          />
        </div>
      ))}
    </div>
  );
}
