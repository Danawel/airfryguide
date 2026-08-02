// =====================================================================
//  AUDIT DE COHÉRENCE texte <-> fiches produits
//  Vérifie que, dans CHAQUE article, tous les produits des fiches
//  (liens Amazon) sont bien nommés dans le texte, et qu'aucun modèle
//  concurrent sans fiche n'est cité.
//
//  Utilisation :
//    node scripts/audit-coherence.mjs
//  Sort en erreur (code 1) si au moins un article est incohérent
//  -> peut servir de garde-fou avant un déploiement.
// =====================================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ARTICLES_DIR = path.join(ROOT, 'src', 'content', 'articles');
const PRODUCTS = path.join(ROOT, 'src', 'data', 'products.json');

function normText(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const COMPETITOR_BRANDS = [
  'philips', 'tefal', 'seb', 'rowenta', 'delonghi', 'russell hobbs', 'proscenic',
  'aigostar', 'aeg', 'electrolux', 'samsung', 'lg', 'whirlpool', 'irobot', 'roomba',
  'roborock', 'dreame', 'ecovacs', 'dyson', 'xiaomi', 'eufy', 'shark', 'daewoo',
  'klarstein', 'trotec', 'inventor', 'midea', 'daikin', 'ariston', 'olimpia', 'cosori',
  'ninja', 'moulinex', 'temprium', 'hoover', 'bissell',
];

function coherenceProblems(body, featured) {
  const nbody = normText(body);
  const problems = [];
  for (const p of featured) {
    const cands = [p.shortName, p.name].filter(Boolean).map(normText);
    if (!cands.some((c) => c && nbody.includes(c))) {
      problems.push(`fiche jamais citée : « ${p.shortName || p.name} »`);
    }
  }
  const featuredText = normText(featured.map((p) => `${p.name} ${p.shortName || ''}`).join(' '));
  for (const b of COMPETITOR_BRANDS) {
    const nb = normText(b);
    if (!featuredText.includes(nb) && new RegExp(`(^| )${nb}( |$)`).test(nbody)) {
      problems.push(`marque citée sans fiche : « ${b} »`);
    }
  }
  return problems;
}

function parseFront(md) {
  const src = md.replace(/\r\n/g, '\n');
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { products: [], body: src };
  const prodLine = m[1].match(/^products:\s*(\[.*\])\s*$/m);
  let products = [];
  try { products = prodLine ? JSON.parse(prodLine[1]) : []; } catch {}
  return { products, body: m[2] };
}

if (!fs.existsSync(ARTICLES_DIR)) {
  console.log('Aucun dossier d\'articles.');
  process.exit(0);
}
const catalog = JSON.parse(fs.readFileSync(PRODUCTS, 'utf8')).products;
const byAsin = Object.fromEntries(catalog.map((p) => [p.asin, p]));

let bad = 0;
const files = fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.md'));
for (const f of files) {
  const md = fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf8');
  const { products, body } = parseFront(md);
  const featured = products.map((a) => byAsin[a]).filter(Boolean);
  const unknown = products.filter((a) => !byAsin[a]);
  const problems = coherenceProblems(body, featured);
  if (unknown.length) problems.push(`ASIN absent de products.json : ${unknown.join(', ')}`);

  if (problems.length) {
    bad++;
    console.log(`\n❌ ${f}`);
    problems.forEach((p) => console.log(`   - ${p}`));
  } else {
    console.log(`✅ ${f}`);
  }
}

console.log(`\n${bad === 0 ? '✅ Tous les articles sont cohérents.' : `❌ ${bad} article(s) incohérent(s).`}`);
process.exit(bad === 0 ? 0 : 1);
