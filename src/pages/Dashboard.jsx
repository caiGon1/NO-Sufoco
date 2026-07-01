import * as React from "react";
import { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts";
import { LineChart } from "@mui/x-charts";
import ModalPersonalizado from "../components/ModalPersonalizado";
import { Button, Menu, MenuItem } from "@mui/material";
import ShowChartIcon from '@mui/icons-material/ShowChart';
import LogoutIcon from '@mui/icons-material/Logout'; 
import Chat from '../components/Chat';

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
    if (!t.parcela?.eParcela) return;

    let mesBase, anoBase;
    
    if (t.periodoFatura && t.periodoFatura.includes("/")) {
      [mesBase, anoBase] = t.periodoFatura.split("/").map(Number);
    } else if (t.data) {
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
    const dataFaturaBase = new Date(anoBase, mesBase - 1, 1);

    for (let i = atual; i <= final; i++) {
      const mesesAAdicionar = i - atual;
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
        dataCompraOriginal: t.data
      });
    }
  });

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
  const navigate = useNavigate();

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const usuarioId = usuario._id || usuario.id;

  const [transacoes, setTransacoes] = useState([]);
  const [valores, setValores] = useState([]);
  const [analise, setAnalise] = useState("");
  const [totalMes, setTotalMes] = useState([]);
  const [parcelas, setParcelas] = useState([]);
  const [modalUploadAberto, setModalUploadAberto] = useState(false);

  const [abaAtiva, setAbaAtiva] = useState("transacoes");

  const [mesSelecionado, setMesSelecionado] = useState("");

  const fileInputRef = useRef(null);
  const [arquivo, setArquivo] = useState(null);
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  const debitos = transacoes.filter((item) => item.tipo === "debito");
  const graficoP = debitos.reduce((soma, item) => soma + item.valor, 0);

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

  const handleLogout = () => {
    localStorage.clear(); 
    navigate('/');
  };

  const projecaoFutura = useMemo(() => {
    return calcularProjecaoNoFrontend(transacoes);
  }, [transacoes]);

  const mesesProjetados = Object.keys(projecaoFutura);

  const data = Object.values(
    debitos.reduce((acc, item) => {
      const cat = item.categoria || "Outros";
      if (!acc[cat]) {
        acc[cat] = { id: cat, value: 0, label: cat };
      }
      acc[cat].value += item.valor;
      return acc;
    }, {}),
  ).map((item) => {
    const percent = graficoP > 0 ? ((item.value / graficoP) * 100).toFixed(1) : 0;
    return { ...item, label: `${item.label} (${percent}%)` };
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

  // ==========================================
  // COLUNA DE TRANSAÇÕES 
  // ==========================================
  const colunaTransacoes = (
    <div className="flex flex-col gap-2">
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
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1 items-center">
                  <span className="bg-gray-100 px-2 py-0.5 rounded">{t.categoria}</span>
                  <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-bold">
                    Parcela {t.parcelaNumero}
                  </span>
                  <span className="text-[10px] text-gray-400">Comprado em {t.dataCompraOriginal}</span>
                </div>
              </div>
              <div className="text-right ml-2 shrink-0">
                <p className={`font-bold ${t.tipo === "debito" ? "text-red-500" : "text-green-500"}`}>
                  {t.tipo === "debito" ? "-" : "+"} R$ {t.valor.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </>
      ) : (
        transacoes && transacoes.length > 0 ? (
          transacoes.map((transacao, index) => (
            <div
              key={index}
              className="p-3 border rounded shadow-sm bg-white flex justify-between items-center"
            >
              <div className="min-w-0 mr-2">
                <p className="font-semibold text-gray-800 truncate">
                  {transacao.descricao}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                  <span className="bg-gray-100 px-2 py-0.5 rounded">
                    {transacao.categoria}
                  </span>
                  <span>{transacao.data}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className={`font-bold ${transacao.tipo === "debito" ? "text-red-500" : "text-green-500"}`}>
                  {transacao.tipo === "debito" ? "-" : "+"} R$ {transacao.valor.toFixed(2)}
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
  );

  // ==========================================
  // COLUNA DE GRÁFICOS 
  // ==========================================
  const colunaGraficos = (
    <div className="w-full bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Estatísticas</h1>

      <div className="bg-white rounded shadow p-4">
        <div className="bg-gray-100 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow p-4 overflow-x-auto">
              <h2 className="text-xl font-bold mb-4">Evolução Financeira</h2>
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

            <div className="bg-white rounded-xl shadow p-4 flex flex-col overflow-x-auto">
              <h2 className="text-xl font-bold mb-4">Gastos por Categoria</h2>
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
                      labelStyle: { fontSize: 11 },
                    },
                  }}
                  width={420}
                  height={250}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
              <h2 className="text-xl font-bold mb-4">Comparativo</h2>
              <BarChart
                dataset={valores}
                xAxis={[{ scaleType: "band", dataKey: "periodo" }]}
                series={[
                  { dataKey: "entrada", label: "Entrada", color: "#4ade80" },
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
  );

  // ==========================================
  // HEADER DE TRANSAÇÕES
  // ==========================================
  const headerTransacoes = (
    <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
      <h1 className="text-xl font-bold">Suas Transações</h1>
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="contained"
            size="small"
          startIcon={<ShowChartIcon />}
          onClick={() => navigate('/acoes')}
          sx={{ color: "#4CAF50", backgroundColor: "white" }}
        >
          Ações
        </Button>

        <Button
          id={buttonId}
          aria-controls={open ? menuId : undefined}
          aria-haspopup="true"
          aria-expanded={open}
          onClick={handleClick}
          sx={{ color: "#4CAF50", backgroundColor: "white" }}
          variant="contained"
          size="small"
        >
          {mesSelecionado ? projecaoFutura[mesSelecionado].rotulo : "Mês Atual"}
        </Button>
        <Menu
          id={menuId}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          slotProps={{
            list: { "aria-labelledby": buttonId },
          }}
        >
          <MenuItem onClick={() => { setMesSelecionado(""); handleClose(); }}>
            Mês Atual / Todas
          </MenuItem>
          {mesesProjetados.map(chave => (
            <MenuItem
              key={chave}
              onClick={() => { setMesSelecionado(chave); handleClose(); }}
            >
              {projecaoFutura[chave].rotulo}
            </MenuItem>
          ))}
        </Menu>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#4CAF50", color: "white" }}
          onClick={() => setModalUploadAberto(true)}
          size="small"
        >
          + Importar
        </Button>

           <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={handleLogout}
          startIcon={<LogoutIcon />}
        >
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen flex flex-col">
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

      <div className="hidden md:flex h-full w-full">
        <div className="h-full w-1/3 p-4 bg-gray-50 overflow-y-auto scrollbar-thin">
          {headerTransacoes}
          {colunaTransacoes}
        </div>

        <div className="h-full w-full overflow-y-auto bg-gray-200">
          {colunaGraficos}
        </div>
      </div>

      <div className="flex flex-col h-full md:hidden">
        <div className="flex-1 overflow-y-auto">
          {abaAtiva === "transacoes" ? (
            <div className="p-4 bg-gray-50 min-h-full">
              {headerTransacoes}
              {colunaTransacoes}
            </div>
          ) : (
            <div className="bg-gray-200 min-h-full">
              {colunaGraficos}
            </div>
          )}
        </div>

        <nav className="flex border-t border-gray-200 bg-white shrink-0">
          <button
            onClick={() => setAbaAtiva("transacoes")}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-xs font-semibold transition-colors ${
              abaAtiva === "transacoes"
                ? "text-green-600 border-t-2 border-green-500 -mt-px"
                : "text-gray-500"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Transações
          </button>

          <button
            onClick={() => setAbaAtiva("graficos")}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-xs font-semibold transition-colors ${
              abaAtiva === "graficos"
                ? "text-green-600 border-t-2 border-green-500 -mt-px"
                : "text-gray-500"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Estatísticas
          </button>

          <button
            onClick={() => navigate('/acoes')}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-xs font-semibold text-gray-500 transition-colors hover:text-green-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8m0 0v6m0-6h-6" />
            </svg>
            Ações
          </button>
        </nav>
      </div>
      <Chat />
    </div>
  );
}

export default Dashboard;