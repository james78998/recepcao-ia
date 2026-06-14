import React, { useState } from "react";
import { Link } from "react-router-dom";
import Pagination from "../components/Pagination";
import Layout from "../components/Layout";
import PageTitle from "../components/PageTitle";
import StatCard from "../components/StatCard";
import Badge from "../components/Badge";
import SearchBar from "../components/SearchBar";
import DataTable from "../components/DataTable";
import { leads } from "../data/leads";

function CRM() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const leadsPerPage = 5;

  function getStatusColor(status) {
    if (status === "Novo lead") return "green";
    if (status === "Demonstração") return "blue";
    if (status === "Proposta") return "orange";
    if (status === "Cliente ativo") return "purple";
    return "gray";
  }

  const filteredLeads = leads.filter(
    (lead) =>
      lead.nome.toLowerCase().includes(search.toLowerCase()) ||
      lead.empresa.toLowerCase().includes(search.toLowerCase()) ||
      lead.segmento.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

  const startIndex = (currentPage - 1) * leadsPerPage;
  const currentLeads = filteredLeads.slice(
    startIndex,
    startIndex + leadsPerPage
  );

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
        <StatCard title="Novos leads" value="18" />
        <StatCard title="Demonstrações" value="7" />
        <StatCard title="Propostas" value="3" color="text-orange-500" />
        <StatCard title="Clientes ativos" value="2" color="text-green-600" />
      </div>

      <div className="mb-6">
        <SearchBar
          placeholder="Pesquisar lead, empresa ou segmento..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <DataTable
        title="Lista de leads"
        headers={["Nome", "WhatsApp", "Empresa", "Segmento", "Status", "Ações"]}
      >
        {currentLeads.map((lead, index) => (
          <tr key={index} className="border-b">
            <td className="py-3">{lead.nome}</td>
            <td className="py-3">{lead.whatsapp}</td>
            <td className="py-3">{lead.empresa}</td>
            <td className="py-3">{lead.segmento}</td>
            <td className="py-3">
              <Badge color={getStatusColor(lead.status)}>
                {lead.status}
              </Badge>
            </td>
            <td className="py-3">
              <Link
                to={`/lead/${startIndex + index + 1}`}
                className="bg-blue-900 text-white px-4 py-2 rounded-lg mr-2 inline-block"
              >
                Ver
              </Link>

              <Link
  to={`/editar-lead/${lead.id}`}
  className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg"
>
  Editar
</Link>
            </td>
          </tr>
        ))}

        {currentLeads.length === 0 && (
          <tr>
            <td colSpan="6" className="py-6 text-center text-slate-500">
              Nenhum lead encontrado.
            </td>
          </tr>
        )}
      </DataTable>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </Layout>
  );
}

export default CRM;