import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { validarMedicao } from "@/lib/validacao";

export async function GET(req) {
  const p = new URL(req.url).searchParams;
  const filtro = {};
  if (p.get("comodo")) filtro.comodo = p.get("comodo");
  if (p.get("banda")) filtro.banda = p.get("banda");
  if (p.get("dia")) {
    const ini = new Date(`${p.get("dia")}T00:00:00-03:00`);
    if (!Number.isNaN(ini.getTime()))
      filtro.medidoEm = { $gte: ini, $lt: new Date(ini.getTime() + 86400000) };
  }
  const db = await getDb();
  const lista = await db.collection("medicoes").find(filtro).sort({ medidoEm: -1 }).toArray();
  return NextResponse.json(lista);
}

export async function POST(req) {
  const { erro, dados } = validarMedicao(await req.json());
  if (erro) return NextResponse.json({ erro }, { status: 400 });
  const db = await getDb();
  const r = await db.collection("medicoes").insertOne(dados);
  return NextResponse.json({ ...dados, _id: r.insertedId }, { status: 201 });
}
