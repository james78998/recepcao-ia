import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import PageTitle from "../components/PageTitle";
import Input from "../components/Input";
import Loading from "../components/Loading";
import { getLeadById, updateLead } from "../services/leadsService";
import { STATUS_OPTIONS } from "../utils/leadUtils";

function EditarLead() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState(null);
  const [loadingLead, setLoadingLead] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getLeadById(id)
      .then((lead) => {
        if (cancelled) return;
        setForm({
          name: lead.name ?? "",
          phone: lead.phone ?? "",
          company: lead.company ?? "",
          segment: lead.segment ?? "",
          status: lead.status ?? "NOVO",
          notes: lead.notes ?? "",
        });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.response?.status === 404) setNotFound(true);
        else setError(err?.response?.data?.message || "Erro ao carregar lead.");
      })
      .finally(() => {
        if (!cancelled) setLoadingLead(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await updateLead(id, form);
      navigate("/crm");
    } catch (err) {
      setError(err?.response?.data?.message || "Erro ao atualizar lead.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingLead) return <Loading text="Carregando lead..." />;

  if (notFound) {
    return (
      <Layout active="crm">
        <PageTitle title="Lead não encontrado" subtitle="O lead solicitado não existe." />
        <button
          onClick={() => navigate("/crm")}
          className="bg-blue-900 text-white px-6 py-3 rounded-xl font-bold"
        >
          Voltar para CRM
        </button>
      </Layout>
    );
  }

  return (
    <Layout active="crm">
      <PageTitle title="Editar Lead" subtitle="Atualize as informações do lead." />

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

        <div className="flex flex-col md:flex-row gap-4 mt-8">
          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white px-8 py-4 rounded-xl font-bold transition"
          >
            {submitting ? "Salvando..." : "Salvar alterações"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/crm")}
            className="w-full md:w-auto bg-slate-200 hover:bg-slate-300 text-slate-800 px-8 py-4 rounded-xl font-bold transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Layout>
  );
}

export default EditarLead;
