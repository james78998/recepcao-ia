import { useState } from "react";

export function useConfiguracoes() {
  const [configuracoes, setConfiguracoes] = useState({
    empresa: "",
    segmento: "",
    cidade: "",
    whatsapp: "",
    modeloIA: "gpt-4o-mini",
    temperatura: "0.4",
  });

  function atualizarCampo(campo, valor) {
    setConfiguracoes({
      ...configuracoes,
      [campo]: valor,
    });
  }

  return {
    configuracoes,
    atualizarCampo,
  };
}