import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import PageTitle from "../components/PageTitle";
import StatCard from "../components/StatCard";
import Badge from "../components/Badge";
import { useAuth } from "../hooks/useAuth";
import { useLeads } from "../hooks/useLeads";
import { getStatusColor } from "../utils/getStatusColor";
import { STATUS_LABEL } from "../utils/leadUtils";

function Dashboard() {
  const { user } = useAuth();
  const { leads, meta, loading } = useLeads({ perPage: 3 });

  const firstName = user?.name?.split(' ')[0] ?? '';
  const greeting = firstName ? `Bem-vindo, ${firstName}!` : 'Bem-vindo ao painel da Recepção IA.';

  return (
    <Layout active="dashboard">
      <PageTitle title="Dashboard" subtitle={greeting} />

      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total de leads" value={loading ? '—' : (meta?.total ?? 0)} />
        <StatCard title="Mensagens" value="—" />
        <StatCard title="Agendamentos" value="—" />
        <StatCard title="Status da IA" value="ONLINE" color="text-green-600" />
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-2xl font-bold text-blue-950 mb-6">
          Últimos leads
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-3">Nome</th>
                <th className="py-3">Empresa</th>
                <th className="py-3">Segmento</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-400">
                    <div className="w-6 h-6 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-400">
                    Nenhum lead cadastrado ainda.{' '}
                    <Link to="/novo-lead" className="text-blue-900 font-bold hover:underline">
                      Cadastrar primeiro lead
                    </Link>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="border-b">
                    <td className="py-3">
                      <Link
                        to={`/lead/${lead.id}`}
                        className="text-blue-900 font-bold hover:underline"
                      >
                        {lead.name}
                      </Link>
                    </td>
                    <td className="py-3">{lead.company ?? '—'}</td>
                    <td className="py-3">{lead.segment ?? '—'}</td>
                    <td className="py-3">
                      <Badge color={getStatusColor(lead.status)}>
                        {STATUS_LABEL[lead.status] ?? lead.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && leads.length > 0 && (
          <div className="mt-4 text-right">
            <Link to="/crm" className="text-blue-900 font-bold hover:underline text-sm">
              Ver todos os leads →
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Dashboard;
