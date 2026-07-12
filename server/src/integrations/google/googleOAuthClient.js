const { google } = require('googleapis');

function createClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

function getScopes() {
  return (process.env.GOOGLE_CALENDAR_SCOPES || 'https://www.googleapis.com/auth/calendar').split(' ');
}

// access_type=offline + prompt=consent garantem que o Google sempre devolva
// um refresh_token (necessário para renovar o access_token sem o usuário
// precisar reconectar a cada ~1h).
function getAuthUrl(state) {
  return createClient().generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: getScopes(),
    state,
  });
}

async function exchangeCodeForTokens(code) {
  const client = createClient();
  const { tokens } = await client.getToken(code);
  return tokens;
}

// Client autenticado pronto para chamadas à API — a lib do Google renova o
// access_token sozinha quando expira, desde que refresh_token esteja presente.
function clientWithCredentials(credentials) {
  const client = createClient();
  client.setCredentials(credentials);
  return client;
}

module.exports = { getAuthUrl, exchangeCodeForTokens, clientWithCredentials };
