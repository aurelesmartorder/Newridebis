import { verifyUser, unauthorizedResponse } from './verify-user.js';

const json = (statusCode, payload) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
});

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });
  if (!process.env.OPENAI_API_KEY) return json(500, { error: 'OPENAI_API_KEY non configurée' });

  // (RÉTABLI) refuse tout appel qui ne vient pas d'un utilisateur NewRide réellement connecté —
  // sans ça, n'importe qui découvrant cette adresse peut transcrire à nos frais sans limite.
  const user = await verifyUser(event);
  if (!user) return unauthorizedResponse();

  try {
    let audioBytes;
    let mimeType = 'audio/mp4';

    const requestType = event.headers['content-type'] || event.headers['Content-Type'] || '';
    if (requestType.includes('application/json')) {
      const body = JSON.parse(event.body || '{}');
      if (!body.audio) return json(400, { error: 'Audio manquant' });
      audioBytes = Buffer.from(body.audio, 'base64');
      mimeType = body.mimeType || mimeType;
    } else {
      audioBytes = Buffer.from(event.body || '', event.isBase64Encoded ? 'base64' : 'binary');
      mimeType = requestType || mimeType;
    }

    if (!audioBytes.length) return json(400, { error: 'Audio vide' });
    if (audioBytes.length > 12 * 1024 * 1024) return json(413, { error: 'Enregistrement trop volumineux' });

    const extension = mimeType.includes('mp4') ? 'm4a'
      : mimeType.includes('wav') ? 'wav'
      : mimeType.includes('ogg') ? 'ogg'
      : 'webm';

    const form = new FormData();
    form.append('model', process.env.OPENAI_TRANSCRIPTION_MODEL || 'whisper-1');
    form.append('language', 'fr');
    form.append('file', new Blob([audioBytes], { type: mimeType }), `newride.${extension}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    let response;
    try {
      response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: form,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('OpenAI transcription error:', data);
      return json(response.status, { error: data?.error?.message || 'Erreur de transcription' });
    }
    return json(200, { text: String(data.text || '').trim() });
  } catch (error) {
    console.error(error);
    if (error?.name === 'AbortError') return json(504, { error: 'La transcription a pris trop de temps' });
    return json(500, { error: error.message || 'Erreur serveur' });
  }
}
