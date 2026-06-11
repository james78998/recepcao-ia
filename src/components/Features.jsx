function Features() {
  const features = [
    ["Atendimento 24h", "Responde clientes automaticamente a qualquer horário."],
    ["WhatsApp inteligente", "Atende, coleta dados e encaminha para sua equipe."],
    ["Agendamento automático", "Ajuda o cliente a escolher data e horário disponíveis."],
    ["Confirmação de consultas", "Envia lembretes e reduz faltas nos atendimentos."],
  ];

  return (
    <section id="recursos" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-blue-950 mb-14">
          O que a Recepção IA faz por sua empresa?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(([title, text], index) => (
            <div key={index} className="bg-slate-50 border border-slate-200 rounded-2xl p-7 shadow-sm hover:shadow-xl transition">
              <h3 className="text-xl font-bold text-blue-900 mb-3">{title}</h3>
              <p className="text-slate-600 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;