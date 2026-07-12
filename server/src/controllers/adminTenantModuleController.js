const tenantEntitlementService = require('../services/tenantEntitlementService');

async function list(req, res, next) {
  try {
    const modules = await tenantEntitlementService.getCatalogWithStatus(req.params.id);
    res.json({ data: modules });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const modules = await tenantEntitlementService.setModuleEnabled(
      req.params.id,
      req.params.moduleKey,
      req.body.enabled,
      { adminUserId: req.adminUser.id }
    );
    res.json({ data: modules });
  } catch (err) {
    next(err);
  }
}

async function bulkUpdate(req, res, next) {
  try {
    const modules = await tenantEntitlementService.setModulesBulk(
      req.params.id,
      req.body.modules,
      { adminUserId: req.adminUser.id }
    );
    res.json({ data: modules });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, update, bulkUpdate };
