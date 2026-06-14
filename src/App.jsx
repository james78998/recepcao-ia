import "./App.css";
import { HashRouter, Routes, Route } from "react-router-dom";
import CRM from "./pages/CRM";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LeadDetails from "./pages/LeadDetails";
import Insights from "./pages/Insights";
import WhatsApp from "./pages/WhatsApp";
import Agenda from "./pages/Agenda";
import Configuracoes from "./pages/Configuracoes";
import Financeiro from "./pages/Financeiro";
import Perfil from "./pages/Perfil";
import Cadastro from "./pages/Cadastro";
import RecuperarSenha from "./pages/RecuperarSenha";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/crm" element={<CRM />} />
        <Route path="/lead/:id" element={<LeadDetails />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/whatsapp" element={<WhatsApp />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/financeiro" element={<Financeiro />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      </Routes>
    </HashRouter>

  );
}

export default App;