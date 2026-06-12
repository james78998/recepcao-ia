function Topbar() {
  return (
    <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
      <div>
        <h2 className="font-bold text-blue-950">
          Painel Administrativo
        </h2>
        <p className="text-sm text-slate-500">
          Sistema Recepção IA
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button className="bg-slate-100 px-4 py-2 rounded-xl font-bold text-slate-700">
          🔔 3
        </button>

        <div className="text-right">
          <p className="font-bold text-blue-950">
            James Rodrigues
          </p>
          <p className="text-sm text-slate-500">
            Administrador
          </p>
        </div>

        <div className="w-11 h-11 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold">
          JR
        </div>
      </div>
    </div>
  );
}

export default Topbar;