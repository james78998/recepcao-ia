function Footer() {
  return (
    <footer
      id="contato"
      className="bg-slate-950 text-white py-16 px-6"
    >
      <div className="max-w-7xl mx-auto">

        <h2 className="text-3xl font-bold mb-4">
          Recepção IA
        </h2>

        <p className="text-slate-400 mb-8 max-w-xl">
          Inteligência artificial para automatizar o atendimento,
          agendamentos e confirmações pelo WhatsApp.
        </p>

        <div className="flex gap-8 flex-wrap">

          <a href="#">
            WhatsApp
          </a>

          <a href="#">
            Instagram
          </a>

          <a href="#">
            LinkedIn
          </a>

          <a href="#">
            Contato
          </a>

        </div>

        <hr className="my-8 border-slate-800" />

        <p className="text-slate-500">
          © 2026 Recepção IA. Todos os direitos reservados.
        </p>

      </div>
    </footer>
  );
}

export default Footer;