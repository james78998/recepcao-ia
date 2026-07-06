const automationWebhookService = require('../services/automationWebhookService');
const automationDispatchService = require('../services/automationDispatchService');

async function list(req, res, next) {
  try {
    const webhooks = await automationWebhookService.list(req.user.tenantId);
    res.json({ data: webhooks });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const webhook = await automationWebhookService.getById(req.params.id, req.user.tenantId);
    res.json(webhook);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const webhook = await automationWebhookService.create(req.user.tenantId, req.user.id, req.body);
    res.status(201).json(webhook);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const webhook = await automationWebhookService.update(req.params.id, req.user.tenantId, req.user.id, req.body);
    res.json(webhook);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const webhook = await automationWebhookService.remove(req.params.id, req.user.tenantId, req.user.id);
    res.json(webhook);
  } catch (err) {
    next(err);
  }
}

async function regenerateSecret(req, res, next) {
  try {
    const webhook = await automationWebhookService.regenerateSecret(req.params.id, req.user.tenantId, req.user.id);
    res.json(webhook);
  } catch (err) {
    next(err);
  }
}

async function test(req, res, next) {
  try {
    const result = await automationDispatchService.sendTest(req.params.id, req.user.tenantId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getLogs(req, res, next) {
  try {
    const { page, perPage } = req.query;
    const success = req.query.success === 'true' ? true : req.query.success === 'false' ? false : undefined;
    const logs = await automationDispatchService.listLogs(req.params.id, req.user.tenantId, { page, perPage, success });
    res.json(logs);
  } catch (err) {
    next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const stats = await automationDispatchService.getStats(req.user.tenantId);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove, regenerateSecret, test, getLogs, getStats };
