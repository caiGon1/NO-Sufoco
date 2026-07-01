import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Checkbox, List, ListItem, ListItemText, Button, CircularProgress } from '@mui/material';

export default function SeletorAtivos({ onSalvar, onClose }) {
  const [ativosDisponiveis, setAtivosDisponiveis] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    axios.get('https://brapi.dev/api/quote/list') 
      .then(res => {
        setAtivosDisponiveis(res.data.stocks.slice(0, 50));
        setCarregando(false);
      });
  }, []);

  const handleToggle = (ticker) => {
    setSelecionados(prev => 
      prev.includes(ticker) ? prev.filter(t => t !== ticker) : [...prev, ticker]
    );
  };

  return (
    <div className="space-y-4">
      {carregando ? <CircularProgress /> : (
        <>
          <List className="max-h-60 overflow-y-auto border rounded-lg">
            {ativosDisponiveis.map((ativo) => (
              <ListItem key={ativo.stock} button onClick={() => handleToggle(ativo.stock)}>
                <Checkbox checked={selecionados.includes(ativo.stock)} />
                <ListItemText primary={ativo.stock} secondary={ativo.name} />
              </ListItem>
            ))}
          </List>
          <Button 
            fullWidth variant="contained" color="success" 
            onClick={() => onSalvar(selecionados)}
          >
            Adicionar Selecionados
          </Button>
        </>
      )}
    </div>
  );
}