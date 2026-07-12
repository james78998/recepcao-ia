// Catálogo de módulos comerciais da plataforma — fonte única usada pelo backfill
// (scripts/backfillModules.js) e pelo onboarding de novos tenants
// (tenantOnboardingService). Dashboard, Configurações e Perfil não são módulos
// comerciais e ficam sempre disponíveis, fora deste catálogo.
const MODULE_CATALOG = [
  { key: 'CRM', name: 'CRM', description: 'Gestão de leads e funil comercial.' },
  { key: 'WHATSAPP', name: 'WhatsApp', description: 'Atendimento e envio de mensagens via WhatsApp Business.' },
  { key: 'AI', name: 'Inteligência Artificial', description: 'Geração de rascunhos e insights pela Recepção IA.' },
  { key: 'AGENDA', name: 'Agenda', description: 'Agendamento de consultas e compromissos.' },
  { key: 'AUTOMATION_ENGINE', name: 'Motor de Automações', description: 'Webhooks de saída para sistemas externos (n8n, Zapier, etc.).' },
  { key: 'FINANCEIRO', name: 'Financeiro', description: 'Planos, cobranças e consumo da plataforma.' },
  { key: 'DENTAL_OFFICE', name: 'Dental Office', description: 'Integração com o software de gestão odontológica Dental Office.' },
  { key: 'GOOGLE_CALENDAR', name: 'Google Calendar', description: 'Sincronização de agenda com o Google Calendar.' },
];

const MODULE_KEYS = MODULE_CATALOG.map((m) => m.key);

module.exports = { MODULE_CATALOG, MODULE_KEYS };
