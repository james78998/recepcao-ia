let _token = null;

export function getAdminToken() { return _token; }
export function setAdminToken(token) { _token = token; }
export function clearAdminToken() { _token = null; }
