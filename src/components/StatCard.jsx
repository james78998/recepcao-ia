function StatCard({ title, value, color = "text-blue-900" }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <p className="text-slate-500">
        {title}
      </p>

      <h3 className={`text-4xl font-bold mt-2 ${color}`}>
        {value}
      </h3>
    </div>
  );
}

export default StatCard;