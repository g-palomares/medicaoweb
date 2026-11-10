"use client";
import { useEffect, useState } from "react";

const VAZIO = { comodo: "Sala", banda: "5", download: "", upload: "", ping: "", dispositivo: "" };

export default function Medicoes() {
  const [lista, setLista] = useState([]);
  const [comodos, setComodos] = useState([]);
  const [form, setForm] = useState(VAZIO);
  const [editId, setEditId] = useState(null);
  const [erro, setErro] = useState("");
  const [filtro, setFiltro] = useState({ comodo: "", banda: "", dia: "" });

  async function carregar() {
    const qs = new URLSearchParams(Object.entries(filtro).filter(([, v]) => v));
    const r = await fetch("/api/medicoes?" + qs);
    setLista(await r.json());
  }

  useEffect(() => { fetch("/api/comodos").then((r) => r.json()).then(setComodos); }, []);
  useEffect(() => { carregar(); }, [filtro]);

  const campo = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function salvar(e) {
    e.preventDefault();
    setErro("");
    const r = await fetch(editId ? `/api/medicoes/${editId}` : "/api/medicoes", {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const j = await r.json();
    if (!r.ok) return setErro(j.erro);
    setForm(VAZIO);
    setEditId(null);
    carregar();
  }

  async function deletar(id) {
    if (!confirm("Deletar esta medição?")) return;
    await fetch(`/api/medicoes/${id}`, { method: "DELETE" });
    carregar();
  }

  function editar(m) {
    setEditId(m._id);
    setForm({ comodo: m.comodo, banda: m.banda, download: m.download,
      upload: m.upload ?? "", ping: m.ping ?? "", dispositivo: m.dispositivo ?? "" });
  }

  return (
    <div>
      <h2>{editId ? "Editar medição" : "Nova medição"}</h2>
      <form onSubmit={salvar} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select value={form.comodo} onChange={campo("comodo")} required>
          <option value="">Cômodo…</option>
          {comodos.map((c) => <option key={c._id} value={c.nome}>{c.nome}</option>)}
        </select>
        <select value={form.banda} onChange={campo("banda")}>
          <option value="2.4">2,4 GHz</option>
          <option value="5">5 GHz</option>
        </select>
        <input type="number" step="any" placeholder="Download (Mbps)" value={form.download} onChange={campo("download")} required />
        <input type="number" step="any" placeholder="Upload (opcional)" value={form.upload} onChange={campo("upload")} />
        <input type="number" step="any" placeholder="Ping ms (opcional)" value={form.ping} onChange={campo("ping")} />
        <input placeholder="Dispositivo (opcional)" value={form.dispositivo} onChange={campo("dispositivo")} />
        <button type="submit">{editId ? "Salvar alterações" : "Adicionar"}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm(VAZIO); }}>Cancelar</button>}
      </form>
      {erro && <p style={{ color: "crimson" }}>{erro}</p>}

      <h2>Histórico</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <select value={filtro.comodo} onChange={(e) => setFiltro({ ...filtro, comodo: e.target.value })}>
          <option value="">Todos os cômodos</option>
          {comodos.map((c) => <option key={c._id} value={c.nome}>{c.nome}</option>)}
        </select>
        <select value={filtro.banda} onChange={(e) => setFiltro({ ...filtro, banda: e.target.value })}>
          <option value="">Todas as bandas</option>
          <option value="2.4">2,4 GHz</option>
          <option value="5">5 GHz</option>
        </select>
        <input type="date" value={filtro.dia} onChange={(e) => setFiltro({ ...filtro, dia: e.target.value })} />
      </div>

      <table border="1" cellPadding="6" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr><th>Cômodo</th><th>Banda</th><th>Download</th><th>Upload</th><th>Ping</th><th>Data</th><th>Ações</th></tr>
        </thead>
        <tbody>
          {lista.length === 0 && <tr><td colSpan="7">Nenhuma medição encontrada.</td></tr>}
          {lista.map((m) => (
            <tr key={m._id}>
              <td>{m.comodo}</td>
              <td>{m.banda === "2.4" ? "2,4 GHz" : "5 GHz"}</td>
              <td>{m.download} Mbps</td>
              <td>{m.upload ?? "-"}</td>
              <td>{m.ping ?? "-"}</td>
              <td>{new Date(m.medidoEm).toLocaleString("pt-BR")}</td>
              <td>
                <button onClick={() => editar(m)}>Editar</button>{" "}
                <button onClick={() => deletar(m._id)}>Deletar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
