import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import PageTitle from "../../components/PageTitle";
import Input from "../../components/Input";
import { createTenant } from "../../services/adminTenantsService";

const EMPTY_FORM = {
  tenantName: "",
  tenantEmail: "",
  userName: "",
  userEmail: "",
  password: "",
};

function AdminNovoTenant() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const tenant = await createTenant(form);
      navigate(`/admin/tenants/${tenant.id}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Erro ao cadastrar cliente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminLayout active="tenants">
      <PageTitle
        title="Novo Cliente"
        subtitle="Cadastre manualmente um novo tenant na plataforma Recepção IA."
      />

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 max-w-3xl">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <Input
            name="tenantName"
            value={form.tenantName}
            onChange={handleChange}
            placeholder="Nome da empresa"
            required
          />
          <Input
            name="tenantEmail"
            type="email"
            value={form.tenantEmail}
            onChange={handleChange}
            placeholder="E-mail da empresa"
            required
          />
          <Input
            name="userName"
            value={form.userName}
            onChange={handleChange}
            placeholder="Nome do usuário admin"
            required
          />
          <Input
            name="userEmail"
            type="email"
            value={form.userEmail}
            onChange={handleChange}
            placeholder="E-mail do usuário admin"
            required
          />
          <div className="md:col-span-2">
            <Input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Senha inicial"
              minLength={8}
              required
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            disabled={submitting}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white px-8 py-3 rounded-xl font-bold"
          >
            {submitting ? "Salvando..." : "Salvar Cliente"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/tenants")}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-8 py-3 rounded-xl font-bold"
          >
            Cancelar
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}

export default AdminNovoTenant;
