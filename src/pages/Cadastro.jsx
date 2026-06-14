import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Cadastro() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-8">
        <h1 className="text-4xl font-bold text-blue-950 mb-2">
          Criar conta
        </h1>

        <p className="text-slate-600 mb-8">
          Comece a usar a Recepção IA.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            className="border p-3 rounded-xl"
            placeholder="Nome"
          />

          <input
            className="border p-3 rounded-xl"
            placeholder="Empresa"
          />

          <input
            className="border p-3 rounded-xl"
            placeholder="WhatsApp"
          />

          <input
            className="border p-3 rounded-xl"
            type="email"
            placeholder="E-mail"
          />

          <input
            className="border p-3 rounded-xl"
            type="password"
            placeholder="Senha"
          />

          <input
            className="border p-3 rounded-xl"
            type="password"
            placeholder="Confirmar senha"
          />
        </div>

        <button
  onClick={() => {
    // TODO: substituir por cadastro real via API quando o backend estiver pronto
    navigate("/dashboard");
  }}
  className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold mt-6"
>
  Criar conta
</button>

        <p className="text-center mt-6 text-slate-600">
          Já tem conta?{" "}
          <Link
            to="/login"
            className="text-blue-900 font-bold hover:underline"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Cadastro;