import { Link } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import PageTitle from "../../components/PageTitle";
import DataTable from "../../components/DataTable";
import EmptyState from "../../components/EmptyState";
import Badge from "../../components/Badge";
import { useAdminTenants } from "../../hooks/useAdminTenants";

function formatDate(value) {
  return new Date(value).toLocaleDateString("pt-BR");
}

function AdminTenants() {
  const { tenants, loading, error } = useAdminTenants();

  return (
    <AdminLayout active="tenants">
      <PageTitle
        title="Clientes"
        subtitle="Tenants cadastrados na plataforma Recepção IA."
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <DataTable
        title="Lista de clientes"
        headers={["Nome", "E-mail", "Criado em", "IA", "Usuários", "Leads", "Conversas", "Ações"]}
      >
        {loading ? (
          <tr>
            <td colSpan="8" className="py-10 text-center text-slate-400">
              <div className="w-8 h-8 border-4 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto" />
            </td>
          </tr>
        ) : tenants.length === 0 ? (
          <tr>
            <td colSpan="8" className="py-6">
              <EmptyState
                title="Nenhum cliente encontrado"
                description="Ainda não há tenants cadastrados na plataforma."
              />
            </td>
          </tr>
        ) : (
          tenants.map((tenant) => (
            <tr key={tenant.id} className="border-b">
              <td className="py-3">{tenant.name}</td>
              <td className="py-3">{tenant.email}</td>
              <td className="py-3">{formatDate(tenant.createdAt)}</td>
              <td className="py-3">
                <Badge color={tenant.aiEnabled ? "green" : "gray"}>
                  {tenant.aiEnabled ? "Ativa" : "Inativa"}
                </Badge>
              </td>
              <td className="py-3">{tenant.totalUsers}</td>
              <td className="py-3">{tenant.totalLeads}</td>
              <td className="py-3">{tenant.totalConversations}</td>
              <td className="py-3">
                <Link
                  to={`/admin/tenants/${tenant.id}`}
                  className="bg-slate-800 text-white px-4 py-2 rounded-lg inline-block"
                >
                  Ver
                </Link>
              </td>
            </tr>
          ))
        )}
      </DataTable>
    </AdminLayout>
  );
}

export default AdminTenants;
