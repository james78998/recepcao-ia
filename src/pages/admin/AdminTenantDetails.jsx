import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import Loading from "../../components/Loading";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import { getTenantById, getTenantModules, updateTenantModule } from "../../services/adminTenantsService";

function formatDate(value) {
  return new Date(value).toLocaleDateString("pt-BR");
}

function ModulesSection({ tenantId }) {
  const [modules, setModules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingKey, setTogglingKey] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getTenantModules(tenantId)
      .then((data) => { if (!cancelled) setModules(data.data); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tenantId]);

  async function handleToggle(moduleKey, enabled) {
    setTogglingKey(moduleKey);
    try {
      const result = await updateTenantModule(tenantId, moduleKey, enabled);
      setModules(result.data);
    } finally {
      setTogglingKey(null);
    }
  }

  if (loading) return <Loading text="Carregando módulos..." />;

  return (
    <div className="bg-white rounded-2xl shadow p-6 max-w-2xl mt-8">
      <h3 className="text-2xl font-bold text-slate-900 mb-4">Módulos</h3>
      <div className="space-y-3">
        {modules.map((module) => (
          <div key={module.key} className="flex items-center justify-between border rounded-xl p-4">
            <div>
              <p className="font-bold text-slate-800">{module.name}</p>
              {module.description && <p className="text-sm text-slate-500">{module.description}</p>}
            </div>
            <div className="flex items-center gap-3">
              <Badge color={module.enabled ? "green" : "gray"}>
                {module.enabled ? "Habilitado" : "Desabilitado"}
              </Badge>
              <Button
                color={module.enabled ? "red" : "green"}
                className="px-4 py-2 text-sm"
                disabled={togglingKey === module.key}
                onClick={() => handleToggle(module.key, !module.enabled)}
              >
                {module.enabled ? "Desabilitar" : "Habilitar"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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

      <ModulesSection tenantId={id} />
    </AdminLayout>
  );
}

export default AdminTenantDetails;
