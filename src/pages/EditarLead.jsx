import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import PageTitle from "../components/PageTitle";
import { leads } from "../data/leads";

function EditarLead() {
  const navigate = useNavigate();
  const { id } = useParams();

  const lead = leads.find((item) => item.id === Number(id));

  if (!lead) {
    return (
      <Layout active="crm">
        <PageTitle
          title="Lead não encontrado"
          subtitle="O lead solicitado não existe."
        />

        <button
          onClick={() => navigate("/crm")}
          className="bg-blue-900 text-white px-6 py-3 rounded-xl font-bold"
        >
          Voltar para CRM
        </button>
      </Layout>
    );
  }

  return (
    <Layout active="crm">
      <PageTitle
        title="Editar Lead"
        subtitle="Atualize as informações do lead."
      />

      <div className="bg-white rounded-2xl shadow p-6 max-w-3xl">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            className="border p-3 rounded-xl"
            defaultValue={lead.nome}
            placeholder="Nome"
          />

          <input
            className="border p-3 rounded-xl"
            defaultValue={lead.whatsapp}
            placeholder="WhatsApp"
          />

          <input
            className="border p-3 rounded-xl"
            defaultValue={lead.empresa}
            placeholder="Empresa"
          />

          <input
            className="border p-3 rounded-xl"
            defaultValue={lead.segmento}
            placeholder="Segmento"
          />

          <select
            className="border p-3 rounded-xl md:col-span-2"
            defaultValue={lead.status}
          >
            <option>Novo lead</option>
            <option>Demonstração</option>
            <option>Proposta</option>
            <option>Cliente</option>
          </select>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={() => {
              alert("Lead atualizado com sucesso!");
              navigate("/crm");
            }}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold"
          >
            Salvar alterações
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

export default EditarLead;