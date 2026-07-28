const json = (statusCode, payload) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
});

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });
  if (!process.env.OPENAI_API_KEY) return json(500, { error: 'OPENAI_API_KEY non configurée' });

  try {
    const contentType = event.headers['content-type'] || event.headers['Content-Type'] || 'audio/webm';
    const audioBytes = Buffer.from(event.body || '', event.isBase64Encoded ? 'base64' : 'binary');
    if (!audioBytes.length) return json(400, { error: 'Audio manquant' });

    const extension = contentType.includes('mp4') ? 'm4a' : contentType.includes('wav') ? 'wav' : 'webm';
    const form = new FormData();
    form.append('model', process.env.OPENAI_TRANSCRIPTION_MODEL || 'whisper-1');
    form.append('language', 'fr');
    form.append('file', new Blob([audioBytes], { type: contentType }), `newride.${extension}`);

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: form,
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('OpenAI transcription error:', data);
      return json(response.status, { error: data?.error?.message || 'Erreur de transcription' });
    }
    return json(200, { text: data.text || '' });
  } catch (error) {
    console.error(error);
    return json(500, { error: error.message || 'Erreur serveur' });
  }
}
