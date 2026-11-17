"use client";
import { useEffect, useState } from "react";
import Segmentado from "./Segmentado";
import s from "./Medicoes.module.css";

const VAZIO = { comodo: "", banda: "5", download: "", upload: "", ping: "", dispositivo: "" };
const FILTRO_VAZIO = { comodo: "", banda: "", dia: "" };

const BANDAS = [
  { valor: "2.4", banda: "2.4", rotulo: "2,4 GHz" },
  { valor: "5", banda: "5", rotulo: "5 GHz" },
];
const BANDAS_FILTRO = [{ valor: "", rotulo: "Todas" }, ...BANDAS];
const ROTULO_BANDA = { "2.4": "2,4 GHz", "5": "5 GHz" };

const dataCurta = (d) => new Date(d).toLocaleDateString("pt-BR");
const hora = (d) => new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

export default function Medicoes() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [comodos, setComodos] = useState([]);
  const [form, setForm] = useState(VAZIO);
  const [editId, setEditId] = useState(null);
  const [erro, setErro] = useState("");
  const [filtro, setFiltro] = useState(FILTRO_VAZIO);

  const filtrando = Object.values(filtro).some(Boolean);

  async function carregar() {
    try {
      const qs = new URLSearchParams(Object.entries(filtro).filter(([, v]) => v));
      const r = await fetch("/api/medicoes?" + qs);
      const j = await r.json();
      setLista(Array.isArray(j) ? j : []);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { fetch("/api/comodos").then((r) => r.json()).then(setComodos); }, []);
  useEffect(() => { carregar(); }, [filtro]);

  const campo = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const filtrar = (k) => (e) => setFiltro({ ...filtro, [k]: e.target.value });

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
    setErro("");
    setEditId(m._id);
    setForm({ comodo: m.comodo, banda: m.banda, download: m.download,
      upload: m.upload ?? "", ping: m.ping ?? "", dispositivo: m.dispositivo ?? "" });
  }

  function cancelar() {
    setErro("");
    setEditId(null);
    setForm(VAZIO);
  }

  return (
    <>
      <section className={s.formulario} data-editando={editId ? "" : undefined} aria-labelledby="titulo-form">
        <h2 id="titulo-form" className="secao-titulo">{editId ? "Editar medição" : "Nova medição"}</h2>
        <form onSubmit={salvar} className={s.grade}>
          <label className={`campo ${s.comodo}`}>
            <span className="rotulo">Cômodo</span>
            <select className="selecao" value={form.comodo} onChange={campo("comodo")} required>
              <option value="">Escolha o cômodo</option>
              {comodos.map((c) => <option key={c._id} value={c.nome}>{c.nome}</option>)}
            </select>
          </label>

          <div className={`campo ${s.banda}`}>
            <span className="rotulo">Banda</span>
            <Segmentado
              nome="banda"
              rotulo="Banda"
              valor={form.banda}
              onChange={(v) => setForm({ ...form, banda: v })}
              opcoes={BANDAS}
            />
          </div>

          <label className={`campo ${s.dispositivo}`}>
            <span className="rotulo">Dispositivo <small>opcional</small></span>
            <input className="entrada" value={form.dispositivo} onChange={campo("dispositivo")} />
          </label>

          <label className={`campo ${s.download}`}>
            <span className="rotulo">Download</span>
            <span className="com-unidade">
              <input className="entrada" type="number" step="any" value={form.download} onChange={campo("download")} required />
              <span className="unidade">Mbps</span>
            </span>
          </label>

          <label className={`campo ${s.upload}`}>
            <span className="rotulo">Upload <small>opcional</small></span>
            <span className="com-unidade">
              <input className="entrada" type="number" step="any" value={form.upload} onChange={campo("upload")} />
              <span className="unidade">Mbps</span>
            </span>
          </label>

          <label className={`campo ${s.ping}`}>
            <span className="rotulo">Ping <small>opcional</small></span>
            <span className="com-unidade">
              <input className="entrada" type="number" step="any" value={form.ping} onChange={campo("ping")} />
              <span className="unidade">ms</span>
            </span>
          </label>

          <div className={s.acoesForm}>
            <button type="submit" className="botao botao-primario">
              {editId ? "Salvar alterações" : "Adicionar"}
            </button>
            {editId && <button type="button" className="botao" onClick={cancelar}>Cancelar</button>}
          </div>
        </form>
        {erro && <p role="alert" className={s.erro}>{erro}</p>}
      </section>

      <section className={s.historico} aria-labelledby="titulo-historico">
        <div className={s.historicoTopo}>
          <h2 id="titulo-historico" className="secao-titulo">Histórico</h2>
          <p className={s.contagem} aria-live="polite">
            {carregando ? "" : `${lista.length} ${lista.length === 1 ? "medição" : "medições"}`}
          </p>
        </div>

        <div className={s.filtros}>
          <label className="campo">
            <span className="rotulo">Cômodo</span>
            <select className="selecao" value={filtro.comodo} onChange={filtrar("comodo")}>
              <option value="">Todos</option>
              {comodos.map((c) => <option key={c._id} value={c.nome}>{c.nome}</option>)}
            </select>
          </label>
          <div className="campo">
            <span className="rotulo">Banda</span>
            <Segmentado
              nome="filtro-banda"
              rotulo="Filtrar por banda"
              valor={filtro.banda}
              onChange={(v) => setFiltro({ ...filtro, banda: v })}
              opcoes={BANDAS_FILTRO}
            />
          </div>
          <label className="campo">
            <span className="rotulo">Dia</span>
            <input className="entrada" type="date" value={filtro.dia} onChange={filtrar("dia")} />
          </label>
          {filtrando && (
            <button type="button" className={`botao-texto ${s.limpar}`} onClick={() => setFiltro(FILTRO_VAZIO)}>
              Limpar filtros
            </button>
          )}
        </div>

        <div className={s.rolagem} role="region" aria-label="Tabela de medições" tabIndex={0}>
          <table className={s.tabela}>
            <thead>
              <tr>
                <th>Cômodo</th>
                <th>Banda</th>
                <th className={s.num}>Download (Mbps)</th>
                <th className={s.num}>Upload (Mbps)</th>
                <th className={s.num}>Ping (ms)</th>
                <th>Medido em</th>
                <th><span className="so-leitor">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {!carregando && lista.length === 0 && (
                <tr>
                  <td colSpan="7" className={s.vazio}>
                    {filtrando ? "Nenhuma medição com esses filtros." : "Nenhuma medição encontrada."}
                  </td>
                </tr>
              )}
              {lista.map((m) => (
                <tr key={m._id} data-editando={m._id === editId ? "" : undefined}>
                  <td>{m.comodo}</td>
                  <td>
                    <span className={s.bandaCelula}>
                      <i className="ponto" data-banda={m.banda} />
                      {ROTULO_BANDA[m.banda]}
                    </span>
                  </td>
                  <td className={`${s.num} ${s.destaque}`}>{m.download}</td>
                  <td className={`${s.num} ${s.suave}`}>{m.upload ?? "–"}</td>
                  <td className={`${s.num} ${s.suave}`}>{m.ping ?? "–"}</td>
                  <td>
                    {dataCurta(m.medidoEm)} <span className={s.suave}>{hora(m.medidoEm)}</span>
                  </td>
                  <td>
                    <div className={s.acoes}>
                      <button type="button" className="botao-texto" onClick={() => editar(m)}>Editar</button>
                      <button type="button" className="botao-texto perigo" onClick={() => deletar(m._id)}>Deletar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
