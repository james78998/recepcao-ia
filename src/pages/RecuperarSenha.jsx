function RecuperarSenha() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8">
        <h1 className="text-4xl font-bold text-blue-950 mb-2">
          Recuperar senha
        </h1>

        <p className="text-slate-600 mb-8">
          Informe seu e-mail para receber o código de recuperação.
        </p>

        <input
          className="w-full border p-3 rounded-xl mb-4"
          type="email"
          placeholder="Seu e-mail"
        />

        <button className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold">
          Enviar código
        </button>

        <a href="/login" className="block text-center mt-6 text-blue-900 font-bold">
          Voltar ao login
        </a>
      </div>
    </div>
  );
}

export default RecuperarSenha;