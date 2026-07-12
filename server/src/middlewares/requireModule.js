const tenantEntitlementService = require('../services/tenantEntitlementService');

function requireModule(moduleKey) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ error: true, message: 'Acesso negado para este perfil.' });
    }
    try {
      const enabled = await tenantEntitlementService.hasModule(req.user.tenantId, moduleKey);
      if (!enabled) {
        return res.status(403).json({ error: true, message: 'Módulo não habilitado para este cliente.' });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = requireModule;
