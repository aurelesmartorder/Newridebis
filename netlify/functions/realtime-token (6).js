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
          {
            type: 'function',
            name: 'get_coaching_state',
            description: "Renvoie l'état réel de la stratégie pédagogique en cours : priorité active et sa justification, problèmes volontairement différés, densité de correction récente, dette de consolidation, besoin de récupération. Appelle cet outil avant de choisir quoi corriger — ne te fie jamais à ta seule mémoire de la conversation pour ça.",
            parameters: { type: 'object', properties: {}, required: [] },
          },
          {
            type: 'function',
            name: 'get_rider_profile',
            description: "Renvoie les préférences de coaching observées chez CE cavalier (comment il apprend le mieux), uniquement celles suffisamment confirmées par plusieurs échanges. Utilise ceci pour adapter ta façon de communiquer, JAMAIS pour poser un diagnostic psychologique.",
            parameters: { type: 'object', properties: {}, required: [] },
          },
          {
            type: 'function',
            name: 'record_rider_observation',
            description: "Enregistre une observation sur la façon dont CE cavalier réagit au coaching (pas un trait de personnalité, pas un diagnostic) — par exemple 'réagit mieux à une consigne orientée vers un effet extérieur qu'à une explication anatomique', ou 'a besoin d'être rassuré après un échec avant de continuer'. INTERDIT : toute formulation de type diagnostic ('anxieux', 'manque de confiance', 'introverti') ou trait de personnalité figé. Une seule observation ne suffit jamais à en tirer une conclusion — le système accumule la confiance au fil des séances.",
            parameters: {
              type: 'object',
              properties: {
                observation: { type: 'string', description: "Description factuelle et comportementale d'une préférence de coaching, jamais un jugement psychologique." },
                context: { type: 'string', description: 'Contexte dans lequel cette observation a été faite (ex: "après un échec", "exercice technique nouveau").' },
              },
              required: ['observation'],
            },
          },
          {
            type: 'function',
            name: 'get_progression_history',
            description: "Renvoie les compétences que ce cavalier a réellement acquises au fil du temps (avec la date), pas seulement l'état du jour. Utilise cet outil pour donner un vrai sentiment de progression — par exemple rappeler qu'une compétence travaillée il y a plusieurs semaines est maintenant consolidée — plutôt que de toujours parler comme si chaque séance repartait de zéro.",
            parameters: { type: 'object', properties: {}, required: [] },
          },
          {
            type: 'function',
            name: 'record_coaching_decision',
            description: "Enregistre la décision pédagogique que tu es en train de prendre AVANT de la formuler au cavalier. Le système applique ses propres règles (une seule priorité active à la fois, limite de densité de correction, gestion de la dette de consolidation) et peut ajuster ta proposition — utilise le résultat renvoyé pour formuler ta réponse, ne décide pas seul(e) dans ton texte.",
            parameters: {
              type: 'object',
              properties: {
                priority: { type: 'string', description: 'La priorité pédagogique unique sur laquelle tu veux agir maintenant (ex: "stabilité du regard", "relâchement des mains").' },
                rationale: { type: 'string', description: 'Pourquoi cette priorité, en une phrase courte.' },
                interventionType: { type: 'string', enum: ['correction', 'encouragement', 'question', 'silence'], description: 'Le type d\'intervention que tu comptes formuler.' },
                deferredIssues: { type: 'array', items: { type: 'string' }, description: 'Autres problèmes remarqués mais volontairement mis de côté pour l\'instant.' },
                skillBeingConsolidated: { type: 'string', description: 'Si cette intervention vise à stabiliser une compétence déjà améliorée mais pas encore fiable, nomme-la ici.' },
              },
              required: ['priority', 'interventionType'],
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
