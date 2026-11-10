"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";

export default function GraficoMedias() {
  const [dados, setDados] = useState([]);

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

  return (
    <ResponsiveContainer width="100%" height={380}>
      <BarChart data={dados}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="comodo" angle={-30} textAnchor="end" height={70} interval={0} />
        <YAxis unit=" Mbps" width={80} />
        <Tooltip />
        <Legend verticalAlign="top" />
        <Bar dataKey="2.4" name="2,4 GHz" fill="#4285f4" />
        <Bar dataKey="5" name="5 GHz" fill="#b388f5" />
      </BarChart>
    </ResponsiveContainer>
  );
}
