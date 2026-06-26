import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import PageTitle from "../components/PageTitle";
import StatCard from "../components/StatCard";
import Badge from "../components/Badge";
import SearchBar from "../components/SearchBar";
import DataTable from "../components/DataTable";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import { useLeads } from "../hooks/useLeads";
import { getStatusColor } from "../utils/getStatusColor";
import { STATUS_LABEL } from "../utils/leadUtils";

function CRM() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { leads, meta, stats, loading, error } = useLeads({
    search,
    page: currentPage,
    perPage: 10,
  });

  function handleSearch(e) {
    setSearch(e.target.value);
    setCurrentPage(1);
  }

  return (
    <Layout active="crm">
      <div className="flex justify-between items-center mb-8">
        <PageTitle
          title="CRM"
          subtitle="Gerencie leads, oportunidades e clientes."
        />
        <Link
          to="/novo-lead"
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold"
        >
          Novo Lead
        </Link>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <StatCard title="Novos leads" value={stats?.NOVO ?? "—"} />
        <StatCard title="Demonstrações" value={stats?.DEMONSTRACAO ?? "—"} />
        <StatCard title="Propostas" value={stats?.PROPOSTA ?? "—"} color="text-orange-500" />
        <StatCard title="Clientes ativos" value={stats?.CLIENTE_ATIVO ?? "—"} color="text-green-600" />
      </div>

      <div className="mb-6">
        <SearchBar
          placeholder="Pesquisar lead, empresa ou segmento..."
          value={search}
          onChange={handleSearch}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <DataTable
        title="Lista de leads"
        headers={["Nome", "Telefone", "Empresa", "Segmento", "Status", "Ações"]}
      >
        {loading ? (
          <tr>
            <td colSpan="6" className="py-10 text-center text-slate-400">
              <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto" />
            </td>
          </tr>
        ) : leads.length === 0 ? (
          <tr>
            <td colSpan="6" className="py-6">
              <EmptyState
                title="Nenhum lead encontrado"
                description={search ? "Tente outro termo de pesquisa." : "Cadastre o primeiro lead."}
              />
            </td>
          </tr>
        ) : (
          leads.map((lead) => (
            <tr key={lead.id} className="border-b">
              <td className="py-3">{lead.name}</td>
              <td className="py-3">{lead.phone}</td>
              <td className="py-3">{lead.company ?? "—"}</td>
              <td className="py-3">{lead.segment ?? "—"}</td>
              <td className="py-3">
                <Badge color={getStatusColor(lead.status)}>
                  {STATUS_LABEL[lead.status] ?? lead.status}
                </Badge>
              </td>
              <td className="py-3">
                <Link
                  to={`/lead/${lead.id}`}
                  className="bg-blue-900 text-white px-4 py-2 rounded-lg mr-2 inline-block"
                >
                  Ver
                </Link>
                <Link
                  to={`/editarlead/${lead.id}`}
                  className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg inline-block"
                >
                  Editar
                </Link>
              </td>
            </tr>
          ))
        )}
      </DataTable>

      {!loading && meta && meta.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={meta.totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </Layout>
  );
}

export default CRM;
