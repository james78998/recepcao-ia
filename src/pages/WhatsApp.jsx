import { useState, useEffect, useCallback, useRef } from "react";
import Layout from "../components/Layout";
import Badge from "../components/Badge";
import EmptyState from "../components/EmptyState";
import { getConversations, getConversationMessages, sendMessage } from "../services/conversationsService";

function formatTime(dateStr) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "agora";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function toHHMM(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function ConversationItem({ conversation, selected, onClick }) {
  const last = conversation.messages?.[0];
  const lead = conversation.lead;
  const displayName = lead?.name || lead?.phone || "Contato";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
        selected ? "bg-blue-50 border-l-4 border-l-blue-900" : "border-l-4 border-l-transparent"
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <span className="font-semibold text-slate-800 truncate">{displayName}</span>
        <span className="text-xs text-slate-400 shrink-0">{last ? formatTime(last.createdAt) : ""}</span>
      </div>
      <p className="text-sm text-slate-500 truncate mt-0.5">
        {last
          ? `${last.direction === "OUTBOUND" ? "Você: " : ""}${last.content}`
          : "Sem mensagens"}
      </p>
    </button>
  );
}

function MessageBubble({ message }) {
  const isInbound = message.direction === "INBOUND";
  const isDraft   = message.direction === "OUTBOUND" && message.status === "DRAFT";
  const isSent    = message.direction === "OUTBOUND" && message.status === "SENT";
  const time      = toHHMM(message.sentAt || message.createdAt);

  if (isInbound) {
    return (
      <div className="flex justify-start mb-3">
        <div className="max-w-[70%] bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <p className="text-xs text-slate-400 mt-1 text-right">{time}</p>
        </div>
      </div>
    );
  }

  if (isSent) {
    return (
      <div className="flex justify-end mb-3">
        <div className="max-w-[70%] bg-blue-900 text-white rounded-2xl rounded-tr-none px-4 py-2.5 shadow-sm">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <p className="text-xs text-blue-300 mt-1 text-right">{time}</p>
        </div>
      </div>
    );
  }

  if (isDraft) {
    return (
      <div className="flex justify-end mb-3">
        <div className="max-w-[70%]">
          <div className="flex justify-end mb-1">
            <Badge color="orange">Rascunho IA</Badge>
          </div>
          <div className="bg-amber-50 border border-amber-200 text-slate-800 rounded-2xl rounded-tr-none px-4 py-2.5 shadow-sm">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            <p className="text-xs text-amber-500 mt-1 text-right">{time}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function WhatsApp() {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId]       = useState(null);
  const [selectedConv, setSelectedConv]   = useState(null);
  const [messages, setMessages]           = useState([]);
  const [loadingList, setLoadingList]     = useState(true);
  const [loadingMsgs, setLoadingMsgs]     = useState(false);
  const [listError, setListError]         = useState(null);
  const [search, setSearch]               = useState("");
  const [sendingId, setSendingId]         = useState(null);
  const [sendError, setSendError]         = useState(null);
  const messagesEndRef                    = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(data);
      setListError(null);
    } catch {
      setListError("Não foi possível carregar as conversas.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadMessages = useCallback(async (id) => {
    setLoadingMsgs(true);
    try {
      const { conversation, messages: msgs } = await getConversationMessages(id);
      setSelectedConv(conversation);
      setMessages(msgs);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedId) return;
    setSendError(null);
    setSendingId(null);
    loadMessages(selectedId);
    const interval = setInterval(() => loadMessages(selectedId), 10_000);
    return () => clearInterval(interval);
  }, [selectedId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filtered = conversations.filter((c) =>
    (c.lead?.name || c.lead?.phone || "").toLowerCase().includes(search.toLowerCase()),
  );

  const draftMessage = messages.find(
    (m) => m.direction === "OUTBOUND" && m.status === "DRAFT",
  );
  const hasDraft = !!draftMessage;

  async function handleSend() {
    if (!draftMessage || sendingId) return;
    setSendingId(draftMessage.id);
    setSendError(null);
    try {
      const updated = await sendMessage(draftMessage.id);
      setMessages((prev) =>
        prev.map((m) => (m.id === draftMessage.id ? { ...m, ...updated } : m)),
      );
    } catch {
      setSendError("Não foi possível enviar. Tente novamente.");
    } finally {
      setSendingId(null);
    }
  }

  return (
    <Layout active="WhatsApp">
      <h2 className="text-4xl font-bold text-blue-950 mb-6">WhatsApp — Inbox</h2>

      <div className="flex gap-4" style={{ height: "calc(100vh - 210px)" }}>

        {/* ── Lista de conversas ── */}
        <div className="w-80 bg-white rounded-2xl shadow flex flex-col overflow-hidden shrink-0">
          <div className="p-3 border-b border-slate-100">
            <input
              type="text"
              placeholder="Buscar contato..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingList && (
              <div className="flex justify-center items-center h-24">
                <div className="w-6 h-6 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {listError && (
              <p className="p-4 text-sm text-red-500">{listError}</p>
            )}
            {!loadingList && !listError && filtered.length === 0 && (
              <p className="p-6 text-sm text-slate-400 text-center">
                Nenhuma conversa encontrada.
              </p>
            )}
            {filtered.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                selected={conv.id === selectedId}
                onClick={() => setSelectedId(conv.id)}
              />
            ))}
          </div>

          <div className="px-4 py-2 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center">
              {conversations.length} conversa{conversations.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* ── Thread de mensagens ── */}
        <div className="flex-1 bg-white rounded-2xl shadow flex flex-col overflow-hidden">
          {!selectedId ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                title="Nenhuma conversa selecionada"
                description="Clique em um contato na lista para ver o histórico de mensagens."
              />
            </div>
          ) : (
            <>
              {/* Cabeçalho da conversa */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-900 font-bold text-lg shrink-0">
                  {(selectedConv?.lead?.name || "?")[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">
                    {selectedConv?.lead?.name || "Contato"}
                  </p>
                  <p className="text-xs text-slate-400">{selectedConv?.lead?.phone}</p>
                </div>
                <div className="ml-auto shrink-0">
                  <Badge color={selectedConv?.status === "OPEN" ? "green" : "gray"}>
                    {selectedConv?.status === "OPEN" ? "Aberta" : "Fechada"}
                  </Badge>
                </div>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                {loadingMsgs && messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm mt-16">
                    Nenhuma mensagem nesta conversa.
                  </p>
                ) : (
                  messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Barra de ações do rascunho */}
              {hasDraft && (
                <div className="px-4 py-3 border-t border-amber-100 bg-amber-50 flex items-center gap-3 shrink-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-amber-700 font-medium">
                      Rascunho da IA pronto para revisão
                    </p>
                    {sendError && (
                      <p className="text-xs text-red-500 mt-0.5">{sendError}</p>
                    )}
                  </div>
                  <button
                    disabled
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-200 text-slate-400 cursor-not-allowed shrink-0"
                    title="Disponível em breve"
                  >
                    Regenerar IA
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!!sendingId}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors shrink-0 flex items-center gap-2 ${
                      sendingId
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-blue-900 text-white hover:bg-blue-800"
                    }`}
                  >
                    {sendingId ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar"
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default WhatsApp;
