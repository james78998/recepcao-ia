import { useState } from "react";
import { Link } from "react-router-dom";
import * as authService from "../services/authService";

function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authService.forgotPassword(email);
      // Mensagem sempre genérica — não revela se o e-mail existe na base.
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao solicitar recuperação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8">
        <h1 className="text-4xl font-bold text-blue-950 mb-2">
          Recuperar senha
        </h1>

        <p className="text-slate-600 mb-8">
          Informe seu e-mail para receber o link de recuperação.
        </p>

        {sent ? (
          <p className="text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-4">
            Se o e-mail existir em nossa base, enviaremos instruções de recuperação em instantes.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            <input
              className="w-full border p-3 rounded-xl mb-4"
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 hover:bg-blue-800 disabled:opacity-60 transition-colors text-white py-3 rounded-xl font-bold"
            >
              {loading ? "Enviando..." : "Enviar link"}
            </button>
          </form>
        )}

        <Link
          to="/login"
          className="block text-center mt-6 text-blue-900 font-bold hover:underline"
        >
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}

export default RecuperarSenha;
