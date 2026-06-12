import React, { useState } from "react";
import Layout from "../components/Layout";

function LeadDetails() {
  const [showToast, setShowToast] = useState(false);

  return (
    <Layout active="crm">
      {showToast && (
        <div className="fixed top-5 right-5 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50">
          Lead movido para demonstração!
        </div>
      )}

      <main className="flex-1 p-8">
        <a href="/crm" className="text-blue-900 font-bold">
          ← Voltar para CRM
        </a>

        <div className="mt-6 mb-8">
          <h2 className="text-4xl font-bold text-blue-950">João Silva</h2>
          <p className="text-slate-600 mt-2">
            Lead captado automaticamente pela Recepção IA.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
            <h3 className="text-2xl font-bold text-blue-950 mb-6">
              Histórico de atendimento
            </h3>

            <div className="space-y-4">
              <div className="bg-slate-100 p-4 rounded-xl">
                <p className="font-bold">Cliente - 10:30</p>
                <p>Olá, gostaria de automatizar o atendimento da minha clínica.</p>
              </div>

              <div className="bg-green-100 p-4 rounded-xl">
                <p className="font-bold">Recepção IA - 10:31</p>
                <p>
                  Olá! Será um prazer ajudar. Qual é o nome da sua empresa e
                  quantos atendimentos recebe por dia?
                </p>
              </div>

              <div className="bg-slate-100 p-4 rounded-xl">
                <p className="font-bold">Cliente - 10:35</p>
                <p>
                  Minha empresa é a Clínica Sorriso e recebemos cerca de 30
                  mensagens por dia.
                </p>
              </div>

              <div className="bg-green-100 p-4 rounded-xl">
                <p className="font-bold">Recepção IA - 10:36</p>
                <p>
                  Perfeito! Posso agendar uma demonstração para mostrar como a IA
                  pode atender e organizar seus leads?
                </p>
              </div>
            </div>
          </section>

          <aside className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-2xl font-bold text-blue-950 mb-6">
              Dados do lead
            </h3>

            <div className="space-y-4 text-slate-700">
              <p><strong>Nome:</strong> João Silva</p>
              <p><strong>Empresa:</strong> Clínica Sorriso</p>
              <p><strong>WhatsApp:</strong> 11 99999-9999</p>
              <p><strong>Segmento:</strong> Odontologia</p>
              <p><strong>Status:</strong> Novo lead</p>
              <p><strong>Origem:</strong> WhatsApp</p>
            </div>

            <div className="mt-8 space-y-3">
              <button className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold">
                Enviar WhatsApp
              </button>

              <button
                onClick={() => setShowToast(true)}
                className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold"
              >
                Mover para Demonstração
              </button>

              <button className="w-full bg-slate-200 text-slate-800 py-3 rounded-xl font-bold">
                Editar Lead
              </button>
            </div>
          </aside>
        </div>
      </main>
    </Layout>
  );
}

export default LeadDetails;