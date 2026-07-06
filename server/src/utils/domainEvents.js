const { EventEmitter } = require('events');

// Emissor de eventos de domínio — pub/sub puro, sem nenhuma lógica de negócio
// ou conhecimento do Motor de Automações. Services de negócio (leadsService,
// whatsappService, messageSendService) só emitem eventos aqui; quem escuta
// (automationDispatchService) é resolvido em tempo de execução e registrado
// uma única vez no boot do processo (ver app.js).
const domainEvents = new EventEmitter();
domainEvents.setMaxListeners(50);

module.exports = domainEvents;
