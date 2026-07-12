jest.mock('jsonwebtoken');
jest.mock('../integrations/google/googleOAuthClient');
jest.mock('../services/tenantIntegrationService');

const jwt = require('jsonwebtoken');
const googleOAuthClient = require('../integrations/google/googleOAuthClient');
const tenantIntegrationService = require('../services/tenantIntegrationService');
const { getAuthUrl, handleCallback } = require('../services/googleCalendarIntegrationService');

const TENANT_ID = 'tenant-1';
const USER_ID = 'user-1';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('googleCalendarIntegrationService.getAuthUrl', () => {
  it('assina um state com tenantId/userId e repassa para o adapter do Google', () => {
    jwt.sign.mockReturnValue('state-assinado');
    googleOAuthClient.getAuthUrl.mockReturnValue('https://accounts.google.com/o/oauth2/v2/auth?...');

    const url = getAuthUrl(TENANT_ID, USER_ID);

    expect(jwt.sign).toHaveBeenCalledWith(
      { tenantId: TENANT_ID, userId: USER_ID },
      process.env.JWT_SECRET,
      expect.objectContaining({ expiresIn: '10m' })
    );
    expect(googleOAuthClient.getAuthUrl).toHaveBeenCalledWith('state-assinado');
    expect(url).toBe('https://accounts.google.com/o/oauth2/v2/auth?...');
  });
});

describe('googleCalendarIntegrationService.handleCallback', () => {
  it('troca o code por tokens e conecta a integração do tenant correto', async () => {
    jwt.verify.mockReturnValue({ tenantId: TENANT_ID, userId: USER_ID });
    googleOAuthClient.exchangeCodeForTokens.mockResolvedValue({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    });
    tenantIntegrationService.connect.mockResolvedValue({ provider: 'GOOGLE_CALENDAR', status: 'CONNECTED' });

    const result = await handleCallback('auth-code', 'state-assinado');

    expect(googleOAuthClient.exchangeCodeForTokens).toHaveBeenCalledWith('auth-code');
    expect(tenantIntegrationService.connect).toHaveBeenCalledWith(TENANT_ID, USER_ID, 'GOOGLE_CALENDAR', {
      credentials: { access_token: 'access-token', refresh_token: 'refresh-token' },
      metadata: { calendarId: 'primary' },
      providerVersion: 'v3',
    });
    expect(result).toEqual({ tenantId: TENANT_ID });
  });

  it('lança 400 quando o state é inválido ou expirado', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('jwt expired');
    });

    await expect(handleCallback('auth-code', 'state-invalido')).rejects.toMatchObject({ status: 400 });
    expect(googleOAuthClient.exchangeCodeForTokens).not.toHaveBeenCalled();
    expect(tenantIntegrationService.connect).not.toHaveBeenCalled();
  });
});
