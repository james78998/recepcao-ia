import { useState, useCallback } from "react";

// Reaproveitado pelo botão de copiar o secret revelado e pelo botão de
// copiar o exemplo de payload — mesmo micro-padrão em ambos os lugares.
export function useCopyToClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    (text) => {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), resetDelay);
      });
    },
    [resetDelay]
  );

  return { copied, copy };
}
