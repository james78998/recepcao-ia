import { useAdminAuth } from "../../hooks/useAdminAuth";
import AdminLayout from "../../components/admin/AdminLayout";

function AdminDashboard() {
  const { admin } = useAdminAuth();

  return (
    <AdminLayout active="dashboard">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">
        Bem-vindo, {admin?.name}
      </h1>
      <p className="text-slate-600">
        Sessão de Super Admin ativa. Este painel será expandido nas próximas etapas
        (tenants, planos, assinaturas, faturamento, consumo, suporte e auditoria).
      </p>
    </AdminLayout>
  );
}

export default AdminDashboard;
