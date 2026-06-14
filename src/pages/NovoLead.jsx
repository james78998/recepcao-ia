import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import PageTitle from "../components/PageTitle";

function NovoLead() {
  const navigate = useNavigate();

  return (
    <Layout active="crm">
      <PageTitle
        title="Novo Lead"
        subtitle="Cadastre manualmente um novo lead no CRM."
      />

      <div className="bg-white rounded-2xl shadow p-6 max-w-3xl">
        <div className="grid md:grid-cols-2 gap-4">
          <input className="border p-3 rounded-xl" placeholder="Nome" />
          <input className="border p-3 rounded-xl" placeholder="WhatsApp" />
          <input className="border p-3 rounded-xl" placeholder="Empresa" />
          <input className="border p-3 rounded-xl" placeholder="Segmento" />

          <select className="border p-3 rounded-xl md:col-span-2">
            <option>Novo lead</option>
            <option>Demonstração</option>
            <option>Proposta</option>
            <option>Cliente</option>
          </select>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={() => {
              alert("Lead cadastrado com sucesso!");
              navigate("/crm");
            }}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold"
          >
            Salvar Lead
          </button>

          <button
            onClick={() => navigate("/crm")}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-8 py-3 rounded-xl font-bold"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default NovoLead;