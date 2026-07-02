const DAY_LABELS = {
  MON: "Segunda",
  TUE: "Terça",
  WED: "Quarta",
  THU: "Quinta",
  FRI: "Sexta",
  SAT: "Sábado",
  SUN: "Domingo",
};

function BusinessHoursEditor({ days, onChange }) {
  function updateDay(dayOfWeek, patch) {
    onChange(days.map((day) => (day.dayOfWeek === dayOfWeek ? { ...day, ...patch } : day)));
  }

  function timeInputProps(day, field) {
    return {
      type: "time",
      className: "border p-2 rounded-lg w-full disabled:bg-slate-50 disabled:text-slate-400",
      value: day[field] ?? "",
      disabled: !day.enabled,
      onChange: (e) => updateDay(day.dayOfWeek, { [field]: e.target.value || null }),
    };
  }

  return (
    <div className="space-y-3">
      <div className="hidden md:grid grid-cols-6 gap-2 text-xs font-bold text-slate-500 uppercase px-1">
        <span>Dia</span>
        <span>Início</span>
        <span>Fim</span>
        <span>Almoço início</span>
        <span>Almoço fim</span>
      </div>

      {days.map((day) => (
        <div key={day.dayOfWeek} className="grid grid-cols-2 md:grid-cols-6 gap-2 items-center border-b pb-3">
          <label className="flex items-center gap-2 font-bold text-slate-700 col-span-2 md:col-span-1">
            <input
              type="checkbox"
              checked={day.enabled}
              onChange={(e) => updateDay(day.dayOfWeek, { enabled: e.target.checked })}
            />
            {DAY_LABELS[day.dayOfWeek]}
          </label>
          <input {...timeInputProps(day, "startTime")} />
          <input {...timeInputProps(day, "endTime")} />
          <input {...timeInputProps(day, "lunchStart")} />
          <input {...timeInputProps(day, "lunchEnd")} />
        </div>
      ))}
    </div>
  );
}

export default BusinessHoursEditor;
