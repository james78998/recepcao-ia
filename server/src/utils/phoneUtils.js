/**
 * Normaliza um número de telefone para apenas dígitos (E.164 sem o +).
 * Usado para armazenar phoneNormalized e para busca via webhook do WhatsApp.
 */
function normalizePhone(raw) {
  if (!raw) return null;
  return raw.replace(/\D/g, '') || null;
}

module.exports = { normalizePhone };
