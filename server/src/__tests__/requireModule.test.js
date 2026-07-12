jest.mock('../services/tenantEntitlementService');

const tenantEntitlementService = require('../services/tenantEntitlementService');
const requireModule = require('../middlewares/requireModule');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('requireModule', () => {
  it('chama next() quando o módulo está habilitado para o tenant', async () => {
    tenantEntitlementService.hasModule.mockResolvedValue(true);
    const req = { user: { tenantId: 'tenant-1' } };
    const res = mockRes();
    const next = jest.fn();

    await requireModule('AUTOMATION_ENGINE')(req, res, next);

    expect(tenantEntitlementService.hasModule).toHaveBeenCalledWith('tenant-1', 'AUTOMATION_ENGINE');
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('responde 403 quando o módulo está desabilitado para o tenant', async () => {
    tenantEntitlementService.hasModule.mockResolvedValue(false);
    const req = { user: { tenantId: 'tenant-1' } };
    const res = mockRes();
    const next = jest.fn();

    await requireModule('AUTOMATION_ENGINE')(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: true }));
  });

  it('responde 403 quando req.user está ausente', async () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();

    await requireModule('AUTOMATION_ENGINE')(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(tenantEntitlementService.hasModule).not.toHaveBeenCalled();
  });

  it('propaga erro para o error handler quando o service lança', async () => {
    const boom = new Error('falha de banco');
    tenantEntitlementService.hasModule.mockRejectedValue(boom);
    const req = { user: { tenantId: 'tenant-1' } };
    const res = mockRes();
    const next = jest.fn();

    await requireModule('AUTOMATION_ENGINE')(req, res, next);

    expect(next).toHaveBeenCalledWith(boom);
    expect(res.status).not.toHaveBeenCalled();
  });
});
