const { google } = require('googleapis');

// Mesmo timeout usado nas entregas do Motor de Automações (ver
// constants/automation.js AUTOMATION_DISPATCH_TIMEOUT_MS) — padrão de
// resiliência para chamadas a provedores externos.
const REQUEST_TIMEOUT_MS = 10_000;

function calendarApi(auth) {
  return google.calendar({ version: 'v3', auth });
}

async function insertEvent(auth, calendarId, event) {
  const { data } = await calendarApi(auth).events.insert(
    { calendarId, requestBody: event },
    { timeout: REQUEST_TIMEOUT_MS }
  );
  return data;
}

async function updateEvent(auth, calendarId, eventId, event) {
  const { data } = await calendarApi(auth).events.update(
    { calendarId, eventId, requestBody: event },
    { timeout: REQUEST_TIMEOUT_MS }
  );
  return data;
}

async function deleteEvent(auth, calendarId, eventId) {
  await calendarApi(auth).events.delete({ calendarId, eventId }, { timeout: REQUEST_TIMEOUT_MS });
}

module.exports = { insertEvent, updateEvent, deleteEvent };
