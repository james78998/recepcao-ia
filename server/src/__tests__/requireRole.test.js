const requireRole = require('../middlewares/requireRole');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('requireRole', () => {
  it('chama next() quando o role do usuário está na lista permitida', () => {
    const req = { user: { role: 'ADMIN' } };
    const res = mockRes();
    const next = jest.fn();

    requireRole('ADMIN')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('permite múltiplos roles', () => {
    const req = { user: { role: 'RECEPTIONIST' } };
    const res = mockRes();
    const next = jest.fn();

    requireRole('ADMIN', 'RECEPTIONIST')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('responde 403 quando o role não está na lista permitida', () => {
    const req = { user: { role: 'RECEPTIONIST' } };
    const res = mockRes();
    const next = jest.fn();

    requireRole('ADMIN')(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: true }));
  });

  it('responde 403 quando req.user está ausente', () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();

    requireRole('ADMIN')(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
