const adminTenantService = require('../services/adminTenantService');

async function list(req, res, next) {
  try {
    const tenants = await adminTenantService.list();
    res.json({ data: tenants });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const tenant = await adminTenantService.getById(req.params.id);
    res.json(tenant);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById };
