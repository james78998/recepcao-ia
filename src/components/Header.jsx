function Header() {
  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-900">
          Recepção IA
        </h1>

        <nav className="hidden md:flex items-center gap-8 text-slate-700 font-semibold">
          <a href="#" className="hover:text-blue-900">Início</a>
          <a href="#recursos" className="hover:text-blue-900">Recursos</a>
          <a href="#planos" className="hover:text-blue-900">Planos</a>
          <a href="#contato" className="hover:text-blue-900">Contato</a>
        </nav>

        <a href="#contato" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold">
          Demonstração
        </a>
      </div>
    </header>
  );
}

export default Header;