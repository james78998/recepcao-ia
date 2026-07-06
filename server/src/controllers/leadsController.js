const leadsService = require('../services/leadsService');

async function list(req, res, next) {
  try {
    const { tenantId } = req.user;
    const { search, status, page, perPage } = req.query;
    const result = await leadsService.list({ tenantId, search, status, page, perPage });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const lead = await leadsService.getById(req.params.id, req.user.tenantId);
    res.json(lead);
  } catch (err) {
    next(err);
  }
}

async function getMessages(req, res, next) {
  try {
    const messages = await leadsService.getMessages(req.params.id, req.user.tenantId);
    res.json(messages);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const lead = await leadsService.create(req.user.tenantId, req.body);
    res.status(201).json(lead);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const lead = await leadsService.update(req.params.id, req.user.tenantId, req.body);
    res.json(lead);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await leadsService.remove(req.params.id, req.user.tenantId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, getMessages, create, update, remove };
