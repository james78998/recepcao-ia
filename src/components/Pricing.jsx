function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "R$ 297/mês",
      description: "Para começar com atendimento inteligente.",
      features: ["Atendimento automático", "WhatsApp integrado", "Suporte básico"],
      button: "Contratar",
    },
    {
      name: "Profissional",
      price: "R$ 497/mês",
      description: "Para clínicas que querem automatizar mais.",
      features: [
        "Tudo do Starter",
        "Agendamento automático",
        "Confirmação de consultas",
        "Integração com Google Agenda",
      ],
      button: "Mais recomendado",
    },
    {
      name: "Premium",
      price: "R$ 797/mês",
      description: "Para empresas que precisam de integrações avançadas.",
      features: [
        "Tudo do Profissional",
        "Integração com sistemas",
        "Relatórios",
        "Suporte prioritário",
      ],
      button: "Falar com especialista",
    },
  ];

  return (
    <><section id="planos" className="..."></section><section id="planos" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-blue-950 mb-14">
          Planos para sua empresa
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-2xl p-8 border shadow-sm ${index === 1
                  ? "border-green-500 bg-green-50 scale-105"
                  : "border-slate-200 bg-slate-50"}`}
            >
              <h3 className="text-2xl font-bold text-blue-900 mb-3">
                {plan.name}
              </h3>

              <p className="text-slate-600 mb-6">
                {plan.description}
              </p>

              <h4 className="text-3xl font-bold text-slate-900 mb-6">
                {plan.price}
              </h4>

              <div className="space-y-3 mb-8">
                {plan.features.map((item, i) => (
                  <p key={i} className="text-slate-700">
                    ✔ {item}
                  </p>
                ))}
              </div>

              <button className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-xl font-semibold">
                {plan.button}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section></>
  );
}

export default Pricing;