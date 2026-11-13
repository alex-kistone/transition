# Kistone Transition — landing page

Site statique (HTML/CSS, sans dépendance) d'un cabinet de management de transition.
Design sobre et rassurant aux couleurs Kistone (crème, encre) avec un accent vert pastel.

- `index.html` : accueil (hero et formulaire de rappel, engagements, cabinet, expertises, situations, démarche, garanties, témoignages, FAQ, contact)
- `poste-*.html` : une fiche de poste par fonction, au format document (sommaire, sections numérotées, livrables attendus, formulaire, impression)
- `src/data.mjs` : contenu des 10 fiches — **c'est ici qu'on modifie les textes**
- `build.mjs` : régénère toutes les pages (`node build.mjs`)
- `styles.css` : styles ; couleurs dans `:root` (`--green`, `--green-text`…)

## Lancer en local

```bash
cd transition
npm run dev
```

Ouvre http://localhost:3000 (autre port : `PORT=4000 npm run dev`). Aucune dépendance à installer, Node 18+ suffit.

Première installation :

```bash
git clone https://github.com/alex-kistone/transition.git
cd transition
npm run dev
```
`npm run dev` régénère les pages, lance le serveur et **recharge le navigateur automatiquement** à chaque modification (textes dans `src/data.mjs`, gabarits dans `build.mjs`, styles dans `styles.css`). `npm start` lance seulement le serveur.

**Suivre les modifications de Claude en direct** : `npm run live`. Le site récupère tout seul les mises à jour poussées sur GitHub (toutes les 15 s) et le navigateur se recharge.

## Mise en ligne sur transition.kistone.fr (Vercel)

1. Vercel → *Add New Project* → importer le dépôt `transition`, preset *Other* (racine du dépôt)
   (le `vercel.json` du dossier fixe la commande de build et les URL sans `.html`).
2. Projet → *Settings → Domains* → ajouter `transition.kistone.fr`.
3. Chez le gestionnaire DNS de kistone.fr : enregistrement **CNAME** `transition` → `cname.vercel-dns.com`.
4. Le certificat HTTPS est émis automatiquement une fois le DNS propagé.

## Formulaires (Resend)

Les formulaires envoient la demande à `/api/contact`, qui envoie un e-mail via **Resend** depuis `transition@kistone.fr`
(domaine kistone.fr vérifié dans Resend) vers **aguego@kistone.fr**.
- Code : `lib/contact.mjs` (envoi), `api/contact.js` (fonction Vercel), `serve.mjs` (même route en local).
- **En local** : copier `.env.example` en `.env` et y coller la clé API Resend (`RESEND_API_KEY`). Le fichier `.env` n'est jamais envoyé sur GitHub.
- **Sur Vercel** : Settings → Environment Variables → ajouter `RESEND_API_KEY`.
- Options : `CONTACT_TO` (destinataire), `CONTACT_FROM` (expéditeur).

À compléter : témoignages, associé fondateur, `[Téléphone]`, `[E-mail de contact]`, `[Adresse du cabinet]`, `[TJM]`, mentions légales.
