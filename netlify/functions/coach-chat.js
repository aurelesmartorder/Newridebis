const json = (statusCode, payload) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
});

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });
  if (!process.env.ANTHROPIC_API_KEY) return json(500, { error: 'ANTHROPIC_API_KEY non configurée' });

  try {
    const { messages, system } = JSON.parse(event.body || '{}');
    if (!Array.isArray(messages)) return json(400, { error: 'Le champ messages doit être un tableau' });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
        max_tokens: 1200,
        system: typeof system === 'string' ? system : '',
        messages,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Anthropic error:', data);
      return json(response.status, { error: data?.error?.message || 'Erreur Anthropic' });
    }

    return json(200, { reply: data.content?.[0]?.text || '' });
  } catch (error) {
    console.error(error);
    return json(500, { error: error.message || 'Erreur serveur' });
  }
}
