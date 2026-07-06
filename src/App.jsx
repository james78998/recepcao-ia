import "./App.css";
import { HashRouter, Routes, Route } from "react-router-dom";

import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";

import Home from "./pages/Home";
import RecuperarSenha from "./pages/RecuperarSenha";
import RedefinirSenha from "./pages/RedefinirSenha";

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

import AdminPrivateRoute from "./components/AdminPrivateRoute";
import AdminPublicRoute from "./components/AdminPublicRoute";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTenants from "./pages/admin/AdminTenants";
import AdminTenantDetails from "./pages/admin/AdminTenantDetails";
import AdminNovoTenant from "./pages/admin/AdminNovoTenant";

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Rotas abertas */}
        <Route path="/" element={<Home />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />

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

        {/* Painel Super Admin — realm de autenticação separado do Tenant */}
        <Route element={<AdminPublicRoute />}>
          <Route path="/admin/login" element={<AdminLogin />} />
        </Route>

        <Route element={<AdminPrivateRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/tenants" element={<AdminTenants />} />
          <Route path="/admin/tenants/novo" element={<AdminNovoTenant />} />
          <Route path="/admin/tenants/:id" element={<AdminTenantDetails />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
