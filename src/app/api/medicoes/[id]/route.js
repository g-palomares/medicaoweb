import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { validarMedicao } from "@/lib/validacao";

const idInvalido = () => NextResponse.json({ erro: "ID inválido." }, { status: 400 });
const naoAchou = () => NextResponse.json({ erro: "Medição não encontrada." }, { status: 404 });

export async function PUT(req, { params }) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) return idInvalido();
  const { erro, dados } = validarMedicao(await req.json());
  if (erro) return NextResponse.json({ erro }, { status: 400 });

  const db = await getDb();
 
  const r = await db.collection("medicoes").replaceOne({ _id: new ObjectId(id) }, dados);
  if (!r.matchedCount) return naoAchou();
  return NextResponse.json({ ...dados, _id: id });
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) return idInvalido();
  const db = await getDb();
  const r = await db.collection("medicoes").deleteOne({ _id: new ObjectId(id) });
  if (!r.deletedCount) return naoAchou();
  return NextResponse.json({ ok: true });
}
