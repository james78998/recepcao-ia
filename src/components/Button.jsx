function Button({
  children,
  color = "blue",
  className = "",
  ...props
}) {
  const colors = {
    blue: "bg-blue-900 hover:bg-blue-800 text-white",
    green: "bg-emerald-500 hover:bg-emerald-600 text-white",
    gray: "bg-slate-200 hover:bg-slate-300 text-slate-800",
    red: "bg-red-500 hover:bg-red-600 text-white",
  };

  return (
    <button
      className={`px-6 py-3 rounded-xl font-bold transition ${colors[color]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;