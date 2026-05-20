import * as React from "react";
import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  // Certifique-se de que no localStorage está gravado como _id ou ajuste aqui
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const usuarioId = usuario._id || usuario.id; // Garante a captura independente de como salvou

  const [infoUser, setInfoUser] = useState({});
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
      if (!usuarioId) return; // Evita requisição se não houver ID
      try {
        const resposta = await axios.get(
          `https://backend-no-sufoco.vercel.app/api/user/${usuarioId}`,
          {
            headers: {
              Authorization: `Bearer ${usuario.token}`,
            },
          },
        );
        setInfoUser(resposta.data);
        console.log(resposta.data); 
      } catch (error) {
        console.log(error);
      }
    };

    buscarUsuario();
  }, [usuarioId]); // Usando a variável isolada para evitar loops do objeto

  return (
    <div className="h-screen w-screen">
      <div>
        {/* Ajustado de infoUser.id para infoUser._id de acordo com seu JSON */}
        {infoUser.nome ? (
          <p key={infoUser._id}>{infoUser.nome}</p>
        ) : (
          <p>Carregando dados do usuário...</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
