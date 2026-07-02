import { Link } from "react-router-dom";

function AdminSidebar({ active }) {
  const menu = [
    { name: "Dashboard", path: "/admin/dashboard", key: "dashboard" },
  ];

  return (
    <aside className="w-72 bg-slate-900 text-white p-6 hidden md:block">
      <h1 className="text-2xl font-bold mb-10">
        Recepção IA — Admin
      </h1>

      <nav className="space-y-4">
        {menu.map((item) => (
          <Link
            key={item.key}
            to={item.path}
            className={`block p-3 rounded-xl transition-colors ${
              active === item.key
                ? "bg-slate-700"
                : "hover:bg-slate-700"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default AdminSidebar;
