import Medicoes from "@/components/Medicoes";

export default function Page() {
  return (
    <>
      <div className="cabecalho">
        <h1>Medições</h1>
        <p>Registre a velocidade medida em cada cômodo e consulte o histórico.</p>
      </div>
      <Medicoes />
    </>
  );
}
