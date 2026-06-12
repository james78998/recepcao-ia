function Modal({ isOpen, title, message, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-blue-950 mb-4">
          {title}
        </h2>

        <p className="text-slate-600 mb-8">
          {message}
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-slate-200 text-slate-800 px-6 py-3 rounded-xl font-bold"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;