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
        // (NOUVEAU) Outils de pilotage d'un entraînement guidé — le modèle ne
        // les utilise que quand les instructions le placent en contexte de
        // séance guidée (voir buildGuidedRealtimeInstructions côté client).
        tools: [
          {
            type: 'function',
            name: 'get_live_sensor_data',
            description: "Renvoie les métriques capteur du cavalier au moment présent (vitesse, cadence, distance parcourue, durée de session). À utiliser chaque fois que le cavalier pose une question sur ses données actuelles, jamais deviner ces valeurs.",
            parameters: { type: 'object', properties: {}, required: [] },
          },
          {
            type: 'function',
            name: 'get_workout_status',
            description: "Renvoie la phase actuelle de l'entraînement guidé (nom, consigne, temps restant, position dans le programme). À utiliser avant toute affirmation sur l'état de la séance, jamais deviner.",
            parameters: { type: 'object', properties: {}, required: [] },
          },
          {
            type: 'function',
            name: 'start_workout_clock',
            description: "Démarre le chronomètre de la première phase, une fois que le cavalier a confirmé qu'il est prêt à commencer.",
            parameters: { type: 'object', properties: {}, required: [] },
          },
          {
            type: 'function',
            name: 'advance_to_next_phase',
            description: "Passe à la phase suivante de l'entraînement, une fois que le cavalier a decrit son ressenti sur la phase qui vient de se terminer et confirmé qu'il est prêt à continuer. Peut adapter la durée ou la consigne de la phase suivante si le ressenti du cavalier le justifie (fatigue, douleur, facilité).",
            parameters: {
              type: 'object',
              properties: {
                adaptedMinutes: { type: 'number', description: 'Nouvelle durée en minutes pour la phase suivante, si elle doit être raccourcie ou allongée. Omettre si aucun changement.' },
                adaptedInstruction: { type: 'string', description: "Consigne modifiée pour la phase suivante, si elle doit être adaptée. Omettre si aucun changement." },
              },
              required: [],
            },
          },
          {
            type: 'function',
            name: 'end_workout',
            description: "Termine l'entraînement guidé, que ce soit une fin normale après la dernière phase ou un arrêt anticipé demandé par le cavalier.",
            parameters: { type: 'object', properties: {}, required: [] },
          },
          {
            type: 'function',
            name: 'describe_recent_post',
            description: "Décrit réellement le contenu visuel d'une publication récente du cavalier sur le fil social (pas seulement sa légende). À utiliser si le cavalier mentionne une photo qu'il a postée, ou si tu veux la commenter toi-même. Index 0 = la plus récente.",
            parameters: {
              type: 'object',
              properties: { postIndex: { type: 'integer', description: 'Position de la publication parmi les récentes (0 = la plus récente).' } },
              required: [],
            },
          },
        ],
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
