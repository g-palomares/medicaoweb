// Uso: node --env-file=.env.local scripts/seed.js
// Carrega os cômodos (posições APROXIMADAS na planta: ajuste x/y olhando o heatmap)
// e as medições do relatório parcial. Pode rodar de novo: limpa e recarrega.
import { MongoClient } from "mongodb";

const comodos = [
  { nome: "Sala 1", andar: 1, x: 56, y: 73 },
  { nome: "Cozinha", andar: 1, x: 34, y: 72 },
  { nome: "Banheiro 1 andar", andar: 1, x: 40, y: 36 },
  { nome: "Area externa", andar: 1, x: 12, y: 72 },
  { nome: "Banheiro 2 andar", andar: 2, x: 39, y: 38 },
  { nome: "Quarto vista A. externa", andar: 2, x: 34, y: 72 },
  { nome: "Quarto vista garagem", andar: 2, x: 61, y: 72 },
];

// [local, 2.4GHz, 5GHz] por dia. As datas abaixo são um palpite (semana de 30/08/2026): corrija.
const dias = [
  ["2026-09-01T23:00:00-03:00", [
    ["Sala 1", 66, 330], ["Cozinha", 65, 300], ["Banheiro 1 andar", 55, 285], ["Area externa", 50, 235],
    ["Banheiro 2 andar", 19, 91], ["Quarto vista A. externa", 35, 88], ["Quarto vista garagem", 38, 158]]],
  ["2026-09-04T15:00:00-03:00", [
    ["Sala 1", 66, 350], ["Cozinha", 66, 312], ["Banheiro 1 andar", 59, 300], ["Area externa", 53, 250],
    ["Banheiro 2 andar", 21, 99], ["Quarto vista A. externa", 39, 95], ["Quarto vista garagem", 47, 170]]],
  ["2026-09-07T13:00:00-03:00", [
    ["Sala 1", 68, 367], ["Cozinha", 66, 321], ["Banheiro 1 andar", 61, 306], ["Area externa", 54, 255],
    ["Banheiro 2 andar", 23, 101], ["Quarto vista A. externa", 40, 96], ["Quarto vista garagem", 47, 173]]],
];

const medicoes = dias.flatMap(([data, linhas]) =>
  linhas.flatMap(([comodo, g24, g5]) => [
    { comodo, banda: "2.4", download: g24, medidoEm: new Date(data) },
    { comodo, banda: "5", download: g5, medidoEm: new Date(data) },
  ])
);

const client = await new MongoClient(process.env.MONGODB_URI).connect();
const db = client.db(process.env.MONGODB_DB || "wifi");
await db.collection("comodos").deleteMany({});
await db.collection("medicoes").deleteMany({});
await db.collection("comodos").insertMany(comodos);
await db.collection("medicoes").insertMany(medicoes);
console.log(`${comodos.length} cômodos e ${medicoes.length} medições inseridos.`);
await client.close();
