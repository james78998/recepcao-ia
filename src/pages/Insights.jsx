import Layout from "../components/Layout";
import PageTitle from "../components/PageTitle";

function Insights() {
  return (
    <Layout active="insights">
      <PageTitle title="IA Insights" />
      
        <div className="grid lg:grid-cols-2 gap-6">

          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-2xl font-bold mb-4">
              Score de fechamento
            </h3>

            <div className="w-full bg-slate-200 rounded-full h-6">
              <div className="bg-green-500 h-6 rounded-full w-3/4"></div>
            </div>

            <p className="text-4xl font-bold text-green-600 mt-4">
              78%
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-2xl font-bold mb-4">
              Sentimento
            </h3>

            <p className="text-4xl">
              😊
            </p>

            <p className="text-xl mt-3">
              Positivo
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 lg:col-span-2">

            <h3 className="text-2xl font-bold mb-4">
              Resumo da IA
            </h3>

            <p className="text-slate-700 leading-8">
              O cliente possui uma clínica odontológica,
              recebe aproximadamente 30 mensagens por dia
              e demonstrou forte interesse em automatizar
              o atendimento pelo WhatsApp.
            </p>

          </div>

          <div className="bg-white rounded-2xl shadow p-6">

            <h3 className="text-2xl font-bold mb-4">
              Próxima ação sugerida
            </h3>

            <p>
              ✓ Agendar demonstração ainda hoje.
            </p>

          </div>

          <div className="bg-white rounded-2xl shadow p-6">

            <h3 className="text-2xl font-bold mb-4">
              Oportunidade
            </h3>

            <p>Plano sugerido:</p>

            <h4 className="text-3xl font-bold text-blue-900">
              Profissional
            </h4>

            <p className="mt-3">
              Receita potencial:
            </p>

            <h4 className="text-3xl font-bold text-green-600">
              R$ 497/mês
            </h4>

          </div>

        </div>

    </Layout>
  );
}

export default Insights;