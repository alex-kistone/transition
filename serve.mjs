// Serveur local sans dépendance.
//   npm run dev   → régénère les pages, sert le site sur http://localhost:3000 et recharge le navigateur à chaque modification
//   npm run live  → comme dev + synchronisation GitHub (voir live.mjs)
//   npm start     → sert le site, sans surveillance
// Autre port : PORT=4000 npm run dev
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { watch } from 'node:fs';
import { execFile } from 'node:child_process';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, existsSync } from 'node:fs';
import { sendContact } from './lib/contact.mjs';
import { registerManager } from './lib/manager.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
// Charge .env (clé Resend…) sans dépendance
const envFile = join(root, '.env');
if (existsSync(envFile)) for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
}
const port = Number(process.env.PORT) || 3000;
const dev = process.argv.includes('--watch');
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.json': 'application/json',
};
const blocked = /^\/(src|lib|api|node_modules|serve\.mjs|live\.mjs|build\.mjs|package\.json|\.env)/;
const clients = new Set();
const reloadScript = `<script>new EventSource('/__reload').onmessage = () => location.reload();</script>`;

async function resolve(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
  const base = join(root, clean);
  for (const p of [base, join(base, 'index.html'), base + '.html']) {
    try { if ((await stat(p)).isFile()) return p; } catch {}
  }
  return null;
}

createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  if (dev && path === '/__reload') {
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' });
    res.write(': ok\n\n'); clients.add(res); req.on('close', () => clients.delete(res));
    return;
  }
  const apiRoutes = { '/api/contact': sendContact, '/api/manager': registerManager };
  if (apiRoutes[path] && req.method === 'POST') {
    let raw = ''; for await (const chunk of req) raw += chunk;
    let data = {}; try { data = JSON.parse(raw || '{}'); } catch {}
    const { status, body } = await apiRoutes[path](data).catch((e) => (console.error(e), { status: 500, body: { ok: false, error: 'Erreur serveur' } }));
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify(body));
  }
  const file = blocked.test(path) ? null : await resolve(path);
  if (!file) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); return res.end('Page introuvable'); }
  let body = await readFile(file);
  if (dev && extname(file) === '.html') body = body.toString().replace('</body>', `${reloadScript}</body>`);
  res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache' });
  res.end(body);
}).listen(port, () => console.log(`Kistone Transition : http://localhost:${port}${dev ? ' (rechargement automatique)' : ''}`));

if (dev) {
  let timer;
  const notify = () => { for (const c of clients) c.write('data: reload\n\n'); };
  const rebuild = () => execFile(process.execPath, ['build.mjs'], { cwd: root }, (err, out, errOut) => {
    if (err) return console.error('Erreur de build :\n' + errOut);
    console.log(out.trim()); notify();
  });
  const onChange = (file) => {
    if (!file) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (/^(src[\\/]|build\.mjs$)/.test(file)) rebuild();          // contenu ou gabarits → régénère les pages
      else if (/\.(css|png|svg|webp|jpg)$/.test(file)) notify();     // styles ou images → recharge
    }, 120);
  };
  watch(root, { recursive: true }, (_e, f) => onChange(f));
}

