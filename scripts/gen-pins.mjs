// =====================================================================
//  GÉNÉRATEUR D'IMAGES "ÉPINGLE PINTEREST" (1000 x 1500)
//  Fabrique automatiquement une image verticale par article publié,
//  dans public/pins/<slug>.png. Utilisée par Pinterest (flux RSS),
//  Facebook et Twitter (og:image).
//
//  Lancé automatiquement avant le build (voir package.json).
// =====================================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ARTICLES_DIR = path.join(ROOT, 'src', 'content', 'articles');
const OUT_DIR = path.join(ROOT, 'public', 'pins');
const FONT_DIR = path.join(ROOT, 'src', 'assets', 'fonts');

const fontBold = fs.readFileSync(path.join(FONT_DIR, 'Poppins-Bold.ttf'));
const fontSemi = fs.readFileSync(path.join(FONT_DIR, 'Poppins-SemiBold.ttf'));

// Illustration d'air fryer (SVG) utilisée en filigrane dans le fond de l'épingle.
const AIRFRYER_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 520'>
  <path fill='#e0632b' d='M126 26 L274 26 Q308 26 312 60 L338 300 Q342 336 306 336 L94 336 Q58 336 62 300 L88 60 Q92 26 126 26 Z'/>
  <rect x='150' y='70' width='150' height='150' rx='0' fill='none'/>
  <rect x='96' y='150' width='208' height='22' rx='11' fill='#fbf6f0'/>
  <circle cx='250' cy='108' r='26' fill='#fbf6f0'/>
  <circle cx='250' cy='108' r='11' fill='#e0632b'/>
  <rect x='120' y='96' width='70' height='12' rx='6' fill='#fbf6f0'/>
  <rect x='120' y='118' width='50' height='12' rx='6' fill='#fbf6f0'/>
  <path fill='#e0632b' d='M104 336 L296 336 L300 452 Q302 486 268 486 L132 486 Q98 486 100 452 Z'/>
  <rect x='150' y='452' width='100' height='26' rx='13' fill='#fbf6f0'/>
  <rect x='120' y='300' width='160' height='14' rx='7' fill='#fbf6f0'/>
</svg>`;
const AIRFRYER_URI = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(AIRFRYER_SVG)}`;

// Couleur du badge selon le type de contenu
const TYPE_STYLE = {
  guide: { label: 'GUIDE COMPLET', bg: '#e0632b' },
  comparatif: { label: 'COMPARATIF', bg: '#2b6ce0' },
  article: { label: 'ARTICLE', bg: '#1f9d55' },
};

// Taille de titre adaptée à la longueur
function titleSize(t) {
  if (t.length > 95) return 60;
  if (t.length > 65) return 70;
  if (t.length > 40) return 82;
  return 94;
}

function pinElement(title, type) {
  const ts = TYPE_STYLE[type] || TYPE_STYLE.guide;
  return {
    type: 'div',
    props: {
      style: {
        width: 1000,
        height: 1500,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#fbf6f0',
        padding: 80,
        fontFamily: 'Poppins',
        position: 'relative',
      },
      children: [
        // Filigrane : illustration d'air fryer dans le fond
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              right: -120,
              bottom: 20,
              width: 620,
              height: 806,
              opacity: 0.13,
              backgroundImage: `url("${AIRFRYER_URI}")`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: '620px 806px',
            },
          },
        },
        // En-tête : marque + badge type
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: 30 },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', fontSize: 46, fontWeight: 700, color: '#e0632b' },
                  children: 'AirFryGuide',
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignSelf: 'flex-start',
                    fontSize: 30,
                    fontWeight: 700,
                    color: 'white',
                    backgroundColor: ts.bg,
                    padding: '14px 28px',
                    borderRadius: 999,
                    letterSpacing: 2,
                  },
                  children: ts.label,
                },
              },
            ],
          },
        },
        // Titre
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontSize: titleSize(title),
              fontWeight: 700,
              color: '#2a2320',
              lineHeight: 1.15,
            },
            children: title,
          },
        },
        // Pied : bande orange
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              borderTop: '6px solid #e0632b',
              paddingTop: 30,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', fontSize: 40, fontWeight: 700, color: '#e0632b' },
                  children: 'Un nouveau guide chaque jour',
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', fontSize: 32, fontWeight: 600, color: '#7a6f68' },
                  children: 'statuesque-lolly-d520d0.netlify.app',
                },
              },
            ],
          },
        },
      ],
    },
  };
}

async function renderPin(title, type, outPath) {
  const svg = await satori(pinElement(title, type), {
    width: 1000,
    height: 1500,
    fonts: [
      { name: 'Poppins', data: fontBold, weight: 700, style: 'normal' },
      { name: 'Poppins', data: fontSemi, weight: 600, style: 'normal' },
    ],
  });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1000 } }).render().asPng();
  fs.writeFileSync(outPath, png);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const now = new Date();
  const files = fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.md'));
  let made = 0;

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const outPath = path.join(OUT_DIR, `${slug}.png`);
    if (fs.existsSync(outPath)) continue; // déjà générée

    const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf8');
    const { data } = matter(raw);
    if (data.draft) continue;
    if (data.pubDate && new Date(data.pubDate) > now) continue; // pas encore publié

    await renderPin(String(data.title), data.type || 'guide', outPath);
    made++;
    console.log(`🖼️  Épingle créée : pins/${slug}.png`);
  }

  console.log(made ? `✅ ${made} image(s) d'épingle générée(s).` : 'ℹ️  Aucune nouvelle image à générer.');
}

main().catch((err) => {
  console.error('Erreur génération épingles :', err);
  process.exit(1);
});
