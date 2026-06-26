const authService = require('../services/authService');

const REFRESH_COOKIE = 'refreshToken';

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

async function register(req, res, next) {
  try {
    const { accessToken, refreshToken, user } = await authService.register(req.body);
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions());
    res.status(201).json({ accessToken, user });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { accessToken, refreshToken, user } = await authService.login(req.body);
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions());
    res.json({ accessToken, user });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) {
      return res.status(401).json({ error: true, message: 'Sessão expirada. Faça login novamente.' });
    }
    const { accessToken, user } = await authService.refresh(token);
    res.json({ accessToken, user });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res) {
  const { maxAge: _omit, ...clearOptions } = cookieOptions();
  res.clearCookie(REFRESH_COOKIE, clearOptions);
  res.json({ message: 'Logout realizado com sucesso.' });
}

async function me(req, res, next) {
  try {
    const user = await authService.me(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refresh, logout, me };
