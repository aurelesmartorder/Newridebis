// Fonction serverless : décrit réellement une photo du fil social NewRide
// (pas seulement sa légende texte). Appelée à la demande par le coach vocal
// temps réel via l'outil describe_recent_post, pas systématiquement — pour
// éviter d'analyser des images inutilement à chaque conversation.

import { verifyUser, unauthorizedResponse } from './verify-user.js';

const json = (statusCode, payload) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
});

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });
  if (!process.env.ANTHROPIC_API_KEY) return json(500, { error: 'ANTHROPIC_API_KEY non configurée' });

  const user = await verifyUser(event);
  if (!user) return unauthorizedResponse();

  try {
    const { imageUrl, caption } = JSON.parse(event.body || '{}');
    if (!imageUrl || typeof imageUrl !== 'string') return json(400, { error: 'imageUrl manquant' });

    // Récupère l'image côté serveur (URL publique Supabase Storage) puis
    // l'encode en base64 pour l'envoyer à Claude — évite tout problème de
    // CORS côté navigateur et garde la clé API hors du client.
    const imgResponse = await fetch(imageUrl);
    if (!imgResponse.ok) return json(502, { error: "Impossible de récupérer l'image" });
    const contentType = imgResponse.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await imgResponse.arrayBuffer();
    if (arrayBuffer.byteLength > 8 * 1024 * 1024) return json(413, { error: 'Image trop volumineuse' });
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: contentType, data: base64 } },
            {
              type: 'text',
              text: `Décris cette photo publiée par un cavalier sur son fil social, en 2-3 phrases, ton chaleureux et naturel — comme un ami qui commente une photo, pas une description technique. ${caption ? `Légende donnée par le cavalier : "${caption}".` : ''} Reste factuel sur ce que tu vois réellement.`,
            },
          ],
        }],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Anthropic vision error:', data);
      return json(response.status, { error: data?.error?.message || 'Erreur Anthropic' });
    }

    return json(200, { description: (data.content?.[0]?.text || '').trim() });
  } catch (error) {
    console.error(error);
    return json(500, { error: error.message || 'Erreur serveur' });
  }
}
