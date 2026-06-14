function Pagination({
  currentPage = 1,
  totalPages = 5,
  onPageChange,
}) {
  return (
    <div className="flex items-center justify-center gap-2 mt-6">

      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-xl bg-slate-200 disabled:opacity-50"
      >
        ←
      </button>

      {[...Array(totalPages)].map((_, index) => (
        <button
          key={index}
          onClick={() => onPageChange(index + 1)}
          className={`px-4 py-2 rounded-xl font-bold ${
            currentPage === index + 1
              ? "bg-blue-900 text-white"
              : "bg-slate-200"
          }`}
        >
          {index + 1}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-xl bg-slate-200 disabled:opacity-50"
      >
        →
      </button>

    </div>
  );
}

export default Pagination;