import Badge from "../Badge";

const STATUS_MAP = {
  NOT_CONNECTED: { label: "Não conectado", color: "gray" },
  CONNECTED: { label: "Conectado", color: "green" },
  ERROR: { label: "Erro", color: "red" },
  EXPIRED: { label: "Expirado", color: "orange" },
};

function IntegrationStatusBadge({ status }) {
  const { label, color } = STATUS_MAP[status] ?? STATUS_MAP.NOT_CONNECTED;
  return <Badge color={color}>{label}</Badge>;
}

export default IntegrationStatusBadge;
