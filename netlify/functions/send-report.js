const json = (statusCode, payload) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
});

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#039;');

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });
  if (!process.env.RESEND_API_KEY) return json(500, { error: 'RESEND_API_KEY non configurée' });

  try {
    const { coachEmail, coachName, riderName, summary } = JSON.parse(event.body || '{}');
    if (!coachEmail || !summary) return json(400, { error: 'Email du coach ou résumé manquant' });

    const safeCoach = escapeHtml(coachName || 'Coach');
    const safeRider = escapeHtml(riderName || 'Votre élève');
    // summary est produit par l'application et peut contenir uniquement des <br/> ; tout le reste est neutralisé.
    const safeSummary = escapeHtml(summary).replaceAll('&lt;br/&gt;', '<br/>').replaceAll('&lt;br&gt;', '<br>');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.REPORT_FROM_EMAIL || 'NewRide <onboarding@resend.dev>',
        to: [coachEmail],
        subject: `Rapport NewRide — ${safeRider}`,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#222"><p>Bonjour ${safeCoach},</p><p>Voici le dernier résumé NewRide de ${safeRider}.</p><p>${safeSummary}</p><p>NewRide</p></div>`,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Resend error:', data);
      return json(response.status, { error: data?.message || 'Erreur Resend' });
    }
    return json(200, { ok: true, id: data.id });
  } catch (error) {
    console.error(error);
    return json(500, { error: error.message || 'Erreur serveur' });
  }
}
