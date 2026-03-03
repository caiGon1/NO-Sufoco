const express = require("express");
const app = express();
const porta = 8081;

app.get("/", function (req, res) {});
app.get("/graficos", function (req, res) {});
app.get("/overview", function (req, res) {});
app.get("/score", function (req, res) {});

app.post("/envio-cvs", function (req, res) {});
app.post("/envio-sql", function (req, res) {});

app.delete("/del-registro?registro", function (req, res) {
    let registro = req.params.registro
});
app.delete("/drop-registros", function (req, res) {});

app.listen(porta, () => {
  console.log(`Servidor rodando na porta ${porta}`);
});
