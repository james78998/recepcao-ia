import Button from "../Button";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

// Mostra o secret em texto puro — só aparece na resposta de criação/
// regeneração, nunca mais é recuperável depois. O chamador deve descartar
// esse valor do estado assim que o usuário fechar este banner.
function AutomationSecretReveal({ secret, onClose }) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <div className="bg-orange-50 border border-orange-300 rounded-2xl p-6 mb-6">
      <p className="font-bold text-orange-800 mb-3">
        Copie o secret agora — ele não será mostrado novamente.
      </p>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <input
          readOnly
          value={secret}
          onClick={(e) => e.target.select()}
          className="flex-1 border p-3 rounded-xl bg-white font-mono text-sm"
        />
        <div className="flex gap-3">
          <Button type="button" color="blue" onClick={() => copy(secret)}>
            {copied ? "Copiado!" : "Copiar"}
          </Button>
          <Button type="button" color="gray" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AutomationSecretReveal;
