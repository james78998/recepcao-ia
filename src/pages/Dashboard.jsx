import Layout from "../components/Layout";
import PageTitle from "../components/PageTitle";
import StatCard from "../components/StatCard";
import { leads } from "../data/leads";
import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <Layout active="dashboard">
     
        <PageTitle
  title="Dashboard"
  subtitle="Bem-vindo ao painel da Recepção IA."
/>
    <div className="grid md:grid-cols-4 gap-6 mb-10">
  <StatCard title="Leads hoje" value="12" />
  <StatCard title="Mensagens" value="38" />
  <StatCard title="Agendamentos" value="9" />
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
              <tr className="border-b">
                <td className="py-3">
  <Link
    to="/lead/1"
    className="text-blue-900 font-bold hover:underline"
  >
    João Silva
  </Link>
</td>
                <td className="py-3">Clínica Sorriso</td>
                <td className="py-3">Odontologia</td>
                <td className="py-3 text-green-600 font-bold">Novo lead</td>
              </tr>

              <tr className="border-b">
                <td className="py-3">
  <Link
    to="/lead/2"
    className="text-blue-900 font-bold hover:underline"
  >
    Maria Santos
  </Link>
</td>
                <td className="py-3">Bella Estética</td>
                <td className="py-3">Estética</td>
                <td className="py-3 text-blue-600 font-bold">Demonstração</td>
              </tr>

              <tr>
                <td className="py-3">
  <Link
    to="/lead/3"
    className="text-blue-900 font-bold hover:underline"
  >
    Carlos Lima
  </Link>
</td>
                <td className="py-3">Lima Advocacia</td>
                <td className="py-3">Advocacia</td>
                <td className="py-3 text-orange-600 font-bold">Proposta</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;