import { useState } from "react";
import Input from "../Input";

// Campo de segredo mascarado: quando já configurado, mostra um indicador em
// vez do valor (que o backend nunca retorna) e só vira editável se o usuário
// clicar em "Alterar". Reaproveitado para chave OpenAI, token WhatsApp e
// credenciais de integrações.
function ApiKeyInput({ name, configured, placeholder, onChange }) {
  const [editing, setEditing] = useState(!configured);

  if (!editing) {
    return (
      <div className="flex items-center gap-3">
        <span className="flex-1 border p-3 rounded-xl text-slate-500 bg-slate-50">
          •••••••••••••• configurada
        </span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-blue-900 font-bold whitespace-nowrap"
        >
          Alterar
        </button>
      </div>
    );
  }

  return (
    <Input
      name={name}
      type="password"
      placeholder={placeholder}
      onChange={onChange}
      autoComplete="off"
    />
  );
}

export default ApiKeyInput;
