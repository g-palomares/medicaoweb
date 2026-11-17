import GraficoMedias from "@/components/GraficoMedias";

export default function Page() {
  return (
    <>
      <div className="cabecalho">
        <h1>Média de velocidade por cômodo</h1>
        <p>Download médio de todas as medições de cada cômodo, nas duas bandas.</p>
      </div>
      <GraficoMedias />
    </>
  );
}
