// Envoi des demandes de contact par e-mail via Resend (https://resend.com).
// Utilisé par le serveur local (serve.mjs) et par la fonction Vercel (api/contact.js).
// Variables d'environnement :
//   RESEND_API_KEY  (obligatoire) clé API Resend
//   CONTACT_TO      (facultatif)  destinataire, par défaut aguego@kistone.fr
//   CONTACT_FROM    (facultatif)  expéditeur, par défaut Kistone Transition <transition@kistone.fr>

const FIELDS = ['Nom', 'Entreprise', 'Téléphone', 'Fonction recherchée', 'Message', 'Formulaire', 'Page'];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export async function sendContact(input, env = process.env) {
  const data = input && typeof input === 'object' ? input : {};
  if (data._honey) return { status: 200, body: { ok: true } };            // robot : on ignore sans le dire
  const clean = Object.fromEntries(FIELDS.map((k) => [k, String(data[k] ?? '').trim().slice(0, 4000)]));
  if (!clean['Nom'] || !clean['Entreprise'] || !clean['Téléphone']) {
    return { status: 400, body: { ok: false, error: 'Merci de renseigner votre nom, votre entreprise et votre téléphone.' } };
  }
  if (!env.RESEND_API_KEY) {
    return { status: 500, body: { ok: false, error: 'Envoi non configuré (clé Resend manquante).' } };
  }
  const rows = FIELDS.filter((k) => clean[k]).map((k) =>
    `<tr><td style="padding:8px 14px;color:#6B665F;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:8px 14px;color:#141312">${esc(clean[k]).replace(/\n/g, '<br>')}</td></tr>`).join('');
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px"><p style="margin:0 0 14px">Nouvelle demande reçue sur le site Kistone Transition :</p><table style="border-collapse:collapse;background:#F5F1EA;border-radius:6px">${rows}</table></div>`;
  const text = FIELDS.filter((k) => clean[k]).map((k) => `${k} : ${clean[k]}`).join('\n');

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.CONTACT_FROM || 'Kistone Transition <transition@kistone.fr>',
      to: [env.CONTACT_TO || 'aguego@kistone.fr'],
      subject: `Nouvelle demande : ${clean['Fonction recherchée'] || 'contact'} · ${clean['Entreprise']}`,
      html, text,
    }),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => '');
    console.error('Resend', r.status, detail);
    return { status: 502, body: { ok: false, error: `Le service d'envoi a refusé la demande (${r.status}).` } };
  }
  return { status: 200, body: { ok: true } };
}
