const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const TIMEOUT_MS = 30_000;

async function complete({ messages, model, maxTokens, temperature, apiKey }) {
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY não configurado');

  const body = { model, messages, max_tokens: maxTokens };
  if (temperature !== undefined && temperature !== null) {
    body.temperature = temperature;
  }

  const response = await fetch(OPENAI_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI ${response.status}: ${body}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

module.exports = { complete };
