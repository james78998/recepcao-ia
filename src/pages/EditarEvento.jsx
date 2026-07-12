import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import PageTitle from "../components/PageTitle";
import Input from "../components/Input";
import Loading from "../components/Loading";
import { getAppointmentById, updateAppointment } from "../services/appointmentsService";
import { STATUS_OPTIONS } from "../utils/appointmentUtils";

function toDatetimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function EditarEvento() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState(null);
  const [loadingEvento, setLoadingEvento] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAppointmentById(id)
      .then((appointment) => {
        if (cancelled) return;
        setForm({
          title: appointment.title ?? "",
          clientName: appointment.clientName ?? "",
          location: appointment.location ?? "",
          description: appointment.description ?? "",
          startAt: toDatetimeLocal(appointment.startAt),
          endAt: toDatetimeLocal(appointment.endAt),
          status: appointment.status ?? "SCHEDULED",
        });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.response?.status === 404) setNotFound(true);
        else setError(err?.response?.data?.message || "Erro ao carregar compromisso.");
      })
      .finally(() => {
        if (!cancelled) setLoadingEvento(false);
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
      await updateAppointment(id, form);
      navigate("/agenda");
    } catch (err) {
      setError(err?.response?.data?.message || "Erro ao atualizar compromisso.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingEvento) return <Loading text="Carregando compromisso..." />;

  if (notFound) {
    return (
      <Layout active="agenda">
        <PageTitle title="Compromisso não encontrado" subtitle="O evento solicitado não existe." />
        <button
          onClick={() => navigate("/agenda")}
          className="bg-blue-900 text-white px-6 py-3 rounded-xl font-bold"
        >
          Voltar para Agenda
        </button>
      </Layout>
    );
  }

  return (
    <Layout active="agenda">
      <PageTitle title="Editar Evento" subtitle="Atualize as informações do compromisso." />

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 max-w-3xl">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <Input name="title" value={form.title} onChange={handleChange} placeholder="Título" required />
          <Input name="clientName" value={form.clientName} onChange={handleChange} placeholder="Cliente" />
          <Input name="startAt" type="datetime-local" value={form.startAt} onChange={handleChange} required />
          <Input name="endAt" type="datetime-local" value={form.endAt} onChange={handleChange} required />
          <Input name="location" value={form.location} onChange={handleChange} placeholder="Local" />
          <Input name="description" value={form.description} onChange={handleChange} placeholder="Observações" />

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
            onClick={() => navigate("/agenda")}
            className="w-full md:w-auto bg-slate-200 hover:bg-slate-300 text-slate-800 px-8 py-4 rounded-xl font-bold transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Layout>
  );
}

export default EditarEvento;
