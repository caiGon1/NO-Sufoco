import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { ChatBox } from '@mui/x-chat';



const adapter = {
  async sendMessage({ message, messages, signal }) {
    const response = await fetch('https://backend-no-sufoco.vercel.app/api/ia/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history: messages }), 
      signal,
    });

    if (!response.ok) throw new Error('Falha ao obter resposta da IA');

    // O texto completo chega do backend
    const fullText = await response.text();
    const words = fullText.split(' ');

    return new ReadableStream({
      async start(controller) {
        for (const word of words) {
          controller.enqueue({
            type: 'text-delta',
            delta: word + ' ',
          });
          await new Promise((resolve) => setTimeout(resolve, 40));
        }
        controller.enqueue({ type: 'finish' });
        controller.close();
      },
    });
  },
};

const conversation = {
  id: 'copilot',
  title: 'Copilot',
  subtitle: 'Pergunte qualquer coisa',
};

const SUGGESTIONS = [
  'Olá! Como você pode me ajudar?',
  'Quais são as últimas tendências do mercado?',
];

function CopilotEmptyState() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 0.5, px: 3, pt: 4, pb: 1 }}>
      <AutoAwesomeOutlinedIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
      <Typography sx={{ fontSize: 16, fontWeight: 600 }}>Como posso ajudar?</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280 }}>
        Tire suas dúvidas ou selecione uma das sugestões abaixo para começar.
      </Typography>
    </Box>
  );
}

export default function Chat() {
  const [open, setOpen] = React.useState(false);

  // Alterna o estado de aberto/fechado do chat ao clicar no Speed Dial
  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  return (
    <>
      {/* 2. Caixa Flutuante do Chat (Aparece apenas se open for true) */}
      {open && (
        <Paper
          elevation={6}
          sx={{
            position: 'fixed',
            bottom: 90, // Fica logo acima do Speed Dial
            right: 24,
            width: 360,
            height: 500,
            zIndex: 1000, // Garante que fica por cima de tabelas e grids
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {/* Cabeçalho do Chat */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesomeOutlinedIcon color="primary" fontSize="small" />
              <Typography sx={{ fontWeight: 'bold' }}>Assistente IA</Typography>
            </Box>
            <IconButton size="small" onClick={() => setOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Corpo do Chat */}
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <ChatBox
              adapter={adapter}
              initialConversations={[conversation]}
              initialActiveConversationId={conversation.id}
              variant="compact"
              suggestions={SUGGESTIONS}
              suggestionsAutoSubmit
              slots={{ emptyState: CopilotEmptyState }}
              features={{ conversationHeader: false }}
            />
          </Box>
        </Paper>
      )}

      <SpeedDial
        ariaLabel="Abrir Assistente de IA"
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          zIndex: 1000 
        }}
        icon={
          <SpeedDialIcon 
            icon={<AutoAwesomeOutlinedIcon />} // Ícone padrão (fechado)
            openIcon={<CloseIcon />}           // Ícone quando o chat está aberto
          />
        }
        onClick={handleToggle}
        open={open}
      />
    </>
  );
}