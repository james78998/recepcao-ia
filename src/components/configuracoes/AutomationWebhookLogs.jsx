import DataTable from "../DataTable";
import Pagination from "../Pagination";
import Button from "../Button";
import { useAutomationWebhookLogs } from "../../hooks/useAutomationWebhookLogs";

const FILTERS = [
  { value: "all", label: "Todos" },
  { value: "success", label: "Sucesso" },
  { value: "failure", label: "Falha" },
];

function AutomationWebhookLogs({ webhookId }) {
  const { data, meta, page, setPage, filter, setFilter, loading, error } = useAutomationWebhookLogs(webhookId);

  return (
    <div className="mt-4 pt-4 border-t">
      <div className="flex gap-2 mb-4">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            type="button"
            color={filter === f.value ? "blue" : "gray"}
            className="px-4 py-2 text-sm"
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {loading && <p className="text-slate-500">Carregando logs...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && data.length === 0 && (
        <p className="text-slate-500">Nenhum disparo registrado ainda.</p>
      )}

      {!loading && !error && data.length > 0 && (
        <>
          {/* whitespace-nowrap nas células força o navegador a dimensionar as
              colunas pelo conteúdo, engatando o overflow-x-auto do DataTable
              em vez de espremer e quebrar linha dos cabeçalhos. */}
          <DataTable headers={["Evento", "Tentativa", "Status HTTP", "Sucesso", "Erro", "Duração", "Data"]}>
            {data.map((log) => (
              <tr key={log.id} className="border-b last:border-0">
                <td className="py-2 pr-4 whitespace-nowrap">{log.event}</td>
                <td className="py-2 pr-4 whitespace-nowrap">{log.attempt}</td>
                <td className="py-2 pr-4 whitespace-nowrap">{log.httpStatus ?? "—"}</td>
                <td className="py-2 pr-4 whitespace-nowrap">{log.success ? "Sim" : "Não"}</td>
                <td className="py-2 pr-4 whitespace-nowrap max-w-xs truncate" title={log.errorMessage ?? ""}>
                  {log.errorMessage ?? "—"}
                </td>
                <td className="py-2 pr-4 whitespace-nowrap">{log.durationMs != null ? `${log.durationMs}ms` : "—"}</td>
                <td className="py-2 pr-4 whitespace-nowrap">{new Date(log.createdAt).toLocaleString("pt-BR")}</td>
              </tr>
            ))}
          </DataTable>

          {meta && meta.totalPages > 1 && (
            <Pagination currentPage={page} totalPages={meta.totalPages} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}

export default AutomationWebhookLogs;
