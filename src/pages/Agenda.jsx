import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Badge from "../components/Badge";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import { useAppointments } from "../hooks/useAppointments";
import { deleteAppointment } from "../services/appointmentsService";
import { STATUS_LABEL, getAppointmentStatusColor } from "../utils/appointmentUtils";

function formatTime(value) {
  return new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatDay(value) {
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function Agenda() {
  const { appointments, loading, error, refetch } = useAppointments();
  const [toDelete, setToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  async function handleExcluir() {
    try {
      await deleteAppointment(toDelete.id);
      setToDelete(null);
      refetch();
    } catch {
      setToDelete(null);
      setToast({ type: "error", message: "Erro ao excluir compromisso." });
      setTimeout(() => setToast(null), 3000);
    }
  }

  return (
    <Layout active="agenda">
      <main className="flex-1 p-8">
        {toast && <Toast type={toast.type} message={toast.message} />}

        <Modal
          isOpen={!!toDelete}
          title="Excluir Compromisso"
          message={`Tem certeza que deseja excluir "${toDelete?.title}"? Esta ação não pode ser desfeita.`}
          onClose={() => setToDelete(null)}
          onConfirm={handleExcluir}
        />

        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-bold text-blue-950">
              Agenda
            </h2>

            <p className="text-slate-600 mt-2">
              Organize reuniões e demonstrações.
            </p>
          </div>

          <Link
            to="/novo-evento"
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold"
          >
            Novo Evento
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow p-6">

          <h3 className="text-2xl font-bold mb-6">
            Agenda do dia
          </h3>

          {loading ? (
            <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto" />
          ) : appointments.length === 0 ? (
            <EmptyState
              title="Nenhum compromisso agendado"
              description="Cadastre o primeiro evento da agenda."
            />
          ) : (
            <div className="space-y-4">

              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border rounded-xl p-5 flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-bold text-xl">
                      {appointment.title}
                    </h4>

                    <p>{appointment.clientName ?? "—"}</p>
                    <p className="text-slate-500 text-sm mt-1">
                      {formatDay(appointment.startAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge color={getAppointmentStatusColor(appointment.status)}>
                      {STATUS_LABEL[appointment.status] ?? appointment.status}
                    </Badge>

                    <div className="text-2xl font-bold text-blue-900">
                      {formatTime(appointment.startAt)}
                    </div>

                    <Link
                      to={`/editarevento/${appointment.id}`}
                      className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg inline-block"
                    >
                      Editar
                    </Link>

                    <button
                      onClick={() => setToDelete(appointment)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}

            </div>
          )}

        </div>

      </main>

    </Layout>
  );
}

export default Agenda;
