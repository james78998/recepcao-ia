import Layout from "../components/Layout";
import PageTitle from "../components/PageTitle";
import StatCard from "../components/StatCard";

function CRM() {
  const leads = [
    {
      nome: "João Silva",
      whatsapp: "11 99999-9999",
      empresa: "Clínica Sorriso",
      segmento: "Odontologia",
      status: "Novo lead",
    },
    {
      nome: "Maria Santos",
      whatsapp: "11 98888-8888",
      empresa: "Bella Estética",
      segmento: "Estética",
      status: "Demonstração",
    },
    {
      nome: "Carlos Lima",
      whatsapp: "11 97777-7777",
      empresa: "Lima Advocacia",
      segmento: "Advocacia",
      status: "Proposta",
    },
  ];

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

        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-2xl font-bold text-blue-950 mb-6">
            Lista de leads
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-3">Nome</th>
                  <th className="py-3">WhatsApp</th>
                  <th className="py-3">Empresa</th>
                  <th className="py-3">Segmento</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Ações</th>
                </tr>
              </thead>

              <tbody>
                {leads.map((lead, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3">{lead.nome}</td>
                    <td className="py-3">{lead.whatsapp}</td>
                    <td className="py-3">{lead.empresa}</td>
                    <td className="py-3">{lead.segmento}</td>
                    <td className="py-3 font-bold text-blue-700">
                      {lead.status}
                    </td>
                    <td className="py-3">
                      <button className="bg-blue-900 text-white px-4 py-2 rounded-lg mr-2">
                        <a
  href={`/lead/${index + 1}`}
  className="bg-blue-900 text-white px-4 py-2 rounded-lg mr-2"
>
  Ver
</a>
                      </button>
                      <button className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg">
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    </Layout>
  );
}

export default CRM;