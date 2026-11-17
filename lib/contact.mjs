// Envoi des demandes de contact par e-mail via Resend (https://resend.com).
// Utilisé par le serveur local (serve.mjs) et par la fonction Vercel (api/contact.js).
// Variables d'environnement :
//   RESEND_API_KEY  (obligatoire) clé API Resend
//   CONTACT_TO      (facultatif)  destinataire, par défaut aguego@kistone.fr
//   CONTACT_FROM    (facultatif)  expéditeur, par défaut Kistone Transition <transition@kistone.fr>

import { sendMail } from './mail.mjs';

const FIELDS = ['Nom', 'Entreprise', 'Téléphone', 'Fonction recherchée', 'Message', 'Formulaire', 'Page'];

export async function sendContact(input, env = process.env) {
  const data = input && typeof input === 'object' ? input : {};
  if (data._honey) return { status: 200, body: { ok: true } };            // robot : on ignore sans le dire
  const clean = Object.fromEntries(FIELDS.map((k) => [k, String(data[k] ?? '').trim().slice(0, 4000)]));
  if (!clean['Nom'] || !clean['Entreprise'] || !clean['Téléphone']) {
    return { status: 400, body: { ok: false, error: 'Merci de renseigner votre nom, votre entreprise et votre téléphone.' } };
  }
  const sent = await sendMail({
    subject: `Nouvelle demande : ${clean['Fonction recherchée'] || 'contact'} · ${clean['Entreprise']}`,
    intro: 'Nouvelle demande reçue sur le site Kistone Transition :',
    rows: FIELDS.map((k) => [k, clean[k]]),
  }, env);
  if (!sent.ok) return { status: sent.status, body: { ok: false, error: sent.error } };
  return { status: 200, body: { ok: true } };
}
