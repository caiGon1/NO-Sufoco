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

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function Login() {
  const outlinedPasswordId = React.useId();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

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
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="flex flex-col justify-center gap-5">
    <a href="/cadastro">Não é cadastrado ainda? Registre-se!</a>
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
          <Button type="submit" variant="outlined" color="black">
            Enviar
          </Button>
        </div>
      </form>
      </div>
    </div>
  );
}

export default Login;
