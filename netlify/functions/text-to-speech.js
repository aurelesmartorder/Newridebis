const json = (statusCode, payload) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
});

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });
  if (!process.env.OPENAI_API_KEY) return json(500, { error: 'OPENAI_API_KEY non configurée' });

  try {
    const { text } = JSON.parse(event.body || '{}');
    if (!text || typeof text !== 'string') return json(400, { error: 'Texte manquant' });

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TTS_MODEL || 'tts-1',
        voice: process.env.OPENAI_TTS_VOICE || 'nova',
        input: text.slice(0, 4096),
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('OpenAI TTS error:', detail);
      return json(response.status, { error: 'Erreur du service vocal' });
    }

    const bytes = new Uint8Array(await response.arrayBuffer());
    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
      body: Buffer.from(bytes).toString('base64'),
    };
  } catch (error) {
    console.error(error);
    return json(500, { error: error.message || 'Erreur serveur' });
  }
}
