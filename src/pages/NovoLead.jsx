import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import PageTitle from "../components/PageTitle";
import Input from "../components/Input";
import { createLead } from "../services/leadsService";
import { STATUS_OPTIONS } from "../utils/leadUtils";

const EMPTY_FORM = {
  name: "",
  phone: "",
  company: "",
  segment: "",
  status: "NOVO",
};

function NovoLead() {
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
      await createLead(form);
      navigate("/crm");
    } catch (err) {
      setError(err?.response?.data?.message || "Erro ao cadastrar lead.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout active="crm">
      <PageTitle
        title="Novo Lead"
        subtitle="Cadastre manualmente um novo lead no CRM."
      />

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 max-w-3xl">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nome"
            required
          />
          <Input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="WhatsApp"
            required
          />
          <Input
            name="company"
            value={form.company}
            onChange={handleChange}
            placeholder="Empresa"
          />
          <Input
            name="segment"
            value={form.segment}
            onChange={handleChange}
            placeholder="Segmento"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border p-3 rounded-xl md:col-span-2"
          >
            {STATUS_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            disabled={submitting}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white px-8 py-3 rounded-xl font-bold"
          >
            {submitting ? "Salvando..." : "Salvar Lead"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/crm")}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-8 py-3 rounded-xl font-bold"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Layout>
  );
}

export default NovoLead;
