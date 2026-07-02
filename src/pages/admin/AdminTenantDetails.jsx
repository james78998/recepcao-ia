import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import Loading from "../../components/Loading";
import Badge from "../../components/Badge";
import { getTenantById } from "../../services/adminTenantsService";

function formatDate(value) {
  return new Date(value).toLocaleDateString("pt-BR");
}

function AdminTenantDetails() {
  const { id } = useParams();

  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getTenantById(id)
      .then((data) => { if (!cancelled) setTenant(data); })
      .catch((err) => { if (!cancelled && err?.response?.status === 404) setNotFound(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <Loading text="Carregando cliente..." />;

  if (notFound) {
    return (
      <AdminLayout active="tenants">
        <Link to="/admin/tenants" className="text-slate-900 font-bold">← Voltar para Clientes</Link>
        <div className="mt-8">
          <h2 className="text-3xl font-bold text-slate-900">Cliente não encontrado</h2>
          <p className="text-slate-500 mt-2">O tenant solicitado não existe.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout active="tenants">
      <Link to="/admin/tenants" className="text-slate-900 font-bold">
        ← Voltar para Clientes
      </Link>

      <div className="mt-6 mb-8">
        <h2 className="text-4xl font-bold text-slate-900">{tenant.name}</h2>
        <p className="text-slate-600 mt-2">Cliente da plataforma Recepção IA.</p>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 max-w-2xl space-y-4 text-slate-700">
        <p><strong>E-mail:</strong> {tenant.email}</p>
        <p><strong>Criado em:</strong> {formatDate(tenant.createdAt)}</p>
        <p>
          <strong>IA:</strong>{" "}
          <Badge color={tenant.aiEnabled ? "green" : "gray"}>
            {tenant.aiEnabled ? "Ativa" : "Inativa"}
          </Badge>
        </p>
        <p><strong>WhatsApp Phone Number ID:</strong> {tenant.whatsappPhoneNumberId ?? "—"}</p>
        <p><strong>Usuários:</strong> {tenant.totalUsers}</p>
        <p><strong>Leads:</strong> {tenant.totalLeads}</p>
        <p><strong>Conversas:</strong> {tenant.totalConversations}</p>
      </div>
    </AdminLayout>
  );
}

export default AdminTenantDetails;
