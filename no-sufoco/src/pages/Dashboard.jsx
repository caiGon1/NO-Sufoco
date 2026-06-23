import * as React from "react";
import { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts";
import { LineChart } from "@mui/x-charts";
import ModalPersonalizado from "../components/ModalPersonalizado";
import { Button, Menu, MenuItem } from "@mui/material";

// ==========================================
// FUNÇÃO DE PROJEÇÃO DE PARCELAS FUTURAS
// ==========================================
function calcularProjecaoNoFrontend(transacoes) {
  const cronograma = {};
  const nomesMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  transacoes.forEach(t => {
    // Apenas transações que são parcelas de fato
    if (!t.parcela?.eParcela) return;

    // Precisamos saber a qual fatura essa "parcelaAtual" se refere.
    let mesBase, anoBase;
    
    if (t.periodoFatura && t.periodoFatura.includes("/")) {
      [mesBase, anoBase] = t.periodoFatura.split("/").map(Number);
    } else if (t.data) {
      // Fallback de segurança para a data da compra
      const partesData = t.data.split("/");
      if (partesData.length >= 3) {
        mesBase = Number(partesData[1]);
        anoBase = Number(partesData[2]);
      } else {
        return;
      }
    } else {
      return;
    }

    const atual = t.parcela.parcelaAtual;
    const final = t.parcela.parcelaFinal;

    // A data base de cálculo é o mês da fatura atual
    const dataFaturaBase = new Date(anoBase, mesBase - 1, 1);

    for (let i = atual; i <= final; i++) {
      const mesesAAdicionar = i - atual;
      // Calcula o mês futuro da parcela com exatidão
      const dataParcela = new Date(dataFaturaBase.getFullYear(), dataFaturaBase.getMonth() + mesesAAdicionar, 1);
      
      const chaveMesAno = `${dataParcela.getMonth() + 1}/${dataParcela.getFullYear()}`;
      const rotuloAmigavel = `${nomesMeses[dataParcela.getMonth()]} / ${dataParcela.getFullYear()}`;

      if (!cronograma[chaveMesAno]) {
        cronograma[chaveMesAno] = {
          rotulo: rotuloAmigavel,
          totalMes: 0,
          transacoes: []
        };
      }

      cronograma[chaveMesAno].totalMes += t.valor;
      cronograma[chaveMesAno].transacoes.push({
        descricao: t.descricao,
        valor: t.valor,
        parcelaNumero: `${i}/${final}`,
        categoria: t.categoria,
        tipo: t.tipo,
        dataCompraOriginal: t.data // Guarda a data real para exibir
      });
    }
  });

  // Ordena cronologicamente para garantir que o Dropdown exiba de Maio -> Junho -> Julho...
  const cronogramaOrdenado = {};
  Object.keys(cronograma)
    .sort((a, b) => {
      const [mesA, anoA] = a.split('/').map(Number);
      const [mesB, anoB] = b.split('/').map(Number);
      return anoA !== anoB ? anoA - anoB : mesA - mesB;
    })
    .forEach(key => {
      cronogramaOrdenado[key] = cronograma[key];
    });

  return cronogramaOrdenado;
}

function Dashboard() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const usuarioId = usuario._id || usuario.id;

  const [transacoes, setTransacoes] = useState([]);
  const [valores, setValores] = useState([]);
  const [analise, setAnalise] = useState("");
  const [totalMes, setTotalMes] = useState([]);
  const [parcelas, setParcelas] = useState([]);
  const [modalUploadAberto, setModalUploadAberto] = useState(false);

  // ESTADOS DO NOVO MENU DE PROJEÇÃO
  const [mesSelecionado, setMesSelecionado] = useState(""); // Vazio = Todas as transações

  const fileInputRef = useRef(null);
  const [arquivo, setArquivo] = useState(null);
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  const debitos = transacoes.filter((item) => item.tipo === "debito");
  const graficoP = debitos.reduce((soma, item) => soma + item.valor, 0);

  // MATERIAL UI MENU STATES
  const id = React.useId();
  const buttonId = `${id}-button`;
  const menuId = `${id}-menu`;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // ==========================================
  // GERAÇÃO DO CRONOGRAMA DE PARCELAS (USEMEMO)
  // ==========================================
  const projecaoFutura = useMemo(() => {
    return calcularProjecaoNoFrontend(transacoes);
  }, [transacoes]);

  const mesesProjetados = Object.keys(projecaoFutura);

  // Restante da formatação dos gráficos...
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
    const percent =
      graficoP > 0 ? ((item.value / graficoP) * 100).toFixed(1) : 0;

    return {
      ...item,
      label: `${item.label} (${percent}%)`,
    };
  });

  const handleUploadExtrato = async (e) => {
    e.preventDefault();

    if (!arquivo) {
      alert("Por favor, selecione um arquivo PDF.");
      return;
    }

    setCarregando(true);

    try {
      const formData = new FormData();
      formData.append("arquivo", arquivo);
      if (senha) {
        formData.append("senha", senha);
      }

      const resposta = await axios.post(
        `https://backend-no-sufoco.vercel.app/api/banking/${usuarioId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${usuario.token}`,
          },
        },
      );

      if (resposta.data) {
        alert("Extrato processado com sucesso!");
        
        const novasTransacoes =
          resposta.data.periodos?.flatMap((periodo) => {
            const mesAno = periodo.mesAno || `${periodo.mes}/${periodo.ano}`;
            return (periodo.transacoes || []).map(t => ({
              ...t,
              periodoFatura: mesAno 
            }));
          }) || [];

        setTransacoes(novasTransacoes);
        setArquivo(null);
        setSenha("");
        setModalUploadAberto(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
      alert(
        error.response?.data?.details ||
          "Erro ao processar o extrato bancário.",
      );
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    const buscarUsuario = async () => {
      if (!usuarioId) {
        setModalUploadAberto(true);
        return;
      }

      try {
        const resposta = await axios.get(
          `https://backend-no-sufoco.vercel.app/api/user/${usuario.id}`,
          {
            headers: {
              Authorization: `Bearer ${usuario.token}`,
            },
          },
        );

        // INJEÇÃO DA DATA DA FATURA NA TRANSAÇÃO PARA A PROJEÇÃO FUNCIONAR PERFEITAMENTE
        const transacoesAchatadas =
          resposta.data.periodos?.flatMap((periodo) => {
            const mesAnoFatura = periodo.mesAno || `${periodo.mes}/${periodo.ano}`;
            return (periodo.transacoes || []).map(t => ({
              ...t,
              periodoFatura: mesAnoFatura 
            }));
          }) || [];

        setTransacoes(transacoesAchatadas);

        const apenasParceladas = transacoesAchatadas.filter(
          (t) => t.parcela?.eParcela === true,
        );
        setParcelas(apenasParceladas);

        if (
          !resposta.data.periodos ||
          resposta.data.periodos.length === 0 ||
          transacoesAchatadas.length === 0
        ) {
          setModalUploadAberto(true);
        }

        const listaTotaisMes = [];
        const dadosFormatados =
          resposta.data.periodos?.map((p) => {
            let totalEntrada = 0;
            let totalSaida = 0;

            if (p.transacoes && Array.isArray(p.transacoes)) {
              p.transacoes.forEach((t) => {
                if (t.tipo === "credito") totalEntrada += t.valor;
                else if (t.tipo === "debito") totalSaida += t.valor;
              });
            }

            let saldoMes = totalEntrada - totalSaida;
            const rotuloPeriodo = p.mesAno || `${p.mes}/${p.ano}`;

            listaTotaisMes.push({
              periodo: rotuloPeriodo,
              total: saldoMes,
            });

            return {
              periodo: rotuloPeriodo,
              entrada: totalEntrada,
              saida: totalSaida,
            };
          }) || [];

        setTotalMes(listaTotaisMes);
        setValores(dadosFormatados);
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        setModalUploadAberto(true);
      }
    };

    buscarUsuario();
  }, [usuarioId]);

  return (
    <div className="h-screen w-screen">
      <ModalPersonalizado
        onClose={() => transacoes.length > 0 && setModalUploadAberto(false)}
        isOpen={modalUploadAberto}
        titulo="Bem-vindo ao No Sufoco!"
        tamanho="md"
      >
        <form onSubmit={handleUploadExtrato} className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            Parece que ainda não encontramos suas transações. Para começar a
            usar o <strong>No Sufoco</strong>, faça o upload do seu extrato
            bancário em formato PDF.
          </p>

          <p className="text-xs text-gray-500">
            Seus dados serão lidos temporariamente por inteligência artificial
            apenas para alimentar os gráficos do seu painel.
          </p>

          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={(e) => setArquivo(e.target.files[0])}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold shadow-sm hover:bg-gray-50 transition-all"
            >
              Selecionar Extrato PDF
            </button>

            {arquivo ? (
              <p className="mt-3 text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 max-w-xs truncate">
                📎 {arquivo.name}
              </p>
            ) : (
              <p className="mt-2 text-xs text-gray-400">
                Nenhum arquivo selecionado
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">
              Senha de Proteção (Opcional)
            </label>
            <input
              type="password"
              placeholder="Digite a senha caso o PDF seja protegido"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 transition-all"
            />
          </div>

          <div className="flex gap-2 justify-end mt-2 pt-2 border-t border-gray-100">
            {transacoes.length > 0 && (
              <button
                type="button"
                onClick={() => setModalUploadAberto(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            )}

            <button
              type="submit"
              disabled={carregando || !arquivo}
              className={`px-4 py-2 text-xs font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg shadow transition-colors ${
                carregando || !arquivo ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {carregando ? "Analisando Extrato..." : "Começar a Analisar"}
            </button>
          </div>
        </form>
      </ModalPersonalizado>

      <div className="flex h-full w-full">
        {/* COLUNA ESQUERDA - LISTA DE TRANSAÇÕES */}
        <div className="h-full w-1/3 p-4 bg-gray-50 overflow-y-auto scrollbar-thin">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">Suas Transações</h1>
            <Button
              id={buttonId}
              aria-controls={open ? menuId : undefined}
              aria-haspopup="true"
              aria-expanded={open}
              onClick={handleClick}
            >
              {mesSelecionado ? projecaoFutura[mesSelecionado].rotulo : "Mês Atual"}
            </Button>
            <Menu
              id={menuId}
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              slotProps={{
                list: {
                  "aria-labelledby": buttonId,
                },
              }}
            >
              {/* Opção para limpar o filtro e ver tudo */}
              <MenuItem onClick={() => { setMesSelecionado(""); handleClose(); }}>
                Mês Atual / Todas
              </MenuItem>
              
              {/* Lista os meses dinamicamente gerados pelo useMemo (agora ordenados!) */}
              {mesesProjetados.map(chave => (
                <MenuItem 
                  key={chave} 
                  onClick={() => { setMesSelecionado(chave); handleClose(); }}
                >
                  {projecaoFutura[chave].rotulo}
                </MenuItem>
              ))}
            </Menu>
            <button
              onClick={() => setModalUploadAberto(true)}
              className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 shadow transition-colors"
            >
              + Importar
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {/* CONDICIONAL: Mostra Projeção do Mês OU Mostra Lista Completa */}
            {mesSelecionado && projecaoFutura[mesSelecionado] ? (
              <>
                <div className="bg-orange-50 border border-orange-200 p-4 rounded shadow-sm mb-2">
                  <p className="text-orange-800 font-bold text-lg">
                    Total Projetado: R$ {projecaoFutura[mesSelecionado].totalMes.toFixed(2)}
                  </p>
                  <p className="text-sm text-orange-600">
                    {projecaoFutura[mesSelecionado].transacoes.length} parcelas para vencer neste mês.
                  </p>
                </div>

                {projecaoFutura[mesSelecionado].transacoes.map((t, index) => (
                  <div key={index} className="p-3 border rounded shadow-sm bg-white flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">{t.descricao}</p>
                      <div className="flex gap-2 text-xs text-gray-500 mt-1 items-center">
                        <span className="bg-gray-100 px-2 py-0.5 rounded">{t.categoria}</span>
                        <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-bold">
                          Parcela {t.parcelaNumero}
                        </span>
                        <span className="text-[10px] text-gray-400">Comprado em {t.dataCompraOriginal}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${t.tipo === "debito" ? "text-red-500" : "text-green-500"}`}>
                        {t.tipo === "debito" ? "-" : "+"} R$ {t.valor.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              /* LISTA NORMAL DE TODAS AS TRANSAÇÕES */
              transacoes && transacoes.length > 0 ? (
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
                      <p className="text-xs text-orange-500 font-bold mt-1">
                        {transacao.parcela?.eParcela
                          ? `Parcela ${transacao.parcela.parcelaAtual}/${transacao.parcela.parcelaFinal}`
                          : ""}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Nenhuma transação encontrada.</p>
              )
            )}
          </div>
        </div>

        {/* COLUNA DIREITA - GRÁFICOS */}
        <div className="h-full w-full bg-gray-200">
          <div className="w-full h-full bg-gray-100 p-4">
            <h1 className="text-2xl font-bold mb-4">Estatísticas</h1>

            <div className="bg-white rounded shadow p-4">
              <div className="h-full bg-gray-100 p-4">
                <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
                  <div className="col-span-2 bg-white rounded-xl shadow p-4">
                    <h2 className="text-xl font-bold mb-4">
                      Evolução Financeira
                    </h2>
                    <LineChart
                      dataset={totalMes}
                      xAxis={[{ scaleType: "point", dataKey: "periodo" }]}
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

                  <div className="bg-white rounded-xl shadow p-4 flex flex-col">
                    <h2 className="text-xl font-bold mb-4">
                      Gastos por Categoria
                    </h2>
                    <div className="flex-1 flex items-center justify-center">
                      <PieChart
                        series={[{ data, arcLabel: () => "" }]}
                        slotProps={{
                          legend: {
                            direction: "column",
                            position: {
                              vertical: "middle",
                              horizontal: "right",
                            },
                            labelStyle: { fontSize: 13 },
                          },
                        }}
                        width={450}
                        height={250}
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow p-4">
                    <h2 className="text-xl font-bold mb-4">Comparativo</h2>
                    <BarChart
                      dataset={valores}
                      xAxis={[{ scaleType: "band", dataKey: "periodo" }]}
                      series={[
                        {
                          dataKey: "entrada",
                          label: "Entrada",
                          color: "#4ade80",
                        },
                        { dataKey: "saida", label: "Saída", color: "#f87171" },
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