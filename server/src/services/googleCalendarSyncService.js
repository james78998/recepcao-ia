const tenantIntegrationRepository = require('../repositories/tenantIntegrationRepository');
const appointmentRepository = require('../repositories/appointmentRepository');
const tenantEntitlementService = require('./tenantEntitlementService');
const encryption = require('../utils/encryption');
const googleOAuthClient = require('../integrations/google/googleOAuthClient');
const googleCalendarClient = require('../integrations/google/googleCalendarClient');
const logger = require('../utils/logger');

// Nenhuma função aqui lança — sincronização com o Google é sempre
// best-effort (fire-and-forget a partir do appointmentService). Uma falha ou
// indisponibilidade do Google nunca pode impedir o CRUD de Agenda.
async function getConnectedClient(tenantId) {
  const hasModule = await tenantEntitlementService.hasModule(tenantId, 'GOOGLE_CALENDAR');
  if (!hasModule) return null;

  const integration = await tenantIntegrationRepository.findByTenantAndProvider(tenantId, 'GOOGLE_CALENDAR');
  if (!integration || integration.status !== 'CONNECTED' || !integration.credentialsEncrypted) return null;

  const credentials = JSON.parse(encryption.decrypt(integration.credentialsEncrypted));
  const client = googleOAuthClient.clientWithCredentials(credentials);
  const calendarId = integration.metadata?.calendarId || 'primary';
  return { client, calendarId };
}

function toGoogleEvent(appointment) {
  return {
    summary: appointment.title,
    description: appointment.description ?? undefined,
    location: appointment.location ?? undefined,
    start: { dateTime: appointment.startAt.toISOString() },
    end: { dateTime: appointment.endAt.toISOString() },
  };
}

async function markError(tenantId, message) {
  await tenantIntegrationRepository
    .upsert(tenantId, 'GOOGLE_CALENDAR', { lastError: message })
    .catch(() => {});
}

async function syncCreate(tenantId, appointment) {
  try {
    const connected = await getConnectedClient(tenantId);
    if (!connected) return;

    const event = await googleCalendarClient.insertEvent(connected.client, connected.calendarId, toGoogleEvent(appointment));
    await appointmentRepository.update(appointment.id, { googleEventId: event.id });
  } catch (err) {
    logger.error('[google-calendar] falha ao criar evento', { tenantId, appointmentId: appointment.id, message: err.message });
    await markError(tenantId, err.message);
  }
}

async function syncUpdate(tenantId, appointment) {
  try {
    if (!appointment.googleEventId) {
      await syncCreate(tenantId, appointment);
      return;
    }

    const connected = await getConnectedClient(tenantId);
    if (!connected) return;

    await googleCalendarClient.updateEvent(
      connected.client,
      connected.calendarId,
      appointment.googleEventId,
      toGoogleEvent(appointment)
    );
  } catch (err) {
    logger.error('[google-calendar] falha ao atualizar evento', { tenantId, appointmentId: appointment.id, message: err.message });
    await markError(tenantId, err.message);
  }
}

async function syncDelete(tenantId, appointment) {
  try {
    if (!appointment.googleEventId) return;

    const connected = await getConnectedClient(tenantId);
    if (!connected) return;

    await googleCalendarClient.deleteEvent(connected.client, connected.calendarId, appointment.googleEventId);
  } catch (err) {
    logger.error('[google-calendar] falha ao excluir evento', { tenantId, appointmentId: appointment.id, message: err.message });
    await markError(tenantId, err.message);
  }
}

module.exports = { syncCreate, syncUpdate, syncDelete };
