import { useState } from "react";
import Layout from "../components/Layout";
import Toast from "../components/Toast";

function Configuracoes() {
  const [showToast, setShowToast] = useState(false);

  function salvarConfiguracoes() {
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  }

  return (
    <Layout active="configuracoes">
      {showToast && (
        <Toast
          type="success"
          message="Configurações salvas com sucesso!"
        />
      )}

      <h2 className="text-4xl font-bold text-blue-950 mb-2">
        Configurações
      </h2>

      <p className="text-slate-600 mb-8">
        Configure os dados da empresa, IA, WhatsApp e automações.
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-2xl font-bold text-blue-950 mb-6">
            Dados da empresa
          </h3>

          <div className="space-y-4">
            <input className="w-full border p-3 rounded-xl" placeholder="Nome da empresa" />
            <input className="w-full border p-3 rounded-xl" placeholder="Segmento" />
            <input className="w-full border p-3 rounded-xl" placeholder="Cidade" />
            <input className="w-full border p-3 rounded-xl" placeholder="WhatsApp principal" />
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-2xl font-bold text-blue-950 mb-6">
            Configuração da IA
          </h3>

          <div className="space-y-4">
            <input
              className="w-full border p-3 rounded-xl"
              placeholder="Modelo da IA"
              defaultValue="gpt-4o-mini"
            />

            <input
              className="w-full border p-3 rounded-xl"
              placeholder="Temperatura"
              defaultValue="0.4"
            />

            <textarea
              className="w-full border p-3 rounded-xl min-h-32"
              placeholder="Prompt principal da IA"
              defaultValue="Você é uma recepcionista virtual inteligente. Atenda com educação, colete informações e encaminhe quando necessário."
            />
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-2xl font-bold text-blue-950 mb-6">
            Integrações
          </h3>

          <div className="space-y-4">
            <input className="w-full border p-3 rounded-xl" placeholder="Webhook n8n" />
            <input className="w-full border p-3 rounded-xl" placeholder="Google Calendar ID" />
            <input className="w-full border p-3 rounded-xl" placeholder="Phone Number ID WhatsApp" />
            <input className="w-full border p-3 rounded-xl" placeholder="WhatsApp Business Account ID" />
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-2xl font-bold text-blue-950 mb-6">
            Horário de atendimento
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <input
              className="border p-3 rounded-xl"
              placeholder="Segunda a sexta - início"
              defaultValue="08:00"
            />

            <input
              className="border p-3 rounded-xl"
              placeholder="Segunda a sexta - fim"
              defaultValue="18:00"
            />

            <input
              className="border p-3 rounded-xl"
              placeholder="Sábado - início"
              defaultValue="08:00"
            />

            <input
              className="border p-3 rounded-xl"
              placeholder="Sábado - fim"
              defaultValue="12:00"
            />
          </div>
        </section>
      </div>

      <button
        onClick={salvarConfiguracoes}
        className="mt-8 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold"
      >
        Salvar Configurações
      </button>
    </Layout>
  );
}

export default Configuracoes;