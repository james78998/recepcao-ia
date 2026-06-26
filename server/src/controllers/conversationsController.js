const conversationRepository = require('../repositories/conversationRepository');
const messageRepository = require('../repositories/messageRepository');

async function list(req, res, next) {
  try {
    const conversations = await conversationRepository.findAll(req.user.tenantId);
    return res.json(conversations);
  } catch (err) {
    next(err);
  }
}

async function getMessages(req, res, next) {
  try {
    const { tenantId } = req.user;
    const conversation = await conversationRepository.findById(req.params.id, tenantId);
    if (!conversation) {
      return res.status(404).json({ error: true, message: 'Conversa não encontrada.' });
    }
    const messages = await messageRepository.findByConversation(req.params.id, tenantId);
    return res.json({ conversation, messages });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getMessages };
