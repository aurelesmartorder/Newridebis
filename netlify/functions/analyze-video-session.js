// Fonction serverless : analyse un compte-rendu de session a partir
// d'images extraites d'une video (cote client — jamais la video brute,
// pour rester dans les limites de taille et de latence de Netlify
// Functions). Meme principe de securite que coach-chat.js : verifyUser
// obligatoire, sinon n'importe qui pourrait consommer la cle Anthropic.
//
// Cote client, extraire au maximum ~12-15 frames JPEG compressees plutot
// que d'envoyer la video entiere : Claude ne recoit pas de video, une
// sequence d'images labellisees dans l'ordre chronologique.

import { verifyUser, unauthorizedResponse } from './verify-user.js';

const json = (statusCode, payload) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
});

const MAX_FRAMES = 20;

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });
  if (!process.env.ANTHROPIC_API_KEY) return json(500, { error: 'ANTHROPIC_API_KEY non configurée' });

  // (SÉCURITÉ) même garde-fou que les autres fonctions : sans utilisateur
  // NewRide connecté, refus immédiat.
  const user = await verifyUser(event);
  if (!user) return unauthorizedResponse();

  try {
    const { frames, system, sessionContext } = JSON.parse(event.body || '{}');
    if (!Array.isArray(frames) || frames.length === 0) {
      return json(400, { error: 'Aucune image de session fournie' });
    }
    if (frames.length > MAX_FRAMES) {
      return json(400, { error: `Trop d'images (${MAX_FRAMES} maximum par analyse)` });
    }

    const content = [];
    frames.forEach((frame, i) => {
      if (!frame?.data) return;
      content.push({ type: 'text', text: `Image ${i + 1}${frame.timestampSec != null ? ` (t=${frame.timestampSec}s)` : ''} :` });
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: frame.mimeType || 'image/jpeg', data: frame.data },
      });
    });

    if (content.length === 0) return json(400, { error: 'Images invalides' });

    content.push({
      type: 'text',
      text: `Analyse ces ${frames.length} images extraites d'une vidéo de session d'équitation, dans l'ordre chronologique. ${sessionContext || ''}
Réponds STRICTEMENT en JSON valide, sans texte avant ni après, avec ce schéma exact :
{"summary": "compte-rendu oral de 4 à 6 phrases, chaleureux et concret, sans emoji, adapté à être lu à voix haute", "observations": [{"label": "description courte et factuelle de ce qui a été observé", "confidence": 0.0}]}
Ne décris que ce qui est réellement visible sur les images fournies. Si une image ne permet pas de juger un aspect (angle, flou, trop loin), ne l'invente pas — dis-le dans le compte-rendu plutôt que d'affirmer quelque chose de non observable.`,
    });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
        max_tokens: 1500,
        system: typeof system === 'string' ? system : '',
        messages: [{ role: 'user', content }],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Anthropic error:', data);
      return json(response.status, { error: data?.error?.message || 'Erreur Anthropic' });
    }

    const rawText = data.content?.[0]?.text || '{}';
    let parsed;
    try {
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      // Repli : si le modèle n'a pas produit un JSON strict, on garde au
      // moins le texte comme résumé plutôt que d'échouer complètement.
      parsed = { summary: rawText, observations: [] };
    }

    return json(200, {
      summary: String(parsed.summary || '').trim(),
      observations: Array.isArray(parsed.observations) ? parsed.observations : [],
    });
  } catch (error) {
    console.error(error);
    return json(500, { error: error.message || 'Erreur serveur' });
  }
}
