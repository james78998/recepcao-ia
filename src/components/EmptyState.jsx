function EmptyState({
  title = "Nenhum registro encontrado",
  description = "Ainda não existem informações para exibir.",
  buttonText,
  onClick,
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-10 text-center">

      <div className="text-7xl mb-6">
        📭
      </div>

      <h2 className="text-3xl font-bold text-blue-950">
        {title}
      </h2>

      <p className="text-slate-500 mt-4 max-w-md mx-auto">
        {description}
      </p>

      {buttonText && (
        <button
          onClick={onClick}
          className="mt-8 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}

export default EmptyState;