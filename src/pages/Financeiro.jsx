import Layout from "../components/Layout";
import PageTitle from "../components/PageTitle";
import StatCard from "../components/StatCard";

function Financeiro() {
  const pagamentos = [
    {
      data: "15/06/2026",
      plano: "Profissional",
      valor: "R$ 497,00",
      status: "Pago",
    },
    {
      data: "15/05/2026",
      plano: "Profissional",
      valor: "R$ 497,00",
      status: "Pago",
    },
    {
      data: "15/04/2026",
      plano: "Starter",
      valor: "R$ 297,00",
      status: "Pago",
    },
  ];


      return (
  <Layout active="financeiro">
    <PageTitle
      title="Financeiro"
      subtitle="Gerencie planos, cobranças e consumo da plataforma."
    />

    <div className="grid lg:grid-cols-4 gap-6 mb-8">
      <StatCard title="Plano atual" value="Profissional" />
      <StatCard title="Mensalidade" value="R$ 497" color="text-green-600" />
      <StatCard title="Próxima cobrança" value="15/07/2026" />
      <StatCard title="Status" value="Ativo" color="text-green-600" />
    </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <section className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-2xl font-bold text-blue-950 mb-6">
              Consumo da plataforma
            </h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Mensagens WhatsApp</span>
                  <span>1.250 / 5.000</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-4">
                  <div className="bg-blue-900 h-4 rounded-full w-1/4"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span>Tokens IA</span>
                  <span>250.000 / 1.000.000</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-4">
                  <div className="bg-emerald-500 h-4 rounded-full w-1/4"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span>Agendamentos</span>
                  <span>80 / 300</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-4">
                  <div className="bg-orange-500 h-4 rounded-full w-1/3"></div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-2xl font-bold text-blue-950 mb-6">
              Ações rápidas
            </h3>

            <div className="space-y-4">
              <button className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold">
                Alterar plano
              </button>

              <button className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold">
                Baixar boleto
              </button>

              <button className="w-full bg-slate-200 text-slate-800 py-3 rounded-xl font-bold">
                Atualizar forma de pagamento
              </button>
            </div>
          </section>
        </div>

        <section className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-2xl font-bold text-blue-950 mb-6">
            Histórico de pagamentos
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-3">Data</th>
                  <th className="py-3">Plano</th>
                  <th className="py-3">Valor</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {pagamentos.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3">{item.data}</td>
                    <td className="py-3">{item.plano}</td>
                    <td className="py-3">{item.valor}</td>
                    <td className="py-3 text-green-600 font-bold">
                      {item.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
    </Layout>
  );
}

export default Financeiro;