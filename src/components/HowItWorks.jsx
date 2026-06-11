function HowItWorks() {
  const steps = [
    ["Cliente envia mensagem", "O atendimento começa pelo WhatsApp."],
    ["Recepção IA atende", "A IA responde e coleta as informações."],
    ["Agenda automaticamente", "Consulta horários e organiza o atendimento."],
    ["Confirma a consulta", "Reduz faltas e melhora a produtividade."],
  ];

  return (
    <section className="py-24 px-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-blue-950 mb-14">
          Como funciona?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(([title, text], index) => (
            <div key={index} className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold mb-5">
                {index + 1}
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">{title}</h3>
              <p className="text-slate-600 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;