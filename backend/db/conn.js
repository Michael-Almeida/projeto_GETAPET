const mongoose = require("mongoose");

console.log("📢 Arquivo de conexão carregado!");

async function main() {
  await mongoose.connect("mongodb://localhost:27017/getapet");
  console.log("Conectou ao banco");
}

main().catch((err) => console.error("Erro ao conectar ao banco de dados", err));

module.exports = mongoose;
