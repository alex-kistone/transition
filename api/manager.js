// Fonction Vercel : POST /api/manager → inscription d'un manager (Supabase + notification)
import { registerManager } from '../lib/manager.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false }); }
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
  const { status, body: out } = await registerManager(body);
  res.status(status).json(out);
}
