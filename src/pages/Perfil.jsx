import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Input from "../components/Input";
import Toast from "../components/Toast";
import { useAuth } from "../hooks/useAuth";
import * as authService from "../services/authService";

const ROLE_LABEL = {
  ADMIN: "Administrador",
  RECEPTIONIST: "Recepcionista",
};

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function Perfil() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: user?.name ?? "", email: user?.email ?? "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  const [toast, setToast] = useState(null);

  function notify(type, message) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }

  function handleProfileChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateUser(form);
      notify("success", "Dados atualizados com sucesso!");
    } catch (err) {
      notify("error", err?.response?.data?.message || "Erro ao atualizar dados.");
    } finally {
      setSavingProfile(false);
    }
  }

  function handlePasswordChange(e) {
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notify("error", "As senhas não coincidem.");
      return;
    }
    setSavingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      notify("success", "Senha atualizada com sucesso!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      notify("error", err?.response?.data?.message || "Erro ao atualizar senha.");
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <Layout active="perfil">
      {toast && <Toast type={toast.type} message={toast.message} />}

      <main className="flex-1">
        <h2 className="text-4xl font-bold text-blue-950 mb-2">
          Perfil da Conta
        </h2>

        <p className="text-slate-600 mb-8">
          Gerencie seus dados e segurança.
        </p>

        <div className="grid lg:grid-cols-3 gap-6">
          <section className="bg-white rounded-2xl shadow p-6">
            <div className="w-28 h-28 rounded-full bg-blue-900 text-white flex items-center justify-center text-4xl font-bold mb-6">
              {getInitials(user?.name) || "?"}
            </div>

            <h3 className="text-2xl font-bold text-blue-950">
              {user?.name ?? "—"}
            </h3>

            <p className="text-slate-600 mt-1">
              {ROLE_LABEL[user?.role] ?? user?.role ?? "—"}
            </p>

            <p className="text-slate-600 mt-4">
              {user?.email ?? "—"}
            </p>

            <button
              type="button"
              disabled
              title="Disponível em breve"
              className="mt-6 bg-slate-200 text-slate-400 px-5 py-3 rounded-xl font-bold w-full cursor-not-allowed"
            >
              Alterar foto
            </button>
          </section>

          <form onSubmit={handleProfileSubmit} className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
            <h3 className="text-2xl font-bold text-blue-950 mb-6">
              Dados pessoais
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                name="name"
                value={form.name}
                onChange={handleProfileChange}
                placeholder="Nome"
                required
              />
              <Input
                name="email"
                type="email"
                value={form.email}
                onChange={handleProfileChange}
                placeholder="E-mail"
                required
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="mt-6 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white px-8 py-3 rounded-xl font-bold"
            >
              {savingProfile ? "Salvando..." : "Salvar alterações"}
            </button>
          </form>

          <section className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-2xl font-bold text-blue-950 mb-6">
              Plano atual
            </h3>
            <p className="text-slate-500">Em breve.</p>
          </section>

          <form onSubmit={handlePasswordSubmit} className="bg-white rounded-2xl shadow p-6 lg:col-span-3">
            <h3 className="text-2xl font-bold text-blue-950 mb-6">
              Segurança
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
              <Input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Senha atual"
                required
              />
              <Input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="Nova senha"
                minLength={8}
                required
              />
              <Input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirmar nova senha"
                minLength={8}
                required
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="mt-6 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white px-8 py-3 rounded-xl font-bold"
            >
              {savingPassword ? "Salvando..." : "Alterar senha"}
            </button>
          </form>
        </div>

        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-bold"
          >
            Sair da conta
          </button>
        </div>
      </main>
    </Layout>
  );
}

export default Perfil;
