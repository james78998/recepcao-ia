import { Link } from "react-router-dom";

function Header() {
  const scrollToSection = (id) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <h1
          onClick={() => scrollToSection("inicio")}
          className="text-2xl md:text-3xl font-bold text-blue-900 cursor-pointer transition-colors hover:text-blue-700"
        >
          Recepção IA
        </h1>

        {/* Menu Desktop */}
        <nav className="hidden md:flex items-center gap-8 text-slate-700 font-semibold">

          <button
            onClick={() => scrollToSection("inicio")}
            className="cursor-pointer transition-colors hover:text-blue-900"
          >
            Início
          </button>

          <button
            onClick={() => scrollToSection("recursos")}
            className="cursor-pointer transition-colors hover:text-blue-900"
          >
            Recursos
          </button>

          <button
            onClick={() => scrollToSection("planos")}
            className="cursor-pointer transition-colors hover:text-blue-900"
          >
            Planos
          </button>

          <button
            onClick={() => scrollToSection("contato")}
            className="cursor-pointer transition-colors hover:text-blue-900"
          >
            Contato
          </button>

        </nav>

        {/* Botão CTA */}
        <button
          onClick={() => scrollToSection("demonstracao")}
          className="cursor-pointer bg-emerald-500 hover:bg-emerald-600 transition-colors text-white px-6 py-3 rounded-xl font-bold"
        >
           Ver Demonstração
        </button>
        <Link
  to="/login"
  className="cursor-pointer border border-blue-900 text-blue-900 px-6 py-3 rounded-xl font-bold hover:bg-blue-900 hover:text-white"
>
  Entrar
</Link>
<Link
  to="/cadastro"
  className="cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold"
>
  Teste Grátis
</Link>
      </div>
    </header>
  );
}

export default Header;