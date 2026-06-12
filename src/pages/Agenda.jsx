import Layout from "../components/Layout";
function Agenda() {
  const eventos = [
    {
      hora: "09:00",
      titulo: "Demonstração",
      cliente: "Clínica Sorriso",
    },
    {
      hora: "10:30",
      titulo: "Reunião",
      cliente: "Bella Estética",
    },
    {
      hora: "14:00",
      titulo: "Implantação",
      cliente: "Lima Advocacia",
    },
  ];

  return (
    <Layout active="agenda">
      <main className="flex-1 p-8">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-bold text-blue-950">
              Agenda
            </h2>

            <p className="text-slate-600 mt-2">
              Organize reuniões e demonstrações.
            </p>
          </div>

          <button className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold">
            Novo Evento
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">

          <h3 className="text-2xl font-bold mb-6">
            Agenda do dia
          </h3>

          <div className="space-y-4">

            {eventos.map((evento, index) => (
              <div
                key={index}
                className="border rounded-xl p-5 flex justify-between items-center"
              >
                <div>
                  <h4 className="font-bold text-xl">
                    {evento.titulo}
                  </h4>

                  <p>{evento.cliente}</p>
                </div>

                <div className="text-2xl font-bold text-blue-900">
                  {evento.hora}
                </div>
              </div>
            ))}

          </div>

        </div>

      </main>

    </Layout>
  );
}

export default Agenda;