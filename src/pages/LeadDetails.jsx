import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import Loading from "../components/Loading";
import Badge from "../components/Badge";
import { getLeadById, getLeadMessages, updateLead, deleteLead } from "../services/leadsService";
import { getStatusColor } from "../utils/getStatusColor";
import { STATUS_LABEL } from "../utils/leadUtils";

function formatMessageTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [loadingLead, setLoadingLead] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getLeadById(id)
      .then((data) => { if (!cancelled) setLead(data); })
      .catch((err) => { if (!cancelled && err?.response?.status === 404) setNotFound(true); })
      .finally(() => { if (!cancelled) setLoadingLead(false); });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    getLeadMessages(id)
      .then((data) => { if (!cancelled) setMessages(data); })
      .catch(() => { if (!cancelled) setMessages([]); })
      .finally(() => { if (!cancelled) setLoadingMessages(false); });
    return () => { cancelled = true; };
  }, [id]);

  async function handleMoverDemonstracao() {
    try {
      const updated = await updateLead(id, { status: "DEMONSTRACAO" });
      setLead(updated);
      setToast({ type: "success", message: "Lead movido para Demonstração!" });
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast({ type: "error", message: "Erro ao atualizar status." });
      setTimeout(() => setToast(null), 3000);
    }
  }

  async function handleExcluir() {
    setDeleting(true);
    try {
      await deleteLead(id);
      navigate("/crm");
    } catch {
      setShowModal(false);
      setDeleting(false);
      setToast({ type: "error", message: "Erro ao excluir lead." });
      setTimeout(() => setToast(null), 3000);
    }
  }

  if (loadingLead) return <Loading text="Carregando lead..." />;

  if (notFound) {
    return (
      <Layout active="crm">
        <Link to="/crm" className="text-blue-900 font-bold">← Voltar para CRM</Link>
        <div className="mt-8">
          <h2 className="text-3xl font-bold text-blue-950">Lead não encontrado</h2>
          <p className="text-slate-500 mt-2">O lead solicitado não existe ou foi removido.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout active="crm">
      {toast && <Toast type={toast.type} message={toast.message} />}

      <Modal
        isOpen={showModal}
        title="Excluir Lead"
        message={`Tem certeza que deseja excluir o lead "${lead.name}"? Esta ação não pode ser desfeita.`}
        onClose={() => setShowModal(false)}
        onConfirm={handleExcluir}
      />

      <main className="flex-1">
        <Link to="/crm" className="text-blue-900 font-bold">
          ← Voltar para CRM
        </Link>

        <div className="mt-6 mb-8">
          <h2 className="text-4xl font-bold text-blue-950">{lead.name}</h2>
          <p className="text-slate-600 mt-2">Lead captado pela Recepção IA.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
            <h3 className="text-2xl font-bold text-blue-950 mb-6">
              Histórico de atendimento
            </h3>

            <div className="space-y-4">
              {loadingMessages ? (
                <div className="py-8 flex justify-center">
                  <div className="w-6 h-6 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <p className="text-slate-400 text-sm">Nenhuma mensagem registrada ainda.</p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-xl ${
                      message.direction === "INBOUND" ? "bg-slate-100" : "bg-green-100"
                    }`}
                  >
                    <p className="font-bold">
                      {message.direction === "INBOUND" ? lead.name : "Recepção IA"} —{" "}
                      {formatMessageTime(message.sentAt || message.createdAt)}
                    </p>
                    <p>{message.content}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <aside className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-2xl font-bold text-blue-950 mb-6">Dados do lead</h3>

            <div className="space-y-4 text-slate-700">
              <p><strong>Nome:</strong> {lead.name}</p>
              <p><strong>Empresa:</strong> {lead.company ?? "—"}</p>
              <p><strong>WhatsApp:</strong> {lead.phone}</p>
              <p><strong>Segmento:</strong> {lead.segment ?? "—"}</p>
              <p>
                <strong>Status:</strong>{" "}
                <Badge color={getStatusColor(lead.status)}>
                  {STATUS_LABEL[lead.status] ?? lead.status}
                </Badge>
              </p>
              {lead.source && <p><strong>Origem:</strong> {lead.source}</p>}
              {lead.email && <p><strong>E-mail:</strong> {lead.email}</p>}
            </div>

            <div className="mt-8 space-y-3">
              <button
                onClick={() => navigate(`/whatsapp?leadId=${id}`)}
                className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold"
              >
                Enviar WhatsApp
              </button>

              {lead.status !== "DEMONSTRACAO" && (
                <button
                  onClick={handleMoverDemonstracao}
                  className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold"
                >
                  Mover para Demonstração
                </button>
              )}

              <Link
                to={`/editarlead/${id}`}
                className="w-full block text-center bg-blue-900 hover:bg-blue-800 text-white py-4 rounded-xl font-bold transition"
              >
                Editar Lead
              </Link>

              <button
                onClick={() => setShowModal(true)}
                disabled={deleting}
                className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white py-3 rounded-xl font-bold"
              >
                {deleting ? "Excluindo..." : "Excluir Lead"}
              </button>
            </div>
          </aside>
        </div>
      </main>
    </Layout>
  );
}

export default LeadDetails;
