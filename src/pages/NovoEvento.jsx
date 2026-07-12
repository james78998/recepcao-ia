import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import PageTitle from "../components/PageTitle";
import Input from "../components/Input";
import { createAppointment } from "../services/appointmentsService";

const EMPTY_FORM = {
  title: "",
  clientName: "",
  location: "",
  startAt: "",
  endAt: "",
  description: "",
};

function NovoEvento() {
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
      await createAppointment({ ...form, endAt: form.endAt || undefined });
      navigate("/agenda");
    } catch (err) {
      setError(err?.response?.data?.message || "Erro ao cadastrar compromisso.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout active="agenda">
      <PageTitle
        title="Novo Evento"
        subtitle="Cadastre um novo compromisso na agenda."
      />

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 max-w-3xl">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <Input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Título"
            required
          />
          <Input
            name="clientName"
            value={form.clientName}
            onChange={handleChange}
            placeholder="Cliente"
          />
          <Input
            name="startAt"
            type="datetime-local"
            value={form.startAt}
            onChange={handleChange}
            required
          />
          <Input
            name="endAt"
            type="datetime-local"
            value={form.endAt}
            onChange={handleChange}
          />
          <Input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Local"
          />
          <Input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Observações"
          />
        </div>

        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            disabled={submitting}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white px-8 py-3 rounded-xl font-bold"
          >
            {submitting ? "Salvando..." : "Salvar Evento"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/agenda")}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-8 py-3 rounded-xl font-bold"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Layout>
  );
}

export default NovoEvento;
