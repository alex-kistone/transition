// Envoi d'un e-mail récapitulatif (tableau clé / valeur) via Resend.
// Variables : RESEND_API_KEY (obligatoire), CONTACT_TO, CONTACT_FROM (facultatives).
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export async function sendMail({ subject, intro, rows, replyTo }, env = process.env) {
  if (!env.RESEND_API_KEY) return { ok: false, status: 500, error: 'Envoi non configuré (clé Resend manquante).' };
  const list = rows.filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '');
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px"><p style="margin:0 0 14px">${esc(intro)}</p><table style="border-collapse:collapse;background:#F5F1EA;border-radius:6px">${list.map(([k, v]) =>
    `<tr><td style="padding:8px 14px;color:#6B665F;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:8px 14px;color:#141312">${esc(v).replace(/\n/g, '<br>')}</td></tr>`).join('')}</table></div>`;
  const text = list.map(([k, v]) => `${k} : ${v}`).join('\n');
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.CONTACT_FROM || 'Kistone Transition <transition@kistone.fr>',
      to: [env.CONTACT_TO || 'aguego@kistone.fr'],
      subject, html, text, ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });
  if (!r.ok) {
    console.error('Resend', r.status, await r.text().catch(() => ''));
    return { ok: false, status: 502, error: `Le service d'envoi a refusé la demande (${r.status}).` };
  }
  return { ok: true, status: 200 };
}
