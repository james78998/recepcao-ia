const adminAuthService = require('../services/adminAuthService');

async function login(req, res, next) {
  try {
    const { accessToken, admin } = await adminAuthService.login(req.body);
    res.json({ accessToken, admin });
  } catch (err) {
    next(err);
  }
}

module.exports = { login };
