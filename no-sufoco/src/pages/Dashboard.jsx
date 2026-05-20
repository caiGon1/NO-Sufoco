import * as React from "react";
import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  // Certifique-se de que no localStorage está gravado como _id ou ajuste aqui
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const usuarioId = usuario._id || usuario.id; // Garante a captura independente de como salvou

  const [transacoes, setTransacoes] = useState([]);
  const [analise, setAnalise] = useState("");

  const analiseIA = async () => {
    if (!usuarioId) return;
    try {
      const resposta = await axios.get(
        `https://backend-no-sufoco.vercel.app/api/banking/${usuarioId}`,
        {
          headers: {
            Authorization: `Bearer ${usuario.token}`,
          },
        },
      );
      setAnalise(resposta.data);
      console.log(resposta.data);
    } catch (error) {
      console.log(error);
      alert(
        "Houve um erro ao tentar fazer sua analise, tente novamente mais tarde...",
      );
    }
  };

  useEffect(() => {
    const buscarUsuario = async () => {
      if (!usuarioId) return;
      try {
        const resposta = await axios.get(
          `https://backend-no-sufoco.vercel.app/api/user/${usuario.id}`,
          {
            headers: {
              Authorization: `Bearer ${usuario.token}`,
            },
          },
        );

        setTransacoes(resposta.data.transacoes || []);

        console.log(resposta.data);
      } catch (error) {
        console.log(error);
      }
    };

    buscarUsuario();
  }, [usuarioId]);
  // Usando a variável isolada para evitar loops do objeto

  return (
    <div className="h-screen w-screen">
      <div className="h-screen w-screen p-4 bg-gray-50">
        <h1 className="text-xl font-bold mb-4">Suas Transações</h1>

        <div className="flex flex-col gap-2">
          {transacoes && transacoes.length > 0 ? (
            transacoes.map((transacao, index) => (
              // Usando o index como key já que não há ID visível no objeto
              <div
                key={index}
                className="p-3 border rounded shadow-sm bg-white flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {transacao.descricao}
                  </p>
                  <div className="flex gap-2 text-xs text-gray-500 mt-1">
                    <span className="bg-gray-100 px-2 py-0.5 rounded">
                      {transacao.categoria}
                    </span>
                    <span>{transacao.data}</span>
                  </div>
                </div>

                <div className="text-right">
                  {/* Muda a cor do texto baseado no tipo de transação */}
                  <p
                    className={`font-bold ${transacao.tipo === "debito" ? "text-red-500" : "text-green-500"}`}
                  >
                    {transacao.tipo === "debito" ? "-" : "+"} R${" "}
                    {transacao.valor.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">
                    {transacao.tipo}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Nenhuma transação encontrada.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
