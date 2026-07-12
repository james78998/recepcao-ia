import { useState } from "react";
import Card from "../Card";
import Button from "../Button";
import IntegrationStatusBadge from "./IntegrationStatusBadge";
import { getGoogleCalendarAuthUrl } from "../../services/googleCalendarService";

// Diferente do IntegrationCard genérico (usado por Dental Office): Google
// Calendar usa OAuth real — não há credencial para colar manualmente, então
// "Conectar" redireciona para a tela de consentimento do Google.
function GoogleCalendarIntegrationCard({ integration, onDisconnect, saving }) {
  const [redirecting, setRedirecting] = useState(false);
  const status = integration?.status ?? "NOT_CONNECTED";
  const connected = status === "CONNECTED";

  async function handleConnect() {
    setRedirecting(true);
    try {
      const { url } = await getGoogleCalendarAuthUrl();
      window.location.href = url;
    } catch {
      setRedirecting(false);
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-bold text-blue-950">Google Calendar</h4>
          <p className="text-sm text-slate-500">Sincronize agendamentos automaticamente.</p>
        </div>
        <IntegrationStatusBadge status={status} />
      </div>

      <div className="flex gap-3">
        {connected ? (
          <Button type="button" color="red" disabled={saving} onClick={onDisconnect}>
            Desconectar
          </Button>
        ) : (
          <Button type="button" color="blue" disabled={saving || redirecting} onClick={handleConnect}>
            {redirecting ? "Redirecionando..." : "Conectar com Google"}
          </Button>
        )}
      </div>
    </Card>
  );
}

export default GoogleCalendarIntegrationCard;
