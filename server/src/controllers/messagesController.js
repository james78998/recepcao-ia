const messageSendService = require('../services/messageSendService');

async function send(req, res, next) {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    const result = await messageSendService.sendDraft(id, tenantId);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { send };
