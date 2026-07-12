const appointmentService = require('../services/appointmentService');

async function list(req, res, next) {
  try {
    const { from, to } = req.query;
    const appointments = await appointmentService.list(req.user.tenantId, { from, to });
    res.json({ data: appointments });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const appointment = await appointmentService.getById(req.params.id, req.user.tenantId);
    res.json(appointment);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const appointment = await appointmentService.create(req.user.tenantId, req.body);
    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const appointment = await appointmentService.update(req.params.id, req.user.tenantId, req.body);
    res.json(appointment);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await appointmentService.remove(req.params.id, req.user.tenantId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove };
