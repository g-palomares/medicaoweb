const BANDAS = ["2.4", "5"];

const num = (v) => (v === "" || v == null ? undefined : Number(v));

export function validarMedicao(b) {
  const comodo = typeof b.comodo === "string" ? b.comodo.trim() : "";
  if (!comodo) return { erro: "Informe o cômodo." };

  const banda = String(b.banda);
  if (!BANDAS.includes(banda)) return { erro: "Banda deve ser 2.4 ou 5." };

  const download = num(b.download);
  if (!Number.isFinite(download) || download <= 0)
    return { erro: "Download deve ser um número maior que zero (Mbps)." };

  const upload = num(b.upload);
  const ping = num(b.ping);
  for (const [nome, v] of [["Upload", upload], ["Ping", ping]]) {
    if (v !== undefined && (!Number.isFinite(v) || v < 0))
      return { erro: `${nome} deve ser um número maior ou igual a zero.` };
  }

  const medidoEm = b.medidoEm ? new Date(b.medidoEm) : new Date();
  if (Number.isNaN(medidoEm.getTime())) return { erro: "Data inválida." };

  const dados = { comodo, banda, download, medidoEm };
  if (upload !== undefined) dados.upload = upload;
  if (ping !== undefined) dados.ping = ping;
  if (b.dispositivo?.trim()) dados.dispositivo = b.dispositivo.trim();
  return { dados };
}
