import * as React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { motion } from "framer-motion";

function Login() {
  const outlinedPasswordId = React.useId();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  // Estado para controlar a animação inicial
  const [showForm, setShowForm] = useState(false);

  const navigate = useNavigate();

  // Ativa a animação após 1.5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowForm(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleClickShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    const dadosEnvio = {
      email: email,
      senha: senha,
    };

    try {
      const response = await axios.post(
        "https://backend-no-sufoco.vercel.app/api/user/login",
        dadosEnvio,
      );
      alert("Login realizado!");

      const dadosUsuario = {
        id: response.data.user.id,
        token: response.data.token,
      };

      localStorage.setItem("usuario", JSON.stringify(dadosUsuario));
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao enviar: ", error);
    } finally {
      setLoading(false);
    }
  };

  const login = (
    <div
      className="relative h-[100dvh] w-full flex flex-col items-center justify-center bg-bottom bg-no-repeat overflow-hidden bg-[length:200%_35%] md:bg-[length:100%_55%]"
      style={{ backgroundImage: "url('/Ellipse1.svg')" }}
    >
      {/* Título Responsivo: Tamanho e posição inicial ajustados para mobile e desktop */}
      <h1
        className={`font-poppins text-[60px] md:text-[100px] transition-all duration-1000 ease-out z-10
          ${showForm ? "translate-y-0" : "translate-y-[100px] md:translate-y-[160px]"}`}
      >
        <span className="font-bold">NO </span>
        <span className="font-light">Sufoco</span>
      </h1>

      {/* Container do formulário com padding ajustado para mobile */}
      <div
        className={`flex flex-col justify-center gap-4 md:gap-5 bg-white p-6 md:p-10 rounded-[10%] transition-all duration-1000 ease-out mt-4 md:mt-10
          ${
            showForm
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-20 scale-95 pointer-events-none"
          }`}
      >
        <p className="font-poppins text-center text-sm md:text-base">
          Bem-vindo(a) de volta!
        </p>

        <form onSubmit={handleSubmit}>
          {/* w-full com max-w garante que fique perfeito no mobile sem vazar a tela */}
          <div className="grid gap-3 w-full max-w-[300px] min-w-[260px]">
            <TextField
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email"
              variant="outlined"
              fullWidth
              size="small" // Adicionei size="small" para os inputs não ocuparem tanto espaço no celular
              sx={{ mt: 1 }}
            />

            <FormControl sx={{ width: "100%" }} variant="outlined" size="small">
              <InputLabel htmlFor={`${outlinedPasswordId}-input`}>
                Senha
              </InputLabel>
              <OutlinedInput
                id={`${outlinedPasswordId}-input`}
                type={showPassword ? "text" : "password"}
                label="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword ? "esconder senha" : "mostrar senha"
                      }
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      onMouseUp={handleMouseUpPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>

            <div className="grid p-1 gap-3 mt-2">
              <Button
                className="w-fit justify-self-center"
                type="submit"
                variant="outlined"
                color="black"
              >
                {loading ? (
                  <CircularProgress size={24} color="success" />
                ) : (
                  "Login"
                )}
              </Button>
              <Button
                className="w-fit justify-self-center"
                onClick={() => navigate("/cadastro")}
                variant="outlined"
                color="black"
              >
                Cadastre-se
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 0 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {login}
    </motion.div>
  );
}

export default Login;
