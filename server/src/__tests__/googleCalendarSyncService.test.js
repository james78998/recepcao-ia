jest.mock('../repositories/tenantIntegrationRepository');
jest.mock('../repositories/appointmentRepository');
jest.mock('../services/tenantEntitlementService');
jest.mock('../utils/encryption');
jest.mock('../integrations/google/googleOAuthClient');
jest.mock('../integrations/google/googleCalendarClient');
jest.mock('../utils/logger');

const tenantIntegrationRepository = require('../repositories/tenantIntegrationRepository');
const appointmentRepository = require('../repositories/appointmentRepository');
const tenantEntitlementService = require('../services/tenantEntitlementService');
const encryption = require('../utils/encryption');
const googleOAuthClient = require('../integrations/google/googleOAuthClient');
const googleCalendarClient = require('../integrations/google/googleCalendarClient');
const { syncCreate, syncUpdate, syncDelete } = require('../services/googleCalendarSyncService');

const TENANT_ID = 'tenant-1';
const APPOINTMENT = {
  id: 'appointment-1',
  title: 'Demonstração',
  description: null,
  location: null,
  startAt: new Date('2026-07-15T09:00:00.000Z'),
  endAt: new Date('2026-07-15T09:30:00.000Z'),
  googleEventId: null,
};

const CONNECTED_INTEGRATION = {
  status: 'CONNECTED',
  credentialsEncrypted: 'v1:iv:tag:ciphertext',
  metadata: { calendarId: 'primary' },
};

const FAKE_CLIENT = { fake: 'oauth2-client' };

beforeEach(() => {
  jest.clearAllMocks();
  encryption.decrypt.mockReturnValue(JSON.stringify({ access_token: 'token', refresh_token: 'refresh' }));
  googleOAuthClient.clientWithCredentials.mockReturnValue(FAKE_CLIENT);
  tenantIntegrationRepository.upsert.mockResolvedValue({});
});

describe('googleCalendarSyncService.syncCreate', () => {
  it('não faz nada quando o módulo GOOGLE_CALENDAR está desabilitado para o tenant', async () => {
    tenantEntitlementService.hasModule.mockResolvedValue(false);

    await syncCreate(TENANT_ID, APPOINTMENT);

    expect(tenantIntegrationRepository.findByTenantAndProvider).not.toHaveBeenCalled();
    expect(googleCalendarClient.insertEvent).not.toHaveBeenCalled();
  });

  it('não faz nada quando a integração não está conectada', async () => {
    tenantEntitlementService.hasModule.mockResolvedValue(true);
    tenantIntegrationRepository.findByTenantAndProvider.mockResolvedValue({ status: 'NOT_CONNECTED' });

    await syncCreate(TENANT_ID, APPOINTMENT);

    expect(googleCalendarClient.insertEvent).not.toHaveBeenCalled();
  });

  it('cria o evento no Google Calendar e persiste o googleEventId', async () => {
    tenantEntitlementService.hasModule.mockResolvedValue(true);
    tenantIntegrationRepository.findByTenantAndProvider.mockResolvedValue(CONNECTED_INTEGRATION);
    googleCalendarClient.insertEvent.mockResolvedValue({ id: 'google-event-1' });

    await syncCreate(TENANT_ID, APPOINTMENT);

    expect(googleCalendarClient.insertEvent).toHaveBeenCalledWith(
      FAKE_CLIENT,
      'primary',
      expect.objectContaining({ summary: 'Demonstração' })
    );
    expect(appointmentRepository.update).toHaveBeenCalledWith(APPOINTMENT.id, { googleEventId: 'google-event-1' });
  });

  it('nunca lança quando a API do Google falha — apenas registra o erro na integração', async () => {
    tenantEntitlementService.hasModule.mockResolvedValue(true);
    tenantIntegrationRepository.findByTenantAndProvider.mockResolvedValue(CONNECTED_INTEGRATION);
    googleCalendarClient.insertEvent.mockRejectedValue(new Error('Google indisponível'));

    await expect(syncCreate(TENANT_ID, APPOINTMENT)).resolves.toBeUndefined();

    expect(tenantIntegrationRepository.upsert).toHaveBeenCalledWith(TENANT_ID, 'GOOGLE_CALENDAR', {
      lastError: 'Google indisponível',
    });
  });
});

describe('googleCalendarSyncService.syncUpdate', () => {
  it('cria o evento quando o compromisso ainda não tem googleEventId', async () => {
    tenantEntitlementService.hasModule.mockResolvedValue(true);
    tenantIntegrationRepository.findByTenantAndProvider.mockResolvedValue(CONNECTED_INTEGRATION);
    googleCalendarClient.insertEvent.mockResolvedValue({ id: 'google-event-novo' });

    await syncUpdate(TENANT_ID, APPOINTMENT);

    expect(googleCalendarClient.insertEvent).toHaveBeenCalled();
    expect(googleCalendarClient.updateEvent).not.toHaveBeenCalled();
  });

  it('atualiza o evento existente quando já há googleEventId', async () => {
    const appointment = { ...APPOINTMENT, googleEventId: 'google-event-1' };
    tenantEntitlementService.hasModule.mockResolvedValue(true);
    tenantIntegrationRepository.findByTenantAndProvider.mockResolvedValue(CONNECTED_INTEGRATION);

    await syncUpdate(TENANT_ID, appointment);

    expect(googleCalendarClient.updateEvent).toHaveBeenCalledWith(
      FAKE_CLIENT,
      'primary',
      'google-event-1',
      expect.objectContaining({ summary: 'Demonstração' })
    );
  });
});

describe('googleCalendarSyncService.syncDelete', () => {
  it('não faz nada quando o compromisso nunca foi sincronizado', async () => {
    await syncDelete(TENANT_ID, APPOINTMENT);

    expect(tenantEntitlementService.hasModule).not.toHaveBeenCalled();
    expect(googleCalendarClient.deleteEvent).not.toHaveBeenCalled();
  });

  it('exclui o evento correspondente no Google Calendar', async () => {
    const appointment = { ...APPOINTMENT, googleEventId: 'google-event-1' };
    tenantEntitlementService.hasModule.mockResolvedValue(true);
    tenantIntegrationRepository.findByTenantAndProvider.mockResolvedValue(CONNECTED_INTEGRATION);

    await syncDelete(TENANT_ID, appointment);

    expect(googleCalendarClient.deleteEvent).toHaveBeenCalledWith(FAKE_CLIENT, 'primary', 'google-event-1');
  });

  it('nunca lança quando a exclusão falha na API do Google', async () => {
    const appointment = { ...APPOINTMENT, googleEventId: 'google-event-1' };
    tenantEntitlementService.hasModule.mockResolvedValue(true);
    tenantIntegrationRepository.findByTenantAndProvider.mockResolvedValue(CONNECTED_INTEGRATION);
    googleCalendarClient.deleteEvent.mockRejectedValue(new Error('Google indisponível'));

    await expect(syncDelete(TENANT_ID, appointment)).resolves.toBeUndefined();
  });
});
