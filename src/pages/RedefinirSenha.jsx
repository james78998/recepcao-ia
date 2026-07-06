import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import * as authService from "../services/authService";

function RedefinirSenha() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authService.resetPassword({ token, newPassword });
      setDone(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Token inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8">
        <h1 className="text-4xl font-bold text-blue-950 mb-2">
          Redefinir senha
        </h1>

        <p className="text-slate-600 mb-8">
          Escolha uma nova senha para sua conta.
        </p>

        {!token ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            Link inválido. Solicite uma nova recuperação de senha.
          </div>
        ) : done ? (
          <p className="text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-4">
            Senha redefinida com sucesso! Redirecionando para o login...
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
              type="password"
              placeholder="Nova senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
            />

            <input
              className="w-full border p-3 rounded-xl mb-4"
              type="password"
              placeholder="Confirmar nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 hover:bg-blue-800 disabled:opacity-60 transition-colors text-white py-3 rounded-xl font-bold"
            >
              {loading ? "Salvando..." : "Redefinir senha"}
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

export default RedefinirSenha;
