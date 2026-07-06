import Card from "../Card";

function StatItem({ label, value }) {
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-blue-950">{value}</p>
    </div>
  );
}

function AutomationStatsPanel({ stats, loading }) {
  if (loading) {
    return (
      <Card className="mb-6">
        <p className="text-slate-500">Carregando estatísticas...</p>
      </Card>
    );
  }

  if (!stats) return null;

  const successRateLabel = stats.successRate === null ? "—" : `${Math.round(stats.successRate * 100)}%`;

  return (
    <Card className="mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatItem label="Webhooks ativos" value={stats.activeWebhooks} />
        <StatItem label="Eventos (24h)" value={stats.eventsLast24h} />
        <StatItem label="Taxa de sucesso (24h)" value={successRateLabel} />
        <StatItem label="Falhas (24h)" value={stats.failuresLast24h} />
      </div>
    </Card>
  );
}

export default AutomationStatsPanel;
