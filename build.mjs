// Génère index.html et poste-<slug>.html (version « cabinet », accent vert pastel)
// Usage : node build.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { roles, icons } from './src/data.mjs';
import { MANAGER_ROLES, AVAILABILITY, SECTORS } from './src/options.mjs';

const BRAND = 'Kistone Transition';
// Photos et vidéo (facultatives) : déposer les fichiers dans assets/photos/ puis `node build.mjs`.
//  - fiche de poste : assets/photos/<slug>.jpg, sinon la photo de sa catégorie (bureau, usine, entrepot, chantier)
//  - méthodologie : assets/photos/methodologie.mp4 (vidéo en fond) et/ou methodologie.jpg (image ou affiche de la vidéo)
const PHOTO_CATEGORY = { 'logistique': 'entrepot', 'operations-industrielles': 'usine', 'rse': 'chantier' };
const asset = (name) => existsSync(new URL(`assets/photos/${name}`, import.meta.url)) ? `assets/photos/${name}` : null;
const SITUATION_FILES = ['vacance', 'crise', 'transformation', 'croissance', 'capital', 'retournement'];
const rolePhoto = (r) => asset(`${r.slug}.jpg`) || asset(`${PHOTO_CATEGORY[r.slug] || 'bureau'}.jpg`);
const mediaBg = (img, video) => {
  if (!img && !video) return '';
  return `<div class="media-bg" aria-hidden="true">${video
    ? `<video autoplay muted loop playsinline preload="metadata"${img ? ` poster="${img}"` : ''}><source src="${video}" type="video/mp4"></video>`
    : `<img src="${img}" alt="" loading="lazy">`}</div>`;
};
// Les formulaires sont envoyés à /api/contact (lib/contact.mjs → Resend). Destinataire : CONTACT_TO, par défaut aguego@kistone.fr.
const FORM_ENDPOINT = '/api/contact';
const out = new URL('./', import.meta.url);
const boltSvg = readFileSync(new URL('assets/bolt.svg', import.meta.url), 'utf8')
  .replace(/<\?xml[^>]*>\s*/, '').replace(/<title>.*?<\/title>/, '')
  .replace(/fill="#0A0A0A"/, 'fill="currentColor"')
  .replace(/width="\d+" height="\d+"/, 'aria-hidden="true"');
const wm = (style, cls = '') => `<div class="watermark ${cls}" style="${style}">${boltSvg}</div>`;
const svg = (paths, size = 22) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const check = `<svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5" stroke-width="1.6"/><path d="m8 12.3 2.7 2.7L16.2 9.5"/></svg>`;
const lock = svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', 15);
const arrowR = svg('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>', 18);
const href = (r) => `poste-${r.slug}.html`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const head = (title, desc) => `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="icon" href="assets/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="assets/favicon-180.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600&family=Geist:wght@400;500;600&family=Geist+Mono:wght@500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
</head>
<body>`;

const header = `
<header class="header"><div class="wrap">
  <a class="logo" href="./" aria-label="${BRAND}, accueil"><img src="assets/logo-full-black.png" alt="kistone"><span>Management<br>de transition</span></a>
  <nav class="menu" aria-label="Navigation principale">
    <a href="./#cabinet">Le cabinet</a>
    <a href="./#expertises">Expertises</a>
    <a href="./#methodologie">Méthodologie</a>
    <a href="./#garanties">Garanties</a>
    <a href="./#faq">Questions</a>
  </nav>
  <a class="nav-join" href="inscription-manager">Vous êtes manager ?</a>
  <a class="btn btn-dark btn-sm" href="./#contact">Trouver un manager</a>
  <button class="burger" type="button" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="mobile-menu"><span></span><span></span><span></span></button>
</div>
<nav class="mobile-menu" id="mobile-menu" aria-label="Menu mobile" hidden>
  <a href="./#cabinet">Le cabinet</a>
  <a href="./#expertises">Expertises</a>
  <a href="./#methodologie">Méthodologie</a>
  <a href="./#garanties">Garanties</a>
  <a href="./#faq">Questions</a>
  <a href="inscription-manager">Vous êtes manager ? Rejoindre le réseau</a>
  <a class="btn btn-dark btn-block" href="./#contact">Trouver un manager</a>
</nav>
</header>`;

const callback = (title, sub, selected, compact = false) => {
  const k = `${selected || 'x'}${compact ? 's' : ''}`;
  return `
<div class="callback">
  <h3>${title}</h3>
  <p>${sub}</p>
  <form data-contact class="fields ${compact ? '' : 'two'}" data-source="${esc(title)}">
    <div class="field"><label for="n-${k}">Nom et prénom</label><input id="n-${k}" name="Nom" autocomplete="name" required></div>
    <div class="field"><label for="c-${k}">Entreprise</label><input id="c-${k}" name="Entreprise" autocomplete="organization" required></div>
    <div class="field"><label for="t-${k}">Téléphone</label><input id="t-${k}" name="Téléphone" type="tel" autocomplete="tel" required></div>
    <div class="field"><label for="f-${k}">Fonction recherchée</label><select id="f-${k}" name="Fonction recherchée">${roles.map((r) => `<option${r.slug === selected ? ' selected' : ''}>${r.short}</option>`).join('')}<option>Autre</option></select></div>
    ${compact ? '' : `<div class="field full"><label for="m-${k}">Votre situation, en quelques mots</label><textarea id="m-${k}" name="Message" placeholder="Contexte, urgence, durée envisagée, localisation…"></textarea></div>`}
    <input type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true" class="hp">
    <div class="${compact ? '' : 'full'}"><button class="btn btn-green btn-block" type="submit">Être rappelé·e par un associé</button></div>
  </form>
  <div class="form-ok" role="status">Merci. Un associé vous rappelle sous 24 h ouvrées.</div>
  <div class="form-err" role="alert">L'envoi n'a pas abouti. Réessayez dans un instant.</div>
  <div class="secure">${lock} Échange strictement confidentiel. Réponse sous 24 h ouvrées.</div>
</div>`;
};

const footer = `
<footer class="footer"><div class="wrap">
  <div class="footer-cols">
    <div>
      <a class="logo" href="./"><img src="assets/logo-full-white.png" alt="kistone"></a>
      <p style="color:var(--text);margin-top:18px;max-width:320px">Cabinet de management de transition. Des dirigeants expérimentés pour la direction générale et les fonctions clés des PME, ETI et groupes.</p>
    </div>
    <div><h4>Expertises</h4><ul>${roles.slice(0, 5).map((r) => `<li><a href="${href(r)}">${r.short}</a></li>`).join('')}</ul></div>
    <div><h4>&nbsp;</h4><ul>${roles.slice(5).map((r) => `<li><a href="${href(r)}">${r.short}</a></li>`).join('')}</ul></div>
    <div><h4>Contact</h4><ul><li><a href="./#contact">Trouver un manager</a></li><li><a href="./#faq">Questions fréquentes</a></li><li><a href="inscription-manager">Devenir manager de transition</a></li></ul></div>
  </div>
  <div class="footer-legal"><span>© 2026 ${BRAND}</span><span>[Mentions légales] · [Politique de confidentialité]</span></div>
</div></footer>
<script>
(() => {
  const burger = document.querySelector('.burger'), menu = document.getElementById('mobile-menu');
  const set = (open) => { burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu'); menu.hidden = !open; document.body.classList.toggle('menu-open', open); };
  burger.addEventListener('click', () => set(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  addEventListener('resize', () => { if (innerWidth > 1080) set(false); });
})();
document.querySelectorAll('form[data-contact]').forEach((f) => f.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = f.querySelector('button[type=submit]');
  const label = btn.textContent;
  btn.disabled = true; btn.textContent = 'Envoi en cours…'; f.classList.remove('error');
  const data = Object.fromEntries(new FormData(f));
  data['Formulaire'] = f.dataset.source;
  data['Page'] = document.title;
  try {
    const r = await fetch(${JSON.stringify(FORM_ENDPOINT)}, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) throw new Error(j.error || ('HTTP ' + r.status));
    f.classList.add('sent'); btn.textContent = 'Demande envoyée';
  } catch (err) {
    console.error('Envoi du formulaire :', err);
    const box = f.parentElement.querySelector('.form-err');
    box.textContent = 'L’envoi n’a pas abouti : ' + (err && err.message || 'erreur réseau') + ' Réessayez dans un instant.';
    f.classList.add('error'); btn.disabled = false; btn.textContent = label;
  }
}));
</script>
</body>
</html>
`;

function home() {
  const situations = [
    ['Vacance', 'Départ soudain d\'un dirigeant', 'La fonction ne peut pas rester vide le temps d\'un recrutement. Nous assurons la continuité dès la semaine suivante.'],
    ['Crise', 'Situation financière ou sociale tendue', 'Trésorerie, perte d\'un client majeur, climat social : un manager qui a déjà traversé ces situations.'],
    ['Transformation', 'Un projet structurant à faire aboutir', 'Réorganisation, ERP, CSRD, nouveau site : un pilote dédié, avec un mandat et une échéance.'],
    ['Croissance', 'Un changement d\'échelle', 'Structurer une fonction, professionnaliser une équipe, préparer l\'arrivée d\'un dirigeant permanent.'],
    ['Opérations de capital', 'Acquisition, cession, LBO', 'Sécuriser l\'opération, rassurer les investisseurs, réussir l\'intégration.'],
    ['Retournement', 'Une performance qui décroche', 'Diagnostic rapide, plan de redressement, exécution jusqu\'aux résultats.'],
  ];
  const steps = [
    ['J0', 'Cadrage', 'Un associé du cabinet qualifie avec vous la situation, le mandat et les objectifs. Échange confidentiel de 30 minutes.'],
    ['J+2', 'Présentation', 'Nous vous présentons une short-list de managers ayant déjà mené des missions comparables, références vérifiées.'],
    ['J+7', 'Prise de fonction', 'Lettre de mission, objectifs écrits, contrat tripartite. Le manager prend ses fonctions.'],
    ['Pendant la mission', 'Suivi et passation', 'Points réguliers avec l\'associé référent, bilan des objectifs, passation organisée au successeur.'],
  ];
  const guarantees = [
    ['<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', 'Confidentialité', 'Chaque mission est couverte par un engagement de confidentialité, dès le premier échange.'],
    ['<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>', 'Références vérifiées', 'Chaque manager présenté a été rencontré par un associé et ses références contrôlées.'],
    ['<path d="M4 12a8 8 0 0 1 14-5.3"/><path d="M18 3v4h-4"/><path d="M20 12a8 8 0 0 1-14 5.3"/><path d="M6 21v-4h4"/>', 'Continuité garantie', 'Si la mission l\'exige, nous assurons le remplacement du manager dans les meilleurs délais.'],
    ['<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M10 13h6M10 17h6"/>', 'Cadre contractuel clair', 'Contrat tripartite, lettre de mission et objectifs écrits. Vous savez ce que vous achetez.'],
    ['<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.6 7-5.6s6.2 2 7 5.6"/>', 'Un associé référent', 'Un interlocuteur unique au cabinet, du cadrage à la fin de mission.'],
    ['<path d="M4 19h16"/><path d="M6 15l4-4 3 3 5-6"/>', 'Résultats mesurés', 'Des points d\'étape réguliers avec vous, sur des objectifs définis ensemble dès le départ.'],
  ];
  const faq = [
    ['Qu\'est-ce qu\'un manager de transition ?', 'Un dirigeant ou un cadre supérieur expérimenté, indépendant, qui prend une fonction de direction pour une durée limitée. Il est opérationnel dès son arrivée, porte un mandat clair et quitte l\'entreprise une fois la mission accomplie.'],
    ['Sous quel délai un manager peut-il intervenir ?', 'Nous présentons une short-list sous 48 heures. Après vos entretiens, la prise de fonction intervient généralement en moins d\'une semaine.'],
    ['Quelle différence avec un cabinet de conseil ?', 'Le consultant analyse et recommande. Le manager de transition occupe la fonction : il décide, encadre les équipes et répond des résultats.'],
    ['Comment la mission est-elle encadrée ?', 'Par un contrat tripartite entre votre entreprise, le cabinet et le manager, une lettre de mission et des objectifs écrits. Un associé du cabinet suit la mission jusqu\'à son terme.'],
    ['Comment la mission est-elle facturée ?', 'Au jour d\'intervention, selon la fonction, la séniorité et le contexte. Le tarif est fixé avec vous lors du cadrage : [TJM indicatif à préciser].'],
    ['Le manager peut-il être recruté à l\'issue de la mission ?', 'Oui, lorsque la situation s\'y prête. Les conditions sont prévues dès le départ dans le contrat.'],
  ];

  return `${head(`${BRAND} · Cabinet de management de transition`, 'Cabinet de management de transition : des dirigeants expérimentés pour la direction générale et les fonctions clés, en poste sous une semaine.')}
${header}
<main>
<section class="hero on-dark">
  ${wm('width:560px;height:920px;right:-120px;top:-160px;transform:rotate(12deg)')}
  <div class="wrap">
    <div>
      <span class="kicker">Cabinet de management de transition</span>
      <h1>Des dirigeants d'expérience pour <em>les moments décisifs</em> de votre entreprise.</h1>
      <p class="lead">Direction générale, finance, ressources humaines, opérations : nous mettons à votre disposition des managers de transition confirmés, en poste sous une semaine, avec un mandat et des objectifs clairs.</p>
      <div class="hero-actions">
        <a class="btn btn-green" href="#contact">Trouver un manager</a>
        <a class="btn btn-line" href="#expertises">Nos expertises</a>
      </div>
      <div class="hero-proof">
        <span>${check} Managers rencontrés et références vérifiées</span>
        <span>${check} Un associé référent par mission</span>
        <span>${check} Confidentialité absolue</span>
      </div>
    </div>
    ${callback('Être rappelé·e par un associé', 'Décrivez votre besoin. Nous revenons vers vous sous 24 h ouvrées.', '', true)}
  </div>
</section>

<section class="facts" aria-label="Nos engagements"><div class="wrap">
  <div class="fact"><b>48<small>h</small></b><span>pour vous présenter une short-list de managers</span></div>
  <div class="fact"><b>1<small>sem.</small></b><span>pour la prise de fonction du manager retenu</span></div>
  <div class="fact"><b>30<small>min</small></b><span>d'échange avec un associé pour cadrer votre besoin</span></div>
  <div class="fact"><b>10<small>fonctions</small></b><span>de direction couvertes par le cabinet</span></div>
</div></section>

<section class="sec" id="cabinet"><div class="wrap" style="position:relative">
  <div class="about">
    <div>
      <span class="kicker">Le cabinet</span>
      <h2 style="margin-top:18px">L'expertise d'un dirigeant, le réseau d'un cabinet.</h2>
      <figure class="portrait"><img src="assets/alexandre-guego.jpg" alt="Alexandre Guégo, associé fondateur" width="900" height="1349" loading="lazy"></figure>
    </div>
    <div class="about-text">
      <p>Quand une fonction clé se libère ou qu'une situation se tend, le temps joue contre l'entreprise. Notre métier : y répondre en quelques jours, avec la bonne personne.</p>
      <p>Nous accompagnons les dirigeants, actionnaires et conseils d'administration de PME, d'ETI et de groupes. Chaque mission est confiée à un manager qui a déjà mené des situations comparables, et suivie par un associé du cabinet jusqu'à son terme.</p>
      <p>Notre réseau réunit d'anciens directeurs généraux, directeurs financiers, DRH, directeurs industriels et directeurs des systèmes d'information, sélectionnés pour leur expérience, leur sens de l'engagement et leur discrétion.</p>
      <div class="signature"><div><b>Alexandre Guégo</b><span>Associé fondateur</span></div></div>
    </div>
  </div>
  <div class="values"><span class="kicker">Nos valeurs</span></div>
  <div class="pillars">
    <div class="pillar"><span class="num">01</span><h3>Réactivité</h3><p>Une short-list sous 48 heures et un manager en poste sous une semaine, quand chaque jour compte.</p></div>
    <div class="pillar"><span class="num">02</span><h3>Engagement</h3><p>Un mandat, des objectifs datés, une obligation de rendre compte à chaque étape.</p></div>
    <div class="pillar"><span class="num">03</span><h3>Discrétion</h3><p>Une intervention confidentielle, respectueuse de vos équipes et de vos partenaires.</p></div>
  </div>
</div></section>

<section class="sec sec-paper" id="expertises"><div class="wrap">
  <div class="sec-head">
    <div><span class="kicker">Nos expertises</span><h2>Nos domaines d'intervention.</h2></div>
    <p class="lead">Pour chaque fonction : le contexte d'intervention, les missions confiées, les livrables attendus et le profil des managers que nous présentons.</p>
  </div>
  <div class="xp-list">
    ${roles.map((r, i) => `<a class="xp-row" href="${href(r)}">
      <span class="xp-n">${String(i + 1).padStart(2, '0')}</span>
      <div class="xp-title"><h3>${r.short}</h3><span>${r.label.split(' · ').slice(0, 3).join(' · ')}</span></div>
      <p>${r.pitch}</p>
      <div class="xp-dur"><b>Durée indicative</b>${r.duree}</div>
      <span class="xp-go" aria-hidden="true">${arrowR}</span>
    </a>`).join('')}
  </div>
</div></section>

<section class="sec" id="situations"><div class="wrap">
  <div class="sec-head">
    <div><span class="kicker">Quand intervenir</span><h2>Nos typologies de missions.</h2></div>
    <p class="lead">Un recrutement prend plusieurs mois. Une intervention de transition permet de sécuriser la fonction immédiatement, sans compromettre le recrutement définitif.</p>
  </div>
  <div class="grid-lines">
    ${situations.map(([t, h, p], i) => {
      const img = asset(`situation-${SITUATION_FILES[i]}.jpg`);
      return `<div class="${img ? 'has-photo' : ''}">${img ? `<img class="sit-photo" src="${img}" alt="" loading="lazy">` : ''}<span class="tag">${t}</span><h3>${h}</h3><p>${p}</p></div>`;
    }).join('')}
  </div>
</div></section>

<section class="sec sec-dark on-dark${asset('methodologie.mp4') || asset('methodologie.jpg') ? ' has-media' : ''}" id="methodologie">
  ${mediaBg(asset('methodologie.jpg'), asset('methodologie.mp4'))}
  ${wm('width:420px;height:690px;left:-140px;bottom:-260px;transform:rotate(-12deg)')}
  <div class="wrap">
    <div class="sec-head">
      <div><span class="kicker">Notre méthodologie</span><h2>Du premier appel à la passation, un cadre éprouvé.</h2></div>
      <p class="lead">Quatre étapes, un associé référent, des objectifs écrits. Vous gardez la maîtrise de chaque décision.</p>
    </div>
    <div class="steps">
      ${steps.map(([d, t, p], i) => `<div class="step"><div class="step-head"><span class="step-dot">0${i + 1}</span></div><span class="when">${d}</span><h3>${t}</h3><p>${p}</p></div>`).join('')}
    </div>
  </div>
</section>

<section class="sec" id="garanties"><div class="wrap">
  <div class="sec-head">
    <div><span class="kicker">Nos garanties</span><h2>Ce sur quoi vous pouvez compter.</h2></div>
    <p class="lead">Confier une fonction de direction à un intervenant extérieur demande de la confiance. Voici nos engagements.</p>
  </div>
  <div class="guarantees">
    ${guarantees.map(([ic, t, p]) => `<div class="guarantee"><span class="g-icon">${svg(ic)}</span><h3>${t}</h3><p>${p}</p></div>`).join('')}
  </div>
</div></section>

<section class="sec join-band" id="managers"><div class="wrap join-inner">
  <div>
    <span class="kicker">Vous êtes manager de transition</span>
    <h2 style="margin-top:18px">Rejoignez notre réseau de dirigeants.</h2>
    <p class="lead" style="margin-top:16px">Des missions qualifiées par un associé, un cadre contractuel géré par le cabinet, un interlocuteur unique pendant toute la mission.</p>
  </div>
  <a class="btn btn-dark" href="inscription-manager">Rejoindre le réseau ${arrowR}</a>
</div></section>

<section class="sec sec-paper" id="faq"><div class="wrap">
  <div class="faq-grid">
    <div class="faq-side">
      <span class="kicker">Questions fréquentes</span>
      <h2>Vos questions, nos réponses.</h2>
      <p class="lead">Une question sur votre situation ? Un associé vous répond directement.</p>
      <div><a class="arrow-link" href="#contact">Poser une question ${arrowR}</a></div>
    </div>
    <div class="faq">
      ${faq.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${q}</summary><div class="answer">${a}</div></details>`).join('')}
    </div>
  </div>
</div></section>

<section class="sec sec-dark on-dark" id="contact">
  ${wm('width:380px;height:620px;right:-100px;top:-120px;transform:rotate(14deg)')}
  <div class="wrap contact">
    <div>
      <span class="kicker">Contact</span>
      <h2 style="margin-top:18px">Parlons de votre situation, en toute confidentialité.</h2>
      <p class="lead" style="margin-top:20px">Un associé du cabinet vous rappelle pour comprendre votre contexte et vous proposer, le cas échéant, une short-list sous 48 heures.</p>
      <ul class="contact-list">
        <li>${check}<div><b>Confidentiel</b>Votre demande n'est lue que par un associé du cabinet</div></li>
        <li>${check}<div><b>Rappel sous 24 h ouvrées</b>Pour comprendre votre contexte et vos enjeux</div></li>
        <li>${check}<div><b>Short-list sous 48 heures</b>Des managers ayant déjà mené des missions comparables</div></li>
      </ul>
    </div>
    ${callback('Trouver un manager', 'Tous les champs sont confidentiels et ne servent qu\'à préparer notre échange.', '')}
  </div>
</section>
</main>
${footer}`;
}

function job(r, i) {
  const others = roles.filter((x) => x.slug !== r.slug);
  return `${head(`${r.title} · ${BRAND}`, `Fiche de poste : ${r.title}. ${r.pitch}`)}
${header}
<main>
<section class="job-head on-dark${rolePhoto(r) ? ' has-media' : ''}">
  ${mediaBg(rolePhoto(r))}
  ${wm('width:420px;height:690px;right:-60px;top:-140px;transform:rotate(12deg)')}
  <div class="wrap">
    <nav class="crumbs" aria-label="Fil d'Ariane"><a href="./">Accueil</a><span>/</span><a href="./#expertises">Expertises</a><span>/</span><span style="color:var(--cream)">${r.short}</span></nav>
    <h1>${r.title}</h1>
    <p class="lead">${r.pitch}</p>
    <div class="job-meta">
      <div><b>Rattachement</b>${r.rattachement}</div>
      <div><b>Durée indicative</b>${r.duree}</div>
      <div><b>Prise de fonction</b>Sous une semaine</div>
      <div><b>Format</b>Temps plein ou partagé</div>
    </div>
  </div>
</section>

<div class="wrap job-body">
  <nav class="toc" aria-label="Sommaire">
    <b>Sommaire</b>
    <a href="#contexte">Contexte</a>
    <a href="#situations">Situations types</a>
    <a href="#missions">Missions</a>
    <a href="#livrables">Livrables</a>
    <a href="#profil">Profil</a>
  </nav>
  <div class="doc">
    <section id="contexte"><span class="s-num">01</span><h2>Contexte de l'intervention</h2><p>${r.context}</p></section>
    <section id="situations"><span class="s-num">02</span><h2>Situations types</h2><div class="chips">${r.situations.map((s) => `<span>${s}</span>`).join('')}</div></section>
    <section id="missions"><span class="s-num">03</span><h2>Missions confiées</h2><ol class="olist">${r.missions.map((m) => `<li><span>${m}</span></li>`).join('')}</ol></section>
    <section id="livrables"><span class="s-num">04</span><h2>Livrables attendus</h2>
      <div class="deliverables">${r.livrables.map((l) => `<div>${check}<span>${l}</span></div>`).join('')}</div>
    </section>
    <section id="profil"><span class="s-num">05</span><h2>Profil des managers présentés</h2><ul class="ulist">${r.profil.map((p) => `<li>${check}<span>${p}</span></li>`).join('')}</ul></section>
  </div>
  <aside class="side">
    ${callback('Recevoir des profils', 'Short-list de managers sous 48 heures.', r.slug, true)}
    <div class="side-box">
      <b>Préférez-vous en parler ?</b>
      <span>Laissez votre numéro dans le formulaire : un associé vous rappelle sous 24 h ouvrées.</span>
      <button class="btn btn-line btn-sm" type="button" onclick="window.print()">Imprimer la fiche</button>
    </div>
  </aside>
</div>

<section class="sec others-sec" style="padding-top:48px"><div class="wrap">
  <span class="kicker">Autres expertises</span>
  <div class="others" style="margin-top:24px">${others.map((x) => `<a href="${href(x)}"><span>${x.short}</span><small>${x.duree}</small></a>`).join('')}</div>
</div></section>
</main>
${footer}`;
}

function managerPage() {
  return `${head(`Rejoindre le réseau · ${BRAND}`, 'Managers de transition : inscrivez-vous dans le réseau Kistone Transition (métier, TJM, disponibilité, secteurs).')}
${header}
<main>
<section class="signup-head on-dark">
  ${wm('width:420px;height:690px;right:-60px;top:-160px;transform:rotate(12deg)')}
  <div class="wrap">
    <nav class="crumbs" aria-label="Fil d'Ariane"><a href="./">Accueil</a><span>/</span><span style="color:var(--cream)">Rejoindre le réseau</span></nav>
    <span class="kicker" style="margin-top:28px">Espace managers</span>
    <h1>Rejoignez le réseau Kistone Transition.</h1>
    <p class="lead">Inscrivez-vous en deux minutes. Nous vous proposons des missions qui correspondent à votre expertise, à votre TJM et à votre disponibilité.</p>
  </div>
</section>
<div class="wrap signup">
  <aside class="signup-side">
    <h2>Pourquoi nous rejoindre ?</h2>
    <ul class="ulist">
      <li>${check}<span><b>Des missions qualifiées.</b> Chaque besoin est cadré par un associé avant de vous être proposé.</span></li>
      <li>${check}<span><b>Un cadre clair.</b> Contrat tripartite, lettre de mission et facturation gérés par le cabinet.</span></li>
      <li>${check}<span><b>Un interlocuteur unique</b> du premier échange jusqu'à la passation.</span></li>
      <li>${check}<span><b>Confidentialité.</b> Votre profil n'est jamais diffusé sans votre accord.</span></li>
    </ul>
  </aside>
  <div class="callback signup-card">
    <form id="manager-form" class="fields two" novalidate>
      <div class="field"><label for="m-first">Prénom</label><input id="m-first" name="first_name" autocomplete="given-name" required></div>
      <div class="field"><label for="m-last">Nom</label><input id="m-last" name="last_name" autocomplete="family-name" required></div>
      <div class="field"><label for="m-email">E-mail</label><input id="m-email" name="email" type="email" autocomplete="email" required></div>
      <div class="field"><label for="m-phone">Téléphone <small>(facultatif)</small></label><input id="m-phone" name="phone" type="tel" autocomplete="tel"></div>
      <div class="field full"><label for="m-linkedin">Profil LinkedIn <small>(facultatif)</small></label><input id="m-linkedin" name="linkedin_url" type="url" placeholder="https://www.linkedin.com/in/…" autocomplete="url"></div>
      <div class="field full"><label for="m-role">Métier</label><select id="m-role" name="role_slug" required><option value="">Choisissez votre métier</option>${MANAGER_ROLES.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('')}</select></div>
      <div class="field"><label for="m-rate">TJM souhaité</label><div class="suffix"><input id="m-rate" name="daily_rate" type="number" inputmode="numeric" min="100" max="10000" step="50" placeholder="1 200" required><span>€ HT / jour</span></div></div>
      <div class="field"><label for="m-avail">Disponibilité</label><select id="m-avail" name="availability" required><option value="">Choisissez</option>${AVAILABILITY.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('')}</select></div>
      <div class="field full" id="m-date-wrap" hidden><label for="m-date">Disponible à partir du</label><input id="m-date" name="available_from" type="date"></div>
      <fieldset class="field full sectors"><legend>Secteurs d'activité <small>(un ou plusieurs)</small></legend>
        <div class="chips-check">${SECTORS.map((sct, k) => `<label><input type="checkbox" name="sectors" value="${esc(sct)}"><span>${esc(sct)}</span></label>`).join('')}</div>
      </fieldset>
      <div class="field full"><label for="m-msg">Votre parcours en quelques mots <small>(facultatif)</small></label><textarea id="m-msg" name="message" placeholder="Dernières fonctions, missions de transition menées, zone géographique…"></textarea></div>
      <label class="consent full"><input type="checkbox" name="consent" required><span>J'accepte que Kistone Transition conserve ces informations pour me proposer des missions. Je peux demander leur modification ou leur suppression à tout moment.</span></label>
      <input type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true" class="hp">
      <div class="full"><button class="btn btn-green btn-block" type="submit">Rejoindre le réseau</button></div>
      <div class="form-err full" role="alert"></div>
    </form>
    <div class="form-success" id="m-success" hidden>
      <span class="g-icon">${svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>')}</span>
      <h3>Merci, votre inscription est enregistrée.</h3>
      <p>Un associé du cabinet prendra contact avec vous dès qu'une mission correspond à votre profil. Vous pouvez mettre à jour vos informations à tout moment en renvoyant ce formulaire avec la même adresse e-mail.</p>
      <a class="arrow-link" href="./">Retour à l'accueil ${arrowR}</a>
    </div>
  </div>
</div>
</main>
<script>
(() => {
  const f = document.getElementById('manager-form'), avail = f.elements.availability, dateWrap = document.getElementById('m-date-wrap');
  avail.addEventListener('change', () => { dateWrap.hidden = avail.value !== 'date'; f.elements.available_from.required = avail.value === 'date'; });
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = f.querySelector('.form-err'), btn = f.querySelector('button[type=submit]');
    f.classList.remove('error');
    const fd = new FormData(f);
    const data = Object.fromEntries(fd);
    data.sectors = fd.getAll('sectors'); data.consent = fd.has('consent'); data.source = 'transition.kistone.fr';
    const show = (m) => { err.textContent = m; f.classList.add('error'); err.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); };
    if (!f.checkValidity()) { f.reportValidity(); return; }
    if (!data.sectors.length) return show('Merci de choisir au moins un secteur d’activité.');
    btn.disabled = true; const label = btn.textContent; btn.textContent = 'Envoi en cours…';
    try {
      const r = await fetch('/api/manager', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || ('Erreur ' + r.status));
      f.hidden = true; document.getElementById('m-success').hidden = false;
      document.getElementById('m-success').scrollIntoView({ block: 'center', behavior: 'smooth' });
    } catch (x) { show(x.message || 'L’envoi n’a pas abouti. Réessayez dans un instant.'); btn.disabled = false; btn.textContent = label; }
  });
})();
</script>
${footer}`;
}

writeFileSync(new URL('index.html', out), home());
writeFileSync(new URL('inscription-manager.html', out), managerPage());
roles.forEach((r, i) => writeFileSync(new URL(href(r), out), job(r, i)));
console.log(`index.html + ${roles.length} fiches + inscription-manager.html générées.`);
