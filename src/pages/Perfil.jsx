import Layout from "../components/Layout";
function Perfil() {
  return (
    <Layout active="perfil">

      <main className="flex-1 p-8">
        <h2 className="text-4xl font-bold text-blue-950 mb-2">
          Perfil da Conta
        </h2>

        <p className="text-slate-600 mb-8">
          Gerencie seus dados, empresa e segurança.
        </p>

        <div className="grid lg:grid-cols-3 gap-6">
          <section className="bg-white rounded-2xl shadow p-6">
            <div className="w-28 h-28 rounded-full bg-blue-900 text-white flex items-center justify-center text-4xl font-bold mb-6">
              JR
            </div>

            <h3 className="text-2xl font-bold text-blue-950">
              James Rodrigues
            </h3>

            <p className="text-slate-600 mt-1">
              Administrador
            </p>

            <p className="text-slate-600 mt-4">
              james@email.com
            </p>

            <button className="mt-6 bg-blue-900 text-white px-5 py-3 rounded-xl font-bold w-full">
              Alterar foto
            </button>
          </section>

          <section className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
            <h3 className="text-2xl font-bold text-blue-950 mb-6">
              Dados pessoais
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <input className="border p-3 rounded-xl" defaultValue="James Rodrigues" />
              <input className="border p-3 rounded-xl" defaultValue="Administrador" />
              <input className="border p-3 rounded-xl" defaultValue="james@email.com" />
              <input className="border p-3 rounded-xl" defaultValue="+55 11 99999-9999" />
            </div>
          </section>

          <section className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
            <h3 className="text-2xl font-bold text-blue-950 mb-6">
              Dados da empresa
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <input className="border p-3 rounded-xl" defaultValue="Recepção IA" />
              <input className="border p-3 rounded-xl" placeholder="CNPJ" />
              <input className="border p-3 rounded-xl" placeholder="Site" />
              <input className="border p-3 rounded-xl" placeholder="Cidade" />
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-2xl font-bold text-blue-950 mb-6">
              Plano atual
            </h3>

            <p className="text-slate-500">Plano</p>
            <h4 className="text-3xl font-bold text-blue-900 mb-4">
              Profissional
            </h4>

            <p className="text-slate-500">Renovação</p>
            <p className="text-xl font-bold text-green-600">
              15/07/2026
            </p>
          </section>

          <section className="bg-white rounded-2xl shadow p-6 lg:col-span-3">
            <h3 className="text-2xl font-bold text-blue-950 mb-6">
              Segurança
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
              <input type="password" className="border p-3 rounded-xl" placeholder="Senha atual" />
              <input type="password" className="border p-3 rounded-xl" placeholder="Nova senha" />
              <input type="password" className="border p-3 rounded-xl" placeholder="Confirmar nova senha" />
            </div>
          </section>
        </div>

        <div className="mt-8 flex gap-4">
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold">
            Salvar alterações
          </button>

          <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-bold">
            Sair da conta
          </button>
        </div>
      </main>
    </Layout>
  );
}

export default Perfil;