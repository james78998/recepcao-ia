import "./App.css";
import { HashRouter, Routes, Route } from "react-router-dom";

import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";

import Home from "./pages/Home";
import RecuperarSenha from "./pages/RecuperarSenha";

import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";

import Dashboard from "./pages/Dashboard";
import CRM from "./pages/CRM";
import LeadDetails from "./pages/LeadDetails";
import NovoLead from "./pages/NovoLead";
import EditarLead from "./pages/EditarLead";
import Insights from "./pages/Insights";
import WhatsApp from "./pages/WhatsApp";
import Agenda from "./pages/Agenda";
import Financeiro from "./pages/Financeiro";
import Configuracoes from "./pages/Configuracoes";
import Perfil from "./pages/Perfil";

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Rotas abertas */}
        <Route path="/" element={<Home />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />

        {/* Rotas públicas: redirecionam para /dashboard se já autenticado */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
        </Route>

        {/* Rotas privadas: redirecionam para /login se não autenticado */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/crm" element={<CRM />} />
          <Route path="/lead/:id" element={<LeadDetails />} />
          <Route path="/novo-lead" element={<NovoLead />} />
          <Route path="/editarlead/:id" element={<EditarLead />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/whatsapp" element={<WhatsApp />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
