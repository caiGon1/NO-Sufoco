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

function Cadastro() {
  const outlinedPasswordId = React.useId();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [banco, setBanco] = useState("");

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
      nome: nome,
      email: email,
      senha: senha,
      banco: banco,
    };

    try {
      const response = await axios.post(
        "https://backend-no-sufoco.vercel.app/api/user/cadastro",
        dadosEnvio,
      );
      alert("Cadastro realizado!");
      console.log(response);
      navigate("/");
    } catch (error) {
      console.error("Erro ao enviar: ", error);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="flex flex-col justify-center gap-5">
        <h1>Bora sair do sufoco?</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-3">
            <TextField
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              label="Nome"
              variant="outlined"
            />
            <TextField
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email"
              variant="outlined"
            />

            <FormControl sx={{ width: "100%" }} variant="outlined">
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
            <TextField
              value={banco}
              onChange={(e) => setBanco(e.target.value)}
              label="Banco"
              variant="outlined"
            />
            <Button type="submit" variant="outlined" color="black">
              Enviar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Cadastro;
