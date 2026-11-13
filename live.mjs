// npm run live : synchronise avec GitHub toutes les 15 s et relance le serveur si son propre code change.
import { spawn, execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const git = (args) => new Promise((ok) => execFile('git', args, { cwd: root }, (err, out, errOut) => ok({ err, out: String(out).trim(), errOut: String(errOut).trim() })));
let child;
const start = () => {
  child = spawn(process.execPath, ['serve.mjs', '--watch'], { cwd: root, stdio: 'inherit' });
};
const restart = () => { console.log('Mise à jour du serveur : redémarrage…'); child.once('exit', start); child.kill(); };

async function sync() {
  const before = (await git(['rev-parse', 'HEAD'])).out;
  const pull = await git(['pull', '--ff-only', '--quiet']);
  if (pull.err) return console.error('Synchronisation impossible :', pull.errOut || pull.err.message);
  const after = (await git(['rev-parse', 'HEAD'])).out;
  if (before === after) return;
  const changed = (await git(['diff', '--name-only', before, after])).out.split('\n');
  console.log(`Mise à jour récupérée (${changed.length} fichier(s))`);
  if (changed.some((f) => /^(serve\.mjs|lib\/|api\/|package\.json)/.test(f))) restart();
}

await sync();
start();
setInterval(sync, 15000);
console.log('Synchronisation avec GitHub toutes les 15 s');
process.on('SIGINT', () => { child?.kill(); process.exit(0); });
