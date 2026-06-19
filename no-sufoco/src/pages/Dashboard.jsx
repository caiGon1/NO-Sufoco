import * as React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts";
import { LineChart } from "@mui/x-charts";

function Dashboard() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const usuarioId = usuario._id || usuario.id;

  const [transacoes, setTransacoes] = useState([]);
  const [valores, setValores] = useState([]);
  const [analise, setAnalise] = useState("");
  const [totalMes, setTotalMes] = useState([]);

  const debitos = transacoes.filter((item) => item.tipo === "debito");
  const graficoP = debitos.reduce((soma, item) => soma + item.valor, 0);

  const data = Object.values(
    debitos.reduce((acc, item) => {
      const cat = item.categoria || "Outros";

      if (!acc[cat]) {
        acc[cat] = {
          id: cat,
          value: 0,
          label: cat,
        };
      }

      acc[cat].value += item.valor;
      return acc;
    }, {}),
  ).map((item) => {

    const percent = graficoP > 0 ? ((item.value / graficoP) * 100).toFixed(1) : 0;
    
    return {
      ...item,
      label: `${item.label} (${percent}%)`,
    };
  });

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
      alert("Houve um erro ao tentar fazer sua analise, tente novamente mais tarde...");
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

        setTransacoes(
          resposta.data.periodos.flatMap((periodo) => periodo.transacoes || []),
        );

        const listaTotaisMes = [];

        const dadosFormatados = resposta.data.periodos.map((p) => {
          let totalEntrada = 0;
          let totalSaida = 0;

          if (p.transacoes && Array.isArray(p.transacoes)) {
            p.transacoes.forEach((t) => {
              if (t.tipo === "credito") {
                totalEntrada += t.valor;
              } else if (t.tipo === "debito") {
                totalSaida += t.valor;
              }
            });
          }

          let saldoMes = totalEntrada - totalSaida;
          
          listaTotaisMes.push({ 
            periodo: `${p.mes}/${p.ano}`, 
            total: saldoMes 
          });

          return {
            periodo: `${p.mes}/${p.ano}`,
            entrada: totalEntrada,
            saida: totalSaida,
          };
        });

        setTotalMes(listaTotaisMes);
        setValores(dadosFormatados);

        console.log(resposta.data);
      } catch (error) {
        console.log(error);
      }
    };

    buscarUsuario();
  }, [usuarioId]);

  return (
    <div className="h-screen w-screen">
      <div className="flex h-full w-full">
        <div className="h-full w-1/3 p-4 bg-gray-50 overflow-y-auto scrollbar-thin">
          <h1 className="text-xl font-bold mb-4">Suas Transações</h1>

          <div className="flex flex-col gap-2">
            {transacoes && transacoes.length > 0 ? (
              transacoes.map((transacao, index) => (
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
                      dataset={totalMes}
                      xAxis={[
                        {
                          scaleType: "point",
                          dataKey: "periodo",
                        },
                      ]}
                      series={[
                        {
                          dataKey: "total",
                          label: "Saldo do Período",
                          color: "#10b981",
                          curve: "catmullRom",
                          showMark: true,
                        },
                      ]}
                      height={300}
                      margin={{ top: 20, bottom: 30, left: 50, right: 20 }}
                    />
                  </div>

                  {/* PIZZA (ALTERADO: Limpo por dentro, porcentagem na lateral) */}
                  <div className="bg-white rounded-xl shadow p-4 flex flex-col">
                    <h2 className="text-xl font-bold mb-4">
                      Gastos por Categoria
                    </h2>

                    <div className="flex-1 flex items-center justify-center">
                      <PieChart
                        series={[
                          {
                            data,
                            // Deixamos o arcLabel vazio para limpar o meio do gráfico
                            // e não gerar sobreposições de texto.
                            arcLabel: () => "", 
                          },
                        ]}
                        // Configurações extras de layout da legenda para dar mais espaço
                        slotProps={{
                          legend: {
                            direction: 'column',
                            position: { vertical: 'middle', horizontal: 'right' },
                            labelStyle: { fontSize: 13 },
                          },
                        }}
                        width={450} // Aumentado um pouco para acomodar o texto das porcentagens na direita
                        height={250}
                      />
                    </div>
                  </div>

                  {/* BARRAS */}
                  <div className="bg-white rounded-xl shadow p-4">
                    <h2 className="text-xl font-bold mb-4">Comparativo</h2>

                    <BarChart
                      dataset={valores}
                      xAxis={[
                        {
                          scaleType: "band",
                          dataKey: "periodo",
                        },
                      ]}
                      series={[
                        {
                          dataKey: "entrada",
                          label: "Entrada",
                          color: "#4ade80",
                        },
                        {
                          dataKey: "saida",
                          label: "Saída",
                          color: "#f87171",
                        },
                      ]}
                      height={300}
                      margin={{ top: 20, bottom: 30, left: 40, right: 10 }}
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