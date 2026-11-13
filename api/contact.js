// Fonction Vercel : POST /api/contact → e-mail via Resend
import { sendContact } from '../lib/contact.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false }); }
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
  const { status, body: out } = await sendContact(body);
  res.status(status).json(out);
}
