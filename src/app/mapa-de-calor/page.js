import MapaDeCalor from "@/components/MapaDeCalor";

export default function Page() {
  return (
    <>
      <div className="cabecalho">
        <h1>Mapa de calor</h1>
        <p>Download médio de cada cômodo sobre a planta da casa. Escolha a banda para comparar.</p>
      </div>
      <MapaDeCalor />
    </>
  );
}
