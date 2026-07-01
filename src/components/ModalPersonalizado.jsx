import * as React from "react";
import { Modal, Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function ModalPersonalizado({ isOpen, onClose, titulo, children, tamanho = "md" }) {
  

  const larguras = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg", 
    xl: "max-w-xl", 
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="modal-title"
      closeAfterTransition
      slotProps={{
        backdrop: {
          className: "bg-black/40 backdrop-blur-sm transition-opacity duration-300",
        },
      }}
      className="flex items-center justify-center p-4"
    >
      <Box
        className={`w-full ${larguras[tamanho]} bg-white rounded-2xl shadow-xl border border-gray-100 p-6 relative focus:outline-none transform transition-all duration-300`}
      >
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
          <h2 id="modal-title" className="text-lg font-bold text-gray-800">
            {titulo}
          </h2>
          
          <IconButton 
            onClick={onClose} 
            size="small"
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
       <div className="text-sm text-gray-600">
          {children}
        </div>
      </Box>
    </Modal>
  );
}

export default ModalPersonalizado;