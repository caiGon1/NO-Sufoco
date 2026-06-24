import Cadastro from "./pages/Cadastro";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Acoes from "./pages/Acoes";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cadastro" element={<Cadastro />}></Route>
          <Route path="/acoes" element={<Acoes />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
