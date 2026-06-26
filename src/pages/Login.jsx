import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/Button";
import Input from "../components/Input";
import Toast from "../components/Toast";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
      <Toast type="error" message={error} />

      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8">
        <h1 className="text-4xl font-bold text-blue-950 mb-2">
          Recepção IA
        </h1>

        <p className="text-slate-600 mb-8">
          Bem-vindo de volta. Acesse sua conta.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" color="blue" className="w-full" disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </Button>
        </form>

        <div className="flex justify-between mt-6 text-sm">
          <Link
            to="/recuperar-senha"
            className="text-blue-900 font-bold hover:underline"
          >
            Esqueci minha senha
          </Link>

          <Link
            to="/cadastro"
            className="text-green-600 font-bold hover:underline"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
