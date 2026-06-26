import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/Button";
import Input from "../components/Input";
import Toast from "../components/Toast";

function Cadastro() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    userName: "",
    tenantName: "",
    whatsapp: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register({
        tenantName: form.tenantName,
        tenantEmail: form.email,
        userName: form.userName,
        userEmail: form.email,
        password: form.password,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
      <Toast type="error" message={error} />

      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-8">
        <h1 className="text-4xl font-bold text-blue-950 mb-2">
          Criar conta
        </h1>

        <p className="text-slate-600 mb-8">
          Comece a usar a Recepção IA.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              name="userName"
              placeholder="Nome"
              value={form.userName}
              onChange={handleChange}
              required
            />

            <Input
              name="tenantName"
              placeholder="Empresa"
              value={form.tenantName}
              onChange={handleChange}
              required
            />

            <Input
              name="whatsapp"
              placeholder="WhatsApp"
              value={form.whatsapp}
              onChange={handleChange}
            />

            <Input
              name="email"
              type="email"
              placeholder="E-mail"
              value={form.email}
              onChange={handleChange}
              required
            />

            <Input
              name="password"
              type="password"
              placeholder="Senha"
              value={form.password}
              onChange={handleChange}
              minLength={8}
              required
            />

            <Input
              name="confirmPassword"
              type="password"
              placeholder="Confirmar senha"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <Button type="submit" color="green" className="w-full mt-6" disabled={loading}>
            {loading ? "Criando conta…" : "Criar conta"}
          </Button>
        </form>

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
