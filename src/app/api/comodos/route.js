import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";


export async function GET() {
  const db = await getDb();
  const lista = await db.collection("comodos").find({}).sort({ andar: 1, nome: 1 }).toArray();
  return NextResponse.json(lista);
}
