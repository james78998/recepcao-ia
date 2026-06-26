import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Sidebar({ active }) {
  const { user } = useAuth();
  const companyName = user?.tenant?.name ?? 'Recepção IA';

  const menu = [
    { name: "Dashboard", path: "/dashboard", key: "dashboard" },
    { name: "CRM", path: "/crm", key: "crm" },
    { name: "IA Insights", path: "/insights", key: "insights" },
    { name: "WhatsApp", path: "/whatsapp", key: "whatsapp" },
    { name: "Agenda", path: "/agenda", key: "agenda" },
    { name: "Configurações", path: "/configuracoes", key: "configuracoes" },
    { name: "Financeiro", path: "/financeiro", key: "financeiro" },
    { name: "Perfil", path: "/perfil", key: "perfil" },
  ];

  return (
    <aside className="w-72 bg-blue-950 text-white p-6 hidden md:block">
      <h1 className="text-2xl font-bold mb-10">
        {companyName}
      </h1>

      <nav className="space-y-4">
        {menu.map((item) => (
          <Link
            key={item.key}
            to={item.path}
            className={`block p-3 rounded-xl transition-colors ${
              active === item.key
                ? "bg-blue-900"
                : "hover:bg-blue-900"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
