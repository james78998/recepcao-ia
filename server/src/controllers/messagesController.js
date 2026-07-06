const messageSendService = require('../services/messageSendService');
const messageRepository = require('../repositories/messageRepository');

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

async function count(req, res, next) {
  try {
    const total = await messageRepository.countByTenant(req.user.tenantId);
    return res.json({ total });
  } catch (err) {
    next(err);
  }
}

module.exports = { send, count };
