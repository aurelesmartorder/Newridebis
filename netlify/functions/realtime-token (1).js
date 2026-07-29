// Fonction serverless : délivre un jeton éphémère (courte durée de vie)
// pour que le navigateur se connecte DIRECTEMENT à l'API Realtime
// d'OpenAI en pair-à-pair (WebRTC) — sans faire transiter l'audio par ce
// serveur. C'est ce qui permet la faible latence et les interruptions
// naturelles d'une vraie conversation.
//
// La clé API standard (OPENAI_API_KEY) ne quitte jamais ce serveur : le
// navigateur ne reçoit que le jeton éphémère, valable quelques minutes et
// limité à une session de conversation.

import { verifyUser, unauthorizedResponse } from './verify-user.js';

const json = (statusCode, payload) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
});

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });
  if (!process.env.OPENAI_API_KEY) return json(500, { error: 'OPENAI_API_KEY non configurée' });

  // (SÉCURITÉ) même garde-fou que les autres fonctions IA.
  const user = await verifyUser(event);
  if (!user) return unauthorizedResponse();

  try {
    const { instructions } = JSON.parse(event.body || '{}');

    const sessionConfig = {
      session: {
        type: 'realtime',
        model: process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime-2.1',
        audio: {
          output: { voice: process.env.OPENAI_REALTIME_VOICE || 'marin' },
        },
        // Instructions = l'équivalent du "system" des autres fonctions :
        // persona + corpus équestre, construits côté client puis transmis
        // ici pour rester dans la même logique que coach-chat.js.
        instructions: typeof instructions === 'string' && instructions.trim()
          ? instructions
          : 'Tu es le coach vocal NewRide. Réponds en français, avec chaleur et précision.',
      },
    };

    const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        // Identifiant pseudonymisé de l'utilisateur, pas son email en clair
        // (bonne pratique recommandée par OpenAI pour les jetons éphémères).
        'OpenAI-Safety-Identifier': String(user.id || 'newride-user'),
      },
      body: JSON.stringify(sessionConfig),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('OpenAI Realtime token error:', data);
      return json(response.status, { error: data?.error?.message || 'Erreur de création du jeton' });
    }

    // On ne renvoie que ce dont le navigateur a besoin — pas l'objet complet
    // s'il contenait des détails superflus.
    return json(200, { value: data.value, expiresAt: data.expires_at });
  } catch (error) {
    console.error(error);
    return json(500, { error: error.message || 'Erreur serveur' });
  }
}
