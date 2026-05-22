#!/usr/bin/env node
/**
 * Build script for the blog. Reads posts/*.json and generates:
 *   - posts/<slug>.html  (one standalone page per post)
 *   - blog.html          (post-list index, overwrites the previous file)
 *   - sitemap.xml        (regenerated to include every post URL)
 *
 * Source of truth: posts/*.json (tracked). Outputs are gitignored.
 * Run locally with `node scripts/build-blog.mjs`. CI runs it inside the
 * Deploy workflow before staging files to gh-pages.
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const POSTS_DIR = join(ROOT, 'posts');
const BASE_URL = 'https://janfabian.github.io/terezafabianova.cz';

// ── HTML escaping for meta-tag content (titles, descriptions). ───────────────
const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// ── Load all posts, sort newest first by ISO date. ──────────────────────────
function loadPosts() {
  const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.json'));
  return files
    .map((f) => JSON.parse(readFileSync(join(POSTS_DIR, f), 'utf8')))
    .sort((a, b) => b.date.localeCompare(a.date));
}

// ── Shared nav. depth=0 for blog.html (root), depth=1 for posts/<slug>.html.
function nav(depth, activeSlug) {
  const up = depth === 0 ? '' : '../';
  const blogActive = activeSlug === 'blog' ? ' class="active"' : '';
  return `<nav class="nav">
  <div class="nav-inner">
    <a class="brand" href="${up}index.html">
      <b>tereza fabiánová</b>
      <span>psychoterapie · mindfulness</span>
    </a>
    <input type="checkbox" id="nav-toggle" class="nav-toggle" aria-label="menu">
    <label class="nav-burger" for="nav-toggle" aria-hidden="true"><span></span><span></span><span></span></label>
    <ul>
      <li><a href="${up}index.html">úvod</a></li>
      <li><a href="${up}psychoterapie.html">psychoterapie</a></li>
      <li><a href="${up}mindfulness.html">mindfulness</a></li>
      <li><a href="${up}kdo-jsem.html">kdo jsem</a></li>
      <li><a href="${up}blog.html"${blogActive}>blog</a></li>
      <li class="mobile-only"><a href="${up}kontakt.html">kontakt</a></li>
    </ul>
    <div class="nav-actions">
      <button class="theme-toggle" type="button" aria-label="přepnout světlý / tmavý režim" title="světlý / tmavý režim">
        <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
      </button>
      <a class="nav-cta" href="${up}kontakt.html">ozvěte se</a>
    </div>
  </div>
</nav>`;
}

function footer(depth) {
  const up = depth === 0 ? '' : '../';
  return `<footer>
  <span>© tereza fabiánová · 2026</span>
  <span><a href="${up}kontakt.html">kontakt</a> · praha</span>
</footer>`;
}

// ── Per-post standalone page ────────────────────────────────────────────────
function postPage(post) {
  const url = `${BASE_URL}/posts/${post.slug}.html`;
  const ogImage = `${BASE_URL}/images/blog-matcha.jpg`;
  const head = `<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(post.title)} — tereza fabiánová · blog</title>
<meta name="description" content="${esc(post.perex)}">
<meta name="author" content="Mgr. Tereza Fabiánová">
<meta name="theme-color" content="#2a4566">
<link rel="canonical" href="${url}">
<meta property="og:site_name" content="Tereza Fabiánová">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(post.title)}">
<meta property="og:description" content="${esc(post.perex)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogImage}">
<meta property="og:locale" content="cs_CZ">
<meta property="article:published_time" content="${post.date}">
<meta property="article:author" content="Mgr. Tereza Fabiánová">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(post.title)}">
<meta name="twitter:description" content="${esc(post.perex)}">
<meta name="twitter:image" content="${ogImage}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Onest:wght@300;400;500;600&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../styles.css">
<script src="../theme.js"></script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": ${JSON.stringify(post.title)},
  "description": ${JSON.stringify(post.perex)},
  "datePublished": "${post.date}",
  "author": {
    "@type": "Person",
    "name": "Mgr. Tereza Fabiánová",
    "url": "${BASE_URL}/kdo-jsem.html"
  },
  "image": "${ogImage}",
  "url": "${url}",
  "mainEntityOfPage": "${url}"
}
</script>
</head>
<body>

${nav(1, 'blog')}

<main>

<header class="page-hero tone" data-screen-label="${esc(post.title)}">
  <div class="wrap">
    <div class="grid12">
      <div class="crumb crumb-post">
        <span class="eyebrow">${post.date_display} · koláž</span>
        <a class="post-back-top" href="../blog.html">← zpět na blog</a>
      </div>
      <h1>${esc(post.title)}</h1>
      <p class="lede italic">${esc(post.perex)}</p>
    </div>
  </div>
</header>

<section class="tone no-top-border" style="border-top: 0;">
  <div class="wrap">
    <article class="post-page">
${post.html.split('\n').map((l) => '      ' + l).join('\n')}
    </article>
  </div>
</section>

</main>

<div class="next-link">
  <div class="wrap">
    <a href="../blog.html">
      <span class="label">← zpět na</span>
      <span class="title">blog · koláž</span>
    </a>
  </div>
</div>

${footer(1)}

</body>
</html>
`;
  return head;
}

// ── blog.html index ─────────────────────────────────────────────────────────
function blogIndex(posts) {
  const url = `${BASE_URL}/blog.html`;
  const items = posts
    .map(
      (p) => `      <article class="post">
        <div class="post-date">${p.date_display}</div>
        <div class="post-head">
          <h3><a href="posts/${p.slug}.html">${esc(p.title)}</a></h3>
          <a class="post-toggle" href="posts/${p.slug}.html">číst →</a>
        </div>
        <div class="post-perex"><p>${esc(p.perex)}</p></div>
      </article>`,
    )
    .join('\n\n');

  return `<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>blog · psychoterapie a mindfulness — tereza fabiánová</title>
<meta name="description" content="Texty o psychoterapii, mindfulness, všímavosti a každodenní praxi. Blog Mgr. Terezy Fabiánové, psycholožky a lektorky MBSR v Praze.">
<meta name="keywords" content="blog psychoterapie, blog mindfulness, všímavost, texty o terapii, články psychologie">
<meta name="author" content="Mgr. Tereza Fabiánová">
<meta name="theme-color" content="#2a4566">
<link rel="canonical" href="${url}">
<meta property="og:site_name" content="Tereza Fabiánová">
<meta property="og:type" content="website">
<meta property="og:title" content="blog · psychoterapie a mindfulness — tereza fabiánová">
<meta property="og:description" content="Texty o psychoterapii, mindfulness, všímavosti a každodenní praxi. Blog Mgr. Terezy Fabiánové, psycholožky a lektorky MBSR v Praze.">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${BASE_URL}/images/hero-kilim.jpg">
<meta property="og:locale" content="cs_CZ">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="blog · psychoterapie a mindfulness — tereza fabiánová">
<meta name="twitter:description" content="Texty o psychoterapii, mindfulness, všímavosti a každodenní praxi. Blog Mgr. Terezy Fabiánové, psycholožky a lektorky MBSR v Praze.">
<meta name="twitter:image" content="${BASE_URL}/images/hero-kilim.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Onest:wght@300;400;500;600&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
<script src="theme.js"></script>
</head>
<body>

${nav(0, 'blog')}

<main>

<header class="page-hero tone" data-screen-label="Blog">
  <div class="wrap">
    <div class="grid12">
      <div class="crumb"><span class="eyebrow">05 — koláž</span></div>
      <h1>koláž / <em>blog</em></h1>
      <p class="lede">měsíční zamyšlení ze světa všímavosti, psychologie a psychoterapie.</p>
    </div>
  </div>
</header>

<section class="tone no-top-border" style="border-top: 0;">
  <div class="wrap">
    <div class="grid12" style="margin-bottom: clamp(48px,6vw,80px);">
      <div style="grid-column: 1 / -1;">
        <div class="ph-crop r-3-1"><img src="images/blog-matcha.jpg" alt="Šálek čaje na rohoži" width="1600" height="1067" class="ph-img" loading="lazy" style="object-position: 50% 40%;"></div>
      </div>
    </div>

    <aside class="blog-kolaz">
      <div class="blog-kolaz-label">koláž</div>
      <p>Pravidelná měsíční mozaika informací, tipů a zamyšlení ze světa všímavosti (mindfulness), psychologie a psychoterapie. <a href="https://mailchi.mp/9f5652d7a375/terezafabianovacz-newsletter" target="_blank" rel="noopener">Přihlásit&nbsp;se →</a></p>
    </aside>

    <div class="blog-list">

${items}

    </div>
  </div>
</section>

</main>

<div class="next-link">
  <div class="wrap">
    <a href="kontakt.html">
      <span class="label">další →</span>
      <span class="title">kontakt <span class="arrow">→</span></span>
    </a>
  </div>
</div>

${footer(0)}

</body>
</html>
`;
}

// ── sitemap.xml (root + each post) ──────────────────────────────────────────
function sitemap(posts) {
  const pages = [
    { loc: `${BASE_URL}/index.html`, changefreq: 'monthly', priority: '1.0' },
    { loc: `${BASE_URL}/psychoterapie.html`, changefreq: 'monthly', priority: '0.9' },
    { loc: `${BASE_URL}/mindfulness.html`, changefreq: 'monthly', priority: '0.9' },
    { loc: `${BASE_URL}/kdo-jsem.html`, changefreq: 'monthly', priority: '0.7' },
    { loc: `${BASE_URL}/blog.html`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${BASE_URL}/kontakt.html`, changefreq: 'yearly', priority: '0.6' },
  ];
  const postUrls = posts.map((p) => ({
    loc: `${BASE_URL}/posts/${p.slug}.html`,
    lastmod: p.date,
    changefreq: 'yearly',
    priority: '0.7',
  }));
  const all = [...pages, ...postUrls];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all
  .map(
    (u) =>
      `  <url>\n    <loc>${u.loc}</loc>\n${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ''}    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
  )
  .join('\n')}
</urlset>
`;
}

// ── Run ─────────────────────────────────────────────────────────────────────
const posts = loadPosts();
mkdirSync(POSTS_DIR, { recursive: true });

for (const post of posts) {
  const out = join(POSTS_DIR, `${post.slug}.html`);
  writeFileSync(out, postPage(post));
  console.log('post:', out);
}

writeFileSync(join(ROOT, 'blog.html'), blogIndex(posts));
console.log('blog.html written');

writeFileSync(join(ROOT, 'sitemap.xml'), sitemap(posts));
console.log('sitemap.xml written');

console.log(`done — ${posts.length} post(s)`);
