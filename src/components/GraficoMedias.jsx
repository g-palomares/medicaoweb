"use client";
import { useEffect, useState } from "react";
import { formatarMbps } from "@/lib/escala";
import s from "./GraficoMedias.module.css";

const BANDAS = [
  { chave: "2.4", rotulo: "2,4 GHz" },
  { chave: "5", rotulo: "5 GHz" },
];


const PASSOS = [5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000];
function escala(maior) {
  const alvo = maior * 1.12;
  const passo = PASSOS.find((p) => Math.ceil(alvo / p) <= 5) ?? 2000;
  const n = Math.max(Math.ceil(alvo / passo), 1);
  return { passo, n, teto: passo * n };
}

export default function GraficoMedias() {
  const [dados, setDados] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/resumo").then((r) => r.json()),
      fetch("/api/comodos").then((r) => r.json()),
    ]).then(([resumo, comodos]) => {
      const linhas = comodos.map((c) => {
        const linha = { comodo: c.nome };
        for (const r of resumo) if (r.comodo === c.nome) linha[r.banda] = r.media;
        return linha;
      });
      setDados(linhas);
    });
  }, []);

  if (!dados) return null;

  const valores = dados.flatMap((l) => BANDAS.map((b) => l[b.chave])).filter((v) => v != null);
  if (valores.length === 0) {
    return <p className={s.vazio}>Ainda não há medições para mostrar. Adicione a primeira na aba Medições.</p>;
  }

  const { passo, n, teto } = escala(Math.max(...valores));
  const marcas = Array.from({ length: n + 1 }, (_, i) => i * passo);

  return (
    <div style={{ "--n": n }}>
      <ul className={s.legenda} aria-label="Bandas">
        {BANDAS.map((b) => (
          <li key={b.chave}>
            <i className="ponto" data-banda={b.chave} />
            {b.rotulo}
          </li>
        ))}
      </ul>

      <div className={s.eixo} aria-hidden="true">
        <div className={s.eixoMarcas}>
          {marcas.map((m, i) => (
            <span key={m} style={{ left: `${(i / n) * 100}%` }}>
              {m}
              {i === n && " Mbps"}
            </span>
          ))}
        </div>
      </div>

      <ul className={s.linhas}>
        {dados.map((l, i) => (
          <li key={l.comodo} className={s.linha}>
            <span className={s.nome}>{l.comodo}</span>
            <div className={s.plot}>
              {BANDAS.map((b) => {
                const v = l[b.chave];
                return (
                  <div key={b.chave} className={s.barra}>
                    {v != null && (
                      <span
                        className={s.fio}
                        data-banda={b.chave}
                        style={{ width: `${(v / teto) * 100}%`, animationDelay: `${i * 45}ms` }}
                      />
                    )}
                    <span className={v != null ? s.valor : s.semDado}>
                      <span className="so-leitor">{b.rotulo}: </span>
                      {v != null ? formatarMbps(v) : "–"}
                    </span>
                  </div>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
