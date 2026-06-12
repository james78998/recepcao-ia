import Layout from "../components/Layout";
function WhatsApp() {
  return (
    <Layout active="WhatsApp">
   
      <main className="flex-1 p-8">
        <h2 className="text-4xl font-bold text-blue-950 mb-2">WhatsApp</h2>
        <p className="text-slate-600 mb-8">
          Gerencie a conexão com a API Oficial do WhatsApp.
        </p>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-slate-500">Status</p>
            <h3 className="text-3xl font-bold text-green-600 mt-2">Conectado</h3>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-slate-500">Número conectado</p>
            <h3 className="text-2xl font-bold text-blue-900 mt-2">+55 11 99999-9999</h3>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-slate-500">Mensagens hoje</p>
            <h3 className="text-3xl font-bold text-blue-900 mt-2">38</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mt-8">
          <h3 className="text-2xl font-bold text-blue-950 mb-6">
            Configuração da API
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <input className="border p-3 rounded-xl" placeholder="Phone Number ID" />
            <input className="border p-3 rounded-xl" placeholder="WhatsApp Business Account ID" />
            <input className="border p-3 rounded-xl" placeholder="Webhook URL do n8n" />
            <input className="border p-3 rounded-xl" placeholder="Token de verificação" />
          </div>

          <button className="mt-6 bg-blue-900 text-white px-6 py-3 rounded-xl font-bold">
            Salvar Configurações
          </button>
        </div>
      </main>
    </Layout>
  );
}

export default WhatsApp;