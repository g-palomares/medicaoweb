
export default function Segmentado({ nome, rotulo, valor, onChange, opcoes }) {
  return (
    <div className="segmentado" role="radiogroup" aria-label={rotulo}>
      {opcoes.map((o) => (
        <label key={o.valor}>
          <input
            type="radio"
            name={nome}
            value={o.valor}
            checked={valor === o.valor}
            onChange={() => onChange(o.valor)}
          />
          <span>
            {o.banda && <i className="ponto" data-banda={o.banda} />}
            {o.rotulo}
          </span>
        </label>
      ))}
    </div>
  );
}
