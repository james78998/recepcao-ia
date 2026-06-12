function Toast({ type = "success", message }) {
  const styles = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    warning: "bg-orange-500",
    info: "bg-blue-900",
  };

  if (!message) return null;

  return (
    <div
      className={`fixed top-6 right-6 z-50 text-white px-6 py-4 rounded-2xl shadow-xl font-bold ${styles[type]}`}
    >
      {message}
    </div>
  );
}

export default Toast;