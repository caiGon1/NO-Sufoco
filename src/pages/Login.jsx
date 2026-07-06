import * as React from "react";
import axios from "axios";
import { useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import CircularProgress from '@mui/material/CircularProgress';

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function Login() {
  const outlinedPasswordId = React.useId();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = React.useState(false);

  const navigate = useNavigate();

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
        token: response.data.token
      }

      localStorage.setItem("usuario", JSON.stringify(dadosUsuario));

      navigate('/dashboard')
    } catch (error) {
      console.error("Erro ao enviar: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
   <div 
  className="h-screen w-screen flex flex-col items-center justify-center bg-bottom bg-no-repeat gap-20"
  style={{ 
    backgroundImage: "url('/Ellipse1.svg')", 
    backgroundSize: "100% 65%" 
  }}
>

      <h1 className="font-poppins text-[100px] -mt-40"><span className="font-bold">NO </span><span className="font-light">Sufoco</span></h1>
      <div className="flex flex-col justify-center gap-5 bg-white p-10 rounded-b-[10%]">
    <p className="font-poppins text-center">Bem-vindo(a) de volta!</p>
      <form onSubmit={handleSubmit}>
          
        <div className="grid gap-3">
          
          <TextField
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="Email"
            variant="outlined"
          />

          <FormControl sx={{ width: '100%' }} variant="outlined">
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
            <div className="grid p-1 gap-3">
          <Button className="w-fit justify-self-center" type="submit" variant="outlined" color="black">
            {loading ? <CircularProgress size={24} color="success" /> : "Login"}
            </Button>
                <Button className="w-fit justify-self-center" onClick={() => navigate('/cadastro')} variant="outlined" color="black">
              Cadastre-se
          </Button>
          </div>
        </div>
      </form>
      </div>
        </div>
  );
}

export default Login;
