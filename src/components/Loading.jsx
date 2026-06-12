function Loading({ text = "Carregando..." }) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 text-center w-full max-w-md">
        <div className="w-16 h-16 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>

        <h1 className="text-3xl font-bold text-blue-950 mb-2">
          Recepção IA
        </h1>

        <p className="text-slate-600">
          {text}
        </p>
      </div>
    </div>
  );
}

export default Loading;