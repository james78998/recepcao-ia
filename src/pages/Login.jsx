function Login() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8">
        <h1 className="text-4xl font-bold text-blue-950 mb-2">
          Recepção IA
        </h1>

        <p className="text-slate-600 mb-8">
          Bem-vindo de volta. Acesse sua conta.
        </p>

        <div className="space-y-4">
          <input className="w-full border p-3 rounded-xl" type="email" placeholder="E-mail" />
          <input className="w-full border p-3 rounded-xl" type="password" placeholder="Senha" />

          <button className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold">
            Entrar
          </button>
        </div>

        <div className="flex justify-between mt-6 text-sm">
          <a href="/recuperar-senha" className="text-blue-900 font-bold">
            Esqueci minha senha
          </a>

          <a href="/cadastro" className="text-green-600 font-bold">
            Criar conta
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;