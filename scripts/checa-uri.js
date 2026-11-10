const u = process.env.MONGODB_URI;
if (!u) { console.log("MONGODB_URI não definida"); process.exit(); }
const m = u.match(/^mongodb(?:\+srv)?:\/\/([^:]+):(.*)@([^@/]+)/s);
if (!m) { console.log("Formato inesperado (aspas, espaço ou quebra no início?)"); process.exit(); }
console.log("usuário:", JSON.stringify(m[1]));
console.log("tamanho da senha:", m[2].length);
console.log("senha tem < ou > ou %?", /[<>%]/.test(m[2]));
console.log("host:", m[3]);