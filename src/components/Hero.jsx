import { Link } from "react-router-dom";
function Hero() {
  return (
    <><section id="inicio" className="..."></section><section className="pt-40 pb-28 px-6 bg-gradient-to-r from-blue-950 via-blue-900 to-emerald-500 text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold max-w-4xl">
          Sua recepcionista virtual inteligente
        </h1>

        <p className="text-xl mt-8 max-w-3xl">
          Automatize atendimentos, agendamentos e confirmações pelo WhatsApp usando Inteligência Artificial.
        </p>

        <div className="mt-10">

  <Link
    to="/cadastro"
    className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold transition"
  >
    Teste Grátis
  </Link>

  <div className="mt-5 text-white text-lg">
    Já possui uma conta?
    <Link
      to="/login"
      className="ml-2 font-bold underline hover:text-emerald-300 transition"
    >
      Entrar
    </Link>
  </div>

</div>
      </div>
    </section></>
  );
}

export default Hero;