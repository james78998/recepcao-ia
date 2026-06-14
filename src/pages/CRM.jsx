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

    <Pagination
  currentPage={currentPage}
  totalPages={5}
  onPageChange={setCurrentPage}
/>

  const filteredLeads = leads.filter(
    (lead) =>
      lead.nome.toLowerCase().includes(search.toLowerCase()) ||
      lead.empresa.toLowerCase().includes(search.toLowerCase()) ||
      lead.segmento.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout active="crm">
      <div className="flex justify-between items-center mb-8">
        <PageTitle
          title="CRM"
          subtitle="Gerencie leads, oportunidades e clientes."
        />

        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold">
          Novo Lead
        </button>
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
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataTable
        title="Lista de leads"
        headers={["Nome", "WhatsApp", "Empresa", "Segmento", "Status", "Ações"]}
      >
        {filteredLeads.map((lead, index) => (
          <tr key={index} className="border-b">
            <td className="py-3">{lead.nome}</td>
            <td className="py-3">{lead.whatsapp}</td>
            <td className="py-3">{lead.empresa}</td>
            <td className="py-3">{lead.segmento}</td>
            <td className="py-3">
              <Badge
                color={
                  lead.status === "Novo lead"
                    ? "green"
                    : lead.status === "Demonstração"
                    ? "blue"
                    : lead.status === "Proposta"
                    ? "orange"
                    : "gray"
                }
              >
                {lead.status}
              </Badge>
            </td>
            <td className="py-3">
              <Link
                to={`/lead/${index + 1}`}
                className="bg-blue-900 text-white px-4 py-2 rounded-lg mr-2 inline-block"
              >
                Ver
              </Link>

              <button className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg">
                Editar
              </button>
            </td>
          </tr>
        ))}

        {filteredLeads.length === 0 && (
          <tr>
            <td colSpan="6" className="py-6 text-center text-slate-500">
              Nenhum lead encontrado.
            </td>
          </tr>
        )}
      </DataTable>
    </Layout>
  );
}

export default CRM;