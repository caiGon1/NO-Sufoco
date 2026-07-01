import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Switch,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  Snackbar,
  IconButton, 
} from "@mui/material";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ModalPersonalizado from "../components/ModalPersonalizado";
import SeletorAtivos from "../components/SeletorAtivos";

const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
const token = usuario.token;


const api = axios.create({
  baseURL: "https://backend-no-sufoco.vercel.app",
});

export default function Acoes() {
  const navigate = useNavigate(); 
  
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [acoesData, setAcoesData] = useState({ monitora: false, ativos: {} });
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);


  useEffect(() => {
    const buscarMeusAtivos = async () => {
    try {
      const response = await api.get("/api/acoes/favoritos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAcoesData(response.data.acoes || { monitora: false, ativos: {} });
    } catch (error) {
      console.error("Erro ao buscar ativos:", error);
      mostrarToast("Erro ao carregar seus ativos.", "error");
    } finally {
      setLoading(false);
    }
    };
    buscarMeusAtivos();
  }, []);

  

  const handleToggleAtivo = (ticker) => {
    setAcoesData((prev) => ({
      ...prev,
      ativos: {
        ...prev.ativos,
        [ticker]: !prev.ativos[ticker],
      },
    }));
  };

  const handleToggleGlobal = () => {
    setAcoesData((prev) => ({
      ...prev,
      monitora: !prev.monitora,
    }));
  };

  const handleSalvarMonitoramento = async () => {
    setSalvando(true);
    try {
      if (!token) throw new Error("Usuário não autenticado");

      const payload = {
        monitoraGlobal: acoesData.monitora,
        alteracoesAtivos: acoesData.ativos,
      };
      await api.put("/api/acoes/favoritos", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      mostrarToast("Preferências de monitoramento salvas!", "success");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      mostrarToast(error.response?.data?.error || "Erro ao salvar.", "error");
    } finally {
      setSalvando(false);
    }
  };

  const handleSalvarNovosAtivos = async (lista) => {
    try {
      await api.post(
        "/api/acoes/favoritos",
        { ativosSelecionados: lista },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      mostrarToast("Ativos adicionados com sucesso!", "success");
      setIsModalOpen(false);
      buscarMeusAtivos();
    } catch (error) {
      mostrarToast("Erro ao adicionar ativos", "error");
    }
  };

  const mostrarToast = (message, type) => {
    setToast({ open: true, message, type });
  };

  const listaAtivos = Object.keys(acoesData.ativos || {});
  const temAtivos = listaAtivos.length > 0;

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={1}>
        <IconButton
          onClick={() => navigate("/dashboard")}
          sx={{ mr: 1, ml: -1.5 }}
          aria-label="voltar para dashboard"
        >
          <ArrowBackIosIcon fontSize="small" />
        </IconButton>
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          Meus Ativos
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" mb={4}>
        Acompanhe suas ações e configure os alertas da inteligência artificial.
      </Typography>

      {!temAtivos && (
        <Card
          variant="outlined"
          sx={{
            textAlign: "center",
            p: 4,
            borderRadius: 3,
            bgcolor: "#f9fbf9",
            borderColor: "#e0e8e0",
          }}
        >
          <ShowChartIcon sx={{ fontSize: 60, color: "#90c9a8", mb: 2 }} />
          <Typography
            variant="h6"
            fontWeight="bold"
            color="text.primary"
            gutterBottom
          >
            Nenhuma ação salva ainda
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Você ainda não está monitorando nenhum ativo. Que tal explorar o
            mercado e adicionar algumas ações à sua carteira?
          </Typography>
          <Button
            variant="outlined"
            color="success"
            startIcon={<AddCircleOutlineOutlinedIcon />}
            onClick={() => setIsModalOpen(true)}
          >
            Explorar Ativos
          </Button>
        </Card>
      )}

      {temAtivos && (
        <Card
          variant="outlined"
          sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box
              p={3}
              bgcolor="#f0f7f0"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="#1a6b3a"
                >
                  Monitoramento Global
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Habilite para receber os alertas diários por e-mail.
                </Typography>
              </Box>
              <Switch
                checked={acoesData.monitora}
                onChange={handleToggleGlobal}
                color="success"
              />
            </Box>
            <Divider />
            <List sx={{ p: 0 }}>
              {listaAtivos.map((ticker, index) => (
                <React.Fragment key={ticker}>
                  <ListItem sx={{ py: 2, px: 3 }}>
                    <ListItemText
                      primary={
                        <Typography fontWeight="bold">{ticker}</Typography>
                      }
                      secondary="Analisar diariamente"
                    />
                    <Switch
                      checked={acoesData.ativos[ticker]}
                      onChange={() => handleToggleAtivo(ticker)}
                      color="primary"
                    />
                  </ListItem>
                  {index !== listaAtivos.length - 1 && (
                    <Divider component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          </CardContent>

          <Box
            p={3}
            bgcolor="#fafafa"
            borderTop="1px solid #eee"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Button
              variant="text"
              color="inherit"
              startIcon={<AddCircleOutlineOutlinedIcon />}
              onClick={() => setIsModalOpen(true)}
            >
              Adicionar mais
            </Button>
            <Button
              variant="contained"
              color="success"
              disableElevation
              startIcon={
                salvando ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <NotificationsActiveIcon />
                )
              }
              onClick={handleSalvarMonitoramento}
              disabled={salvando}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              {salvando ? "Salvando..." : "Salvar Monitoramento"}
            </Button>
          </Box>
        </Card>
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.type}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
      <ModalPersonalizado
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        titulo="Adicionar Ativos"
      >
        <SeletorAtivos
          onSalvar={handleSalvarNovosAtivos}
          onClose={() => setIsModalOpen(false)}
        />
      </ModalPersonalizado>
    </Container>
  );
}
