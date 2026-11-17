// Inscription d'un manager de transition : enregistrement dans Supabase + e-mail de notification (Resend).
// Variables : SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (obligatoires), RESEND_API_KEY (pour la notification).
import { MANAGER_ROLES, AVAILABILITY, SECTORS } from '../src/options.mjs';
import { sendMail } from './mail.mjs';

const ROLE_LABEL = Object.fromEntries(MANAGER_ROLES);
const AVAIL_LABEL = Object.fromEntries(AVAILABILITY);
const str = (v, max = 300) => String(v ?? '').trim().slice(0, max);
const fail = (status, error) => ({ status, body: { ok: false, error } });

export function validateManager(input) {
  const d = input && typeof input === 'object' ? input : {};
  const m = {
    first_name: str(d.first_name, 100), last_name: str(d.last_name, 100),
    email: str(d.email, 200).toLowerCase(), phone: str(d.phone, 40), linkedin_url: str(d.linkedin_url, 300),
    role_slug: str(d.role_slug, 60), daily_rate: Number.parseInt(String(d.daily_rate ?? '').replace(/\s/g, ''), 10),
    availability: str(d.availability, 20), available_from: str(d.available_from, 10) || null,
    sectors: (Array.isArray(d.sectors) ? d.sectors : [d.sectors]).map((s) => str(s, 80)).filter((s) => SECTORS.includes(s)),
    message: str(d.message, 4000), consent: d.consent === true || d.consent === 'on' || d.consent === 'true',
    source: str(d.source, 200),
  };
  if (!m.first_name || !m.last_name) return { error: 'Merci d\'indiquer votre prénom et votre nom.' };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m.email)) return { error: 'Merci d\'indiquer une adresse e-mail valide.' };
  if (!ROLE_LABEL[m.role_slug]) return { error: 'Merci de choisir votre métier.' };
  if (!Number.isFinite(m.daily_rate) || m.daily_rate < 100 || m.daily_rate > 10000) return { error: 'Merci d\'indiquer un TJM entre 100 et 10 000 € HT.' };
  if (!AVAIL_LABEL[m.availability]) return { error: 'Merci d\'indiquer votre disponibilité.' };
  if (m.availability === 'date') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(m.available_from || '')) return { error: 'Merci d\'indiquer votre date de disponibilité.' };
  } else m.available_from = null;
  if (!m.sectors.length) return { error: 'Merci de choisir au moins un secteur d\'activité.' };
  if (m.linkedin_url && !/^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\//i.test(m.linkedin_url)) return { error: 'Le lien LinkedIn doit commencer par https://www.linkedin.com/' };
  if (!m.consent) return { error: 'Merci d\'accepter la conservation de vos informations.' };
  m.role = ROLE_LABEL[m.role_slug];
  return { manager: m };
}

export async function registerManager(input, env = process.env) {
  if (input && input._honey) return { status: 200, body: { ok: true } };   // robot : ignoré sans le dire
  const { manager: m, error } = validateManager(input);
  if (error) return fail(400, error);
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return fail(500, 'Inscription non configurée (Supabase manquant).');

  const r = await fetch(`${env.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/managers?on_conflict=email`, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(m),
  });
  if (!r.ok) {
    console.error('Supabase', r.status, await r.text().catch(() => ''));
    return fail(502, `L'enregistrement a échoué (${r.status}). Réessayez dans un instant.`);
  }

  // Notification (un échec d'e-mail n'annule pas l'inscription)
  await sendMail({
    subject: `Nouveau manager : ${m.first_name} ${m.last_name} · ${m.role}`,
    intro: 'Un manager de transition vient de s\'inscrire sur le site Kistone Transition :',
    replyTo: m.email,
    rows: [
      ['Nom', `${m.first_name} ${m.last_name}`], ['E-mail', m.email], ['Téléphone', m.phone], ['LinkedIn', m.linkedin_url],
      ['Métier', m.role], ['TJM', `${m.daily_rate} € HT / jour`],
      ['Disponibilité', m.availability === 'date' ? `À partir du ${m.available_from.split('-').reverse().join('/')}` : AVAIL_LABEL[m.availability]],
      ['Secteurs', m.sectors.join(', ')], ['Message', m.message],
    ],
  }, env).catch((e) => console.error('Notification', e));

  return { status: 200, body: { ok: true } };
}
