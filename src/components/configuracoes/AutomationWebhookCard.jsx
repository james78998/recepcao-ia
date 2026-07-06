import { useState } from "react";
import Card from "../Card";
import Badge from "../Badge";
import Button from "../Button";
import Modal from "../Modal";
import AutomationWebhookLogs from "./AutomationWebhookLogs";
import { AUTOMATION_EVENT_LABELS } from "../../constants/automationEvents";

function AutomationWebhookCard({ webhook, onEdit, onDelete, onTest, onRegenerateSecret, busy }) {
  const [showLogs, setShowLogs] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <h4 className="text-lg font-bold text-blue-950">{webhook.name}</h4>
          <p className="text-sm text-slate-500 break-all">{webhook.url}</p>
        </div>
        <Badge color={webhook.enabled ? "green" : "gray"}>{webhook.enabled ? "Ativo" : "Inativo"}</Badge>
      </div>

      <div className="flex flex-wrap gap-2 my-3">
        {webhook.events.map((event) => (
          <Badge key={event} color="blue">
            {AUTOMATION_EVENT_LABELS[event] ?? event}
          </Badge>
        ))}
      </div>

      {webhook.lastError && (
        <p className="text-sm text-red-600 mb-2">Último erro: {webhook.lastError}</p>
      )}
      {webhook.lastSuccessAt && (
        <p className="text-sm text-slate-500 mb-2">
          Último sucesso: {new Date(webhook.lastSuccessAt).toLocaleString("pt-BR")}
        </p>
      )}

      {/* Ordem fixa: Testar, Logs, Editar, Regenerar Secret, Excluir */}
      <div className="flex flex-wrap gap-2 mt-4">
        <Button type="button" color="blue" disabled={busy} onClick={() => onTest(webhook)}>
          {busy ? "Aguarde..." : "Testar"}
        </Button>
        <Button type="button" color="gray" onClick={() => setShowLogs((v) => !v)}>
          {showLogs ? "Ocultar logs" : "Logs"}
        </Button>
        <Button type="button" color="gray" disabled={busy} onClick={() => onEdit(webhook)}>
          Editar
        </Button>
        <Button type="button" color="gray" disabled={busy} onClick={() => setShowRegenModal(true)}>
          Regenerar Secret
        </Button>
        <Button type="button" color="red" disabled={busy} onClick={() => setShowDeleteModal(true)}>
          Excluir
        </Button>
      </div>

      {showLogs && <AutomationWebhookLogs webhookId={webhook.id} />}

      <Modal
        isOpen={showDeleteModal}
        title="Excluir Webhook"
        message={`Tem certeza que deseja excluir o webhook "${webhook.name}"? Ele para de disparar imediatamente.`}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          onDelete(webhook);
        }}
      />

      <Modal
        isOpen={showRegenModal}
        title="Regenerar Secret"
        message="O secret atual será invalidado imediatamente. Sistemas que já usam o secret antigo vão falhar na validação até você atualizá-los. Continuar?"
        onClose={() => setShowRegenModal(false)}
        onConfirm={() => {
          setShowRegenModal(false);
          onRegenerateSecret(webhook);
        }}
      />
    </Card>
  );
}

export default AutomationWebhookCard;
