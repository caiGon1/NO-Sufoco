const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const app = express();
const porta = 8081;

app.get("/", function (req, res) {
  res.send("Bem-vindo ao NO Sufoco!");
});

app.get("/graficos", function (req, res) {});

app.get("/overview/:mediaMes", function (req, res) {
  let mediaMes = req.params.mediaMes;
});

app.get("/score", function (req, res) {});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Buscar usuário no banco
    //  const usuario = /* buscar no banco */;

    if (!usuario) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ error: "Senha inválida" });
    }

    const token = jwt.sign({ id: usuario.id }, "SEGREDO_SUPER_SECRETO", {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Erro interno" });
  }
});

app.post("/auth/register", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    // Salvar usuário no banco

    res.status(201).json({ message: "Usuário criado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro interno" });
  }
});

app.post("/envio-cvs", function (req, res) {});
app.post("/envio-sql", function (req, res) {});

app.delete("/del-registro/:registro", function (req, res) {
  let registro = req.params.registro;
});

app.delete("/drop-registros", function (req, res) {});

app.listen(porta, () => {
  console.log(`Servidor rodando na porta ${porta}`);
});
