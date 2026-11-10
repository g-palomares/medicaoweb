import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  const db = await getDb();
  const resumo = await db
    .collection("medicoes")
    .aggregate([
      { $group: { _id: { comodo: "$comodo", banda: "$banda" }, media: { $avg: "$download" }, n: { $sum: 1 } } },
      { $project: { _id: 0, comodo: "$_id.comodo", banda: "$_id.banda", media: { $round: ["$media", 1] }, n: 1 } },
      { $sort: { comodo: 1, banda: 1 } },
    ])
    .toArray();
  return NextResponse.json(resumo);
}
