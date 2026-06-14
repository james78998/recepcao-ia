function Demo() {
  return (
    <><section id="demonstracao" className="..."></section><section className="py-24 px-6 bg-slate-900 text-white">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">
          Veja a Recepção IA em ação
        </h2>

        <p className="text-slate-300 text-lg mb-12">
          Imagine seu cliente enviando uma mensagem pelo WhatsApp e recebendo atendimento imediato.
        </p>

        <div className="bg-white text-slate-900 rounded-3xl p-8 max-w-2xl mx-auto text-left shadow-xl">
          <div className="bg-slate-100 rounded-2xl p-5 mb-5">
            <strong>Cliente:</strong>
            <p className="mt-2">
              Olá, gostaria de agendar uma consulta.
            </p>
          </div>

          <div className="bg-green-100 rounded-2xl p-5">
            <strong>Recepção IA:</strong>
            <p className="mt-2">
              Olá! Será um prazer atendê-lo. Qual seu nome e qual procedimento deseja realizar?
            </p>
          </div>
        </div>

        <button className="mt-10 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold">
          Solicitar Demonstração
        </button>
      </div>
    </section></>
  );
}

export default Demo;