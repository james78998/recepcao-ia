jest.mock('../repositories/tenantRepository');
jest.mock('../services/auditLogService');

const tenantRepository = require('../repositories/tenantRepository');
const auditLogService = require('../services/auditLogService');
const { update } = require('../services/tenantProfileService');

const TENANT_ID = 'tenant-1';
const USER_ID = 'user-1';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('tenantProfileService.update', () => {
  it('atualiza o perfil e retorna o resultado', async () => {
    tenantRepository.findByIdProfile.mockResolvedValue({ name: 'Clínica Antiga' });
    tenantRepository.updateProfile.mockResolvedValue({ name: 'Clínica Nova' });

    const result = await update(TENANT_ID, USER_ID, { name: 'Clínica Nova' });

    expect(tenantRepository.updateProfile).toHaveBeenCalledWith(TENANT_ID, { name: 'Clínica Nova' });
    expect(result).toEqual({ name: 'Clínica Nova' });
  });

  it('registra auditoria com valores antigo e novo', async () => {
    tenantRepository.findByIdProfile.mockResolvedValue({ name: 'Clínica Antiga' });
    tenantRepository.updateProfile.mockResolvedValue({ name: 'Clínica Nova' });

    await update(TENANT_ID, USER_ID, { name: 'Clínica Nova' });

    expect(auditLogService.record).toHaveBeenCalledWith({
      tenantId: TENANT_ID,
      userId: USER_ID,
      action: 'UPDATE_PROFILE',
      resource: 'Tenant',
      oldValue: { name: 'Clínica Antiga' },
      newValue: { name: 'Clínica Nova' },
    });
  });
});
