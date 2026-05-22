import * as React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts";
import { LineChart } from "@mui/x-charts";

function Dashboard() {
  // Certifique-se de que no localStorage está gravado como _id ou ajuste aqui
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const usuarioId = usuario._id || usuario.id; // Garante a captura independente de como salvou

  const [transacoes, setTransacoes] = useState([]);
  const [analise, setAnalise] = useState("");

  const dadosLinha = [400, 300, 500, 200, 600, 700, 650];

  const categorias = ["Cartão", "PIX", "Lazer", "Investimento"];

  const valores = [300, 150, 200, 800];

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
      <div className="flex h-full w-full">
        <div className="h-full w-1/3 p-4 bg-gray-50 overflow-y-auto scrollbar-thin">
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
        <div className="h-full w-full bg-gray-200">
          <div className="w-full h-full bg-gray-100 p-4">
            <h1 className="text-2xl font-bold mb-4">Estatísticas</h1>

            <div className="bg-white rounded shadow p-4">
              <div className="h-full bg-gray-100 p-4">
                <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
                  {/* GRÁFICO DE LINHA */}
                  <div className="col-span-2 bg-white rounded-xl shadow p-4">
                    <h2 className="text-xl font-bold mb-4">
                      Evolução Financeira
                    </h2>

                    <LineChart
                      xAxis={[
                        {
                          scaleType: "point",
                          data: [
                            "Jan",
                            "Fev",
                            "Mar",
                            "Abr",
                            "Mai",
                            "Jun",
                            "Jul",
                          ],
                        },
                      ]}
                      series={[
                        {
                          data: dadosLinha,
                          color: "#10b981",
                        },
                      ]}
                      height={300}
                    />
                  </div>

                  {/* PIZZA */}
                  <div className="bg-white rounded-xl shadow p-4 flex flex-col">
                    <h2 className="text-xl font-bold mb-4">
                      Gastos por Categoria
                    </h2>

                    <div className="flex-1 flex items-center justify-center">
                      <PieChart
                        series={[
                          {
                            data: Object.values(
                              transacoes.reduce((acc, item) => {
                                const cat = item.categoria || "Outros";
                                // Se a categoria ainda não existe no grupo, inicializa ela
                                if (!acc[cat]) {
                                  acc[cat] = {
                                    id: cat,
                                    value: 0,
                                    label: cat,
                                  };
                                }
                                // Soma o valor da transação atual ao total da categoria
                                acc[cat].value += item.valor;
                                return acc;
                              }, {}),
                            ),
                          },
                        ]}
                        width={400}
                        height={250}
                      />
                    </div>
                  </div>

                  {/* BARRAS */}
                  <div className="bg-white rounded-xl shadow p-4">
                    <h2 className="text-xl font-bold mb-4">Comparativo</h2>

                    <BarChart
                      xAxis={[
                        {
                          scaleType: "band",
                          data: categorias,
                        },
                      ]}
                      series={[
                        {
                          data: valores,
                          color: "#3b82f6",
                        },
                      ]}
                      height={250}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
