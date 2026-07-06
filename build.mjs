// ============================================================================
// Zero-dependency static site renderer for pcklinik.eu.
// Produces the same HTML the Astro project renders, into ./dist.
// Reuses the SAME data files (src/data/*.js) and CSS (src/styles/global.css),
// so the built output and the Astro source never drift.
//   Run:  node build.mjs
// ============================================================================
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { repairs } from './src/data/repairs.js';
import { site, nav, hreflangMap } from './src/data/site.js';
import { lucide, lucideSm } from './src/data/icons.js';
import { services } from './src/data/services.js';
import { locations } from './src/data/locations.js';
import { news } from './src/data/news.js';
import { arNav, arPages } from './src/data/ar.js';
import { arBrands } from './src/data/arBrands.js';
import { arServices } from './src/data/arServices.js';
import { arNetwork, arShop, arLocations } from './src/data/arMore.js';
import { macHubHtml, gamingHtml, MAC_HUB_FAQ, GAMING_FAQ, errorMessagesHtml, ERROR_FAQ, computerWontTurnOnHtml, WONT_TURN_ON_FAQ, faqPageHtml, GENERAL_FAQ, networkHubHtml, NETWORK_HUB_FAQ, websitesHubHtml, WEBSITES_HUB_FAQ } from './src/data/richPages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, 'dist');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// Renders a <form> opening + hidden routing fields for the active form mode.
function formOpen(dest, subject, nextPath) {
  const next = `${site.domain}${nextPath}`;
  if (site.formMode === 'cloudflare') {
    const isAr = nextPath.startsWith('/ar/');
    const okMsg = isAr ? 'تم إرسال رسالتك — شكرًا لك. سنعاود التواصل معك قريبًا.' : "Your message has been sent — thank you. We'll get back to you shortly.";
    const errMsg = isAr ? 'حدث خطأ ما. يرجى المحاولة مرة أخرى أو مراسلتنا مباشرة.' : 'Something went wrong. Please try again, or email us directly.';
    return `<form action="/api/submit-form" method="POST" data-ajax-form data-ok="${esc(okMsg)}" data-err="${esc(errMsg)}">
        <input type="hidden" name="_to" value="${dest}" />
        <input type="hidden" name="_subject" value="${esc(subject)}" />
        <input type="hidden" name="_next" value="${next}" />
        <input type="hidden" name="_ts" value="" />
        <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" data-lpignore="true" data-1p-ignore style="position:absolute;left:-9999px" />`;
  }
  const fs = dest === site.emailBusiness ? 'xpqgbpog' : 'maqgvelb';
  return `<form action="https://formspree.io/f/${fs}" method="POST">
        <input type="hidden" name="_subject" value="${esc(subject)}" />
        <input type="hidden" name="_next" value="${next}" />`;
}
const arPathSet = new Set(['/ar/', ...arPages.map((x) => x.slug), ...arBrands.map((b) => `/ar/${b.slug}/`), ...arServices.map((sv) => `/ar/${sv.slug}/`), ...arNetwork.map((n) => `/ar/${n.slug}/`), ...arShop.map((sh) => `/ar/${sh.slug}/`), ...arLocations.map((l) => `/ar/${l.slug}/`), '/ar/business-it-service-agreement/', '/ar/contact/', '/ar/thank-you/']);
const AR_EN_MAP = { '/ar/': '/', '/ar/website-design/': '/website-design-development/', '/ar/google-ads/': '/google-ads-management/', '/ar/business-it/': '/business-it-service-agreement/' };
const EN_AR_MAP = { '/website-design-development/': '/ar/website-design/', '/google-ads-management/': '/ar/google-ads/', '/business-it-service-agreement/': '/ar/business-it-service-agreement/' };
function arCounterpart(p) { return EN_AR_MAP[p] || (p === '/' ? '/ar/' : `/ar${p}`); }
const arPhone = `<bdi>+45 ${site.phone}</bdi>`;
const arEmail = `<bdi>${site.emailConsumer}</bdi>`;

// ---------- shared chrome ----------
function topbar(p) {
  const arCand = arCounterpart(p);
  const arHref = arPathSet.has(arCand) ? arCand : '/ar/';
  return `<div class="topbar"><div class="wrap">
    <span>${lucideSm.clock} ${site.hours}</span>
    <span>${lucideSm.phone} <a href="${site.phoneHref}">${site.phone}</a></span>
    <span>${lucideSm.mail} <a href="mailto:${site.emailConsumer}">${site.emailConsumer}</a></span>
    <span class="lang-switch"><a href="${arHref}" hreflang="ar" lang="ar">العربية</a></span>
  </div></div>`;
}
function isActive(item, p) {
  if (item.href === '/') return p === '/';
  if (p === item.href) return true;
  if (item.children) return item.children.some((c) => p === c.href);
  if (item.flyout) return item.flyout.some((cat) => cat.children.some((c) => p === c.href));
  return false;
}
function header(p) {
  const items = nav.map((item) => {
    if (item.flyout) {
      const cats = item.flyout.map((cat) => {
        const links = cat.children.map((c) => `<a href="${c.href}">${esc(c.label)}</a>`).join('');
        return `<div class="flyout-cat"><button type="button" class="flyout-cat-label">${esc(cat.label)} <span aria-hidden="true">▸</span></button><div class="flyout-panel">${links}</div></div>`;
      }).join('');
      return `<div class="nav-item dropdown flyout"><a href="${item.href}" class="${isActive(item, p) ? 'active' : ''}">${item.label} <span aria-hidden="true">▾</span></a><div class="dropdown-menu flyout-menu">${cats}</div></div>`;
    }
    if (item.children) {
      const menu = item.children.map((c) => c.header ? `<span class="dropdown-header">${esc(c.header)}</span>` : `<a href="${c.href}">${esc(c.label)}</a>`).join('');
      return `<div class="nav-item dropdown"><a href="${item.href}" class="${isActive(item, p) ? 'active' : ''}">${item.label} <span aria-hidden="true">▾</span></a><div class="dropdown-menu">${menu}</div></div>`;
    }
    return `<div class="nav-item"><a href="${item.href}" class="${isActive(item, p) ? 'active' : ''}">${item.label}</a></div>`;
  }).join('');
  return `${topbar(p)}<header class="site-header"><div class="wrap">
    <a href="/" class="brand" aria-label="PCKlinik home"><img src="/logo.png" alt="PCKlinik" width="100" height="40" /></a>
    <nav class="main" id="mainnav">${items}</nav>
    <button class="nav-toggle" id="navtoggle" aria-label="Toggle menu" aria-expanded="false"><span></span><span></span><span></span></button>
  </div></header>`;
}
function footer() {
  const year = new Date().getFullYear();
  return `<footer class="site-footer"><div class="wrap"><div class="cols">
    <div><img src="/logo.png" alt="PCKlinik" class="logo-foot" width="85" height="34" /><p>Fast, honest PC and Mac repair for individuals and businesses in Frederiksberg and Copenhagen.</p><p>${site.address}</p></div>
    <div><h2>Repairs</h2><a href="/lenovo-repair/">Lenovo</a><a href="/hp-repair/">HP</a><a href="/dell-repair/">Dell</a><a href="/macbook-repair/">MacBook</a><a href="/mac-desktop-repair/">Mac (desktop)</a><a href="/microsoft-surface-repair/">Microsoft Surface</a></div>
    <div><h2>More</h2><a href="/shop/">Shop</a><a href="/shop/computers/refurbished/">Refurbished Computers</a><a href="/business-it-service-agreement/">Business IT Support</a><a href="/about-us/">Meet the Team</a><a href="/faq/">FAQ</a><a href="/news/">News</a><a href="/ask-a-question/">Ask Us a Question</a><a href="/contact/">Contact</a></div>
    <div><h2>Areas we serve</h2><a href="/computer-repair-copenhagen/">Copenhagen</a><a href="/computer-repair-frederiksberg/">Frederiksberg</a><a href="/computer-repair-vesterbro/">Vesterbro</a><a href="/computer-repair-vanloese/">Vanløse</a><a href="/computer-repair-valby/">Valby</a><a href="/computer-repair-nordvest/">Nordvest</a></div>
    
    <div><h2>Get in touch</h2><p>📞 <a href="${site.phoneHref}" style="display:inline">${site.phone}</a></p><p>✉️ <a href="mailto:${site.emailConsumer}" style="display:inline">${site.emailConsumer}</a></p><p style="margin-top:14px">Mon–Fri 10:00–18:00<br />Sat 10:00–14:00<br />Sun closed</p></div>
  </div><div class="footer-bottom"><div class="footer-nap">PCKlinik · Falkoner Allé 108, 2000 Frederiksberg · 91 81 61 81</div><div>© ${year} PCKlinik · CVR-nr. 33275145 · Frederiksberg</div></div></div></footer>`;
}
const navToggleScript = `<script>
const t=document.getElementById('navtoggle'),n=document.getElementById('mainnav');
t&&t.addEventListener('click',()=>{const o=n.classList.toggle('open');t.setAttribute('aria-expanded',o?'true':'false');});
document.querySelectorAll('nav.main .dropdown > a').forEach(a=>{a.setAttribute('aria-haspopup','true');a.setAttribute('aria-expanded','false');a.addEventListener('click',e=>{e.preventDefault();const d=a.parentElement;const willOpen=!d.classList.contains('open');document.querySelectorAll('nav.main .dropdown.open').forEach(x=>{if(x!==d){x.classList.remove('open');x.querySelector('a').setAttribute('aria-expanded','false');x.querySelectorAll('.flyout-cat.expanded').forEach(c=>c.classList.remove('expanded'));}});d.classList.toggle('open',willOpen);a.setAttribute('aria-expanded',willOpen?'true':'false');});});
document.querySelectorAll('.flyout-cat-label').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();b.parentElement.classList.toggle('expanded');}));
document.addEventListener('click',e=>{if(!e.target.closest('.nav-item')){document.querySelectorAll('nav.main .dropdown.open').forEach(x=>{x.classList.remove('open');x.querySelector('a').setAttribute('aria-expanded','false');});document.querySelectorAll('.flyout-cat.expanded').forEach(c=>c.classList.remove('expanded'));}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelectorAll('nav.main .dropdown.open').forEach(x=>{x.classList.remove('open');x.querySelector('a').setAttribute('aria-expanded','false');});document.querySelectorAll('.flyout-cat.expanded').forEach(c=>c.classList.remove('expanded'));}});
</script>`;

// AJAX submit for contact forms: no reload, inline success/error state.
const formsScript = `<script>
(function(){
var fs=document.querySelectorAll('form[data-ajax-form]');
fs.forEach(function(f){
var tsf=f.querySelector('input[name=_ts]');if(tsf){tsf.value=Date.now();}
var s=document.createElement('div');s.className='form-status';s.setAttribute('role','status');s.setAttribute('aria-live','polite');s.style.display='none';f.appendChild(s);
var b=f.querySelector('[type=submit]');
f.addEventListener('submit',function(e){
e.preventDefault();s.style.display='none';s.className='form-status';if(b){b.disabled=true;}
var d={};new FormData(f).forEach(function(v,k){d[k]=v;});
fetch(f.getAttribute('action'),{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(d)})
.then(function(r){return r.json().catch(function(){return{};}).then(function(j){return{ok:r.ok,j:j};});})
.then(function(x){if(x.ok&&x.j&&x.j.ok){f.reset();s.className='form-status form-status--ok';s.textContent=f.getAttribute('data-ok');}else{s.className='form-status form-status--error';s.textContent=f.getAttribute('data-err');}s.style.display='block';})
.catch(function(){s.className='form-status form-status--error';s.textContent=f.getAttribute('data-err');s.style.display='block';})
.then(function(){if(b){b.disabled=false;}});
});
});
})();
</script>`;

const businessSchema = {
  '@context': 'https://schema.org', '@type': 'ComputerRepairService', name: 'PCKlinik',
  image: site.domain + '/logo.png', url: site.domain + '/', telephone: '+4591816181', email: site.emailConsumer,
  address: { '@type': 'PostalAddress', streetAddress: site.addressStreet, postalCode: site.addressPostal, addressLocality: site.addressLocality, addressCountry: 'DK' },
  areaServed: ['Frederiksberg', 'Copenhagen'],
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '10:00', closes: '18:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday'], opens: '10:00', closes: '14:00' },
  ],
};

function page({ title, description, p, body, schema = null, lang = 'en', dir = '', chrome = 'en' }) {
  const canonical = site.domain + p;
  const dk = hreflangMap[p];
  let altHreflang = '';
  if (chrome === 'ar') { const enHref = enHrefAr(p); altHreflang = `\n  <link rel="alternate" hreflang="en" href="${site.domain + enHref}" />\n  <link rel="alternate" hreflang="x-default" href="${site.domain + enHref}" />`; }
  else { const arCand = arCounterpart(p); if (arPathSet.has(arCand)) altHreflang = `\n  <link rel="alternate" hreflang="ar" href="${site.domain + arCand}" />`; }
  const schemas = [businessSchema];
  if (schema) Array.isArray(schema) ? schemas.push(...schema) : schemas.push(schema);
  const ld = schemas.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n  ');
  return `<!DOCTYPE html>
<html lang="${lang}"${dir ? ` dir="${dir}"` : ''}>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${canonical}" />
  <link rel="alternate" hreflang="${lang}" href="${canonical}" />
  ${dk ? `<link rel="alternate" hreflang="da" href="${dk}" />\n  <link rel="alternate" hreflang="x-default" href="${canonical}" />` : ''}${altHreflang}
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:site_name" content="PCKlinik" />
  <meta property="og:locale" content="${lang === 'ar' ? 'ar_AR' : 'en'}" />
  <link rel="icon" type="image/png" href="/logo.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" media="print" onload="this.media='all'" />
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" /></noscript>
  <link rel="stylesheet" href="/styles/global.css" />
  ${ld}
</head>
<body>
  ${chrome === 'ar' ? headerAr(p) : header(p)}
  <main>
${body}
  </main>
  ${chrome === 'ar' ? footerAr() : footer()}
  ${navToggleScript}
  ${formsScript}
</body>
</html>`;
}

const mapFrame = `<div class="map-frame"><iframe src="${site.mapsEmbed}" loading="lazy" title="PCKlinik on the map, Falkoner Allé 108" referrerpolicy="no-referrer-when-downgrade"></iframe></div>`;

// ---------- repair pages ----------
function repairBody(r) {
  const svcIcons = ['🖥️', '🔋', '🔧', '🌀'];
  const services = r.services.map((s, i) => `<div class="card"><div class="card-icon">${svcIcons[i % 4]}</div><h3>${esc(s.title)}</h3><p>${s.body}</p></div>`).join('');
  const faq = r.faq.map((f) => `<details><summary>${esc(f.q)}</summary><div class="answer">${esc(f.a)}</div></details>`).join('');
  const cross = r.crosslinks.map((c) => `<a href="${c.href}">${esc(c.label)} →</a>`).join('') + `<a href="/contact/">Contact & booking →</a>`;
  const intro = r.intro.map((pp) => `<p>${pp}</p>`).join('');
  // Optional sections — omitted for the catch-all "Other Brands" page.
  const modelsSection = r.models ? `<section class="section alt"><div class="wrap"><div class="eyebrow">Models we repair</div><h2>Full model coverage</h2><div class="table-wrap"><table class="models"><thead><tr><th>Series</th><th>Models</th><th>Typical issue</th></tr></thead><tbody>${r.models.map((m) => `<tr><td>${esc(m.series)}</td><td>${esc(m.models)}</td><td class="issue">${esc(m.issue)}</td></tr>`).join('')}</tbody></table></div></div></section>` : '';
  const photosSection = r.photos ? `<section class="section alt"><div class="wrap"><div class="eyebrow">From our workshop</div><h2>Real ${esc(r.brand)} repairs</h2><div class="grid grid-${r.photos.length === 2 ? '2' : '3'}">${r.photos.map((ph) => `<img class="img-placeholder" src="${ph.path}" alt="${esc(ph.alt)}" loading="lazy" width="480" height="360" />`).join('')}</div></div></section>` : '';
  const whySection = r.why ? `<section class="section"><div class="wrap"><div class="eyebrow">Why PCKlinik</div><h2>${esc(r.whyHeading)}</h2>${r.whyIntro ? `<p class="sub">${r.whyIntro}</p>` : ''}<ul class="why-list">${r.why.map((w) => `<li><strong>${esc(w.title)}</strong>${esc(w.body)}</li>`).join('')}</ul></div></section>` : '';
  const ctaHeading = r.ctaHeading ? esc(r.ctaHeading) : `Ready to get your ${esc(r.brand)} fixed?`;
  return `  <section class="hero"><div class="wrap">
    <div class="eyebrow">${esc(r.brand)} Repair · Frederiksberg &amp; Copenhagen</div>
    <h1>${esc(r.h1)}</h1><p class="lead">${esc(r.h2)}</p>
    <div class="cta-row"><a class="btn btn-white" href="/contact/">${esc(r.ctaPrimary)}</a><a class="btn btn-ghost-light" href="${site.phoneHref}">📞 Call ${site.phone}</a></div>
  </div></section>
  <section class="section"><div class="wrap lead-copy"><div class="crumbs"><a href="/">Home</a> › <span>${esc(r.brand)} Repair</span></div>${intro}</div></section>
  ${modelsSection}
  <section class="section"><div class="wrap"><div class="eyebrow">What we fix</div><h2>${esc(r.brand)} repair services</h2><div class="grid grid-4">${services}</div></div></section>
  ${photosSection}
  ${whySection}
  <section class="section alt"><div class="wrap"><div class="eyebrow">FAQ</div><h2>${esc(r.brand)} repair — common questions</h2><div class="faq">${faq}</div></div></section>
  <section class="section"><div class="wrap"><div class="cta-band"><h2>${ctaHeading}</h2><p>Free diagnostics (2–4 days) or express for 600 kr (1–2 hours). Fixed quote before we start.</p><div class="cta-row"><a class="btn btn-white" href="/contact/">${esc(r.ctaPrimary)}</a><a class="btn btn-ghost-light" href="${site.phoneHref}">📞 Call ${site.phone}</a></div></div>
    <div style="margin-top:32px"><p class="eyebrow">Related repairs</p><div class="crosslinks">${cross}</div></div></div></section>`;
}
function repairSchema(r) {
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: r.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
}

// ---------- home ----------
const HOME_FAQ = [
  ["Do you offer any repeat-customer benefits?", "Contact us — worth asking directly about your situation."],
  ["Do you offer any way to check the status of an ongoing repair without calling?", "Contact us directly for a status update — call or email works best for a small, personal operation like ours."],
  ['Do you speak English?', 'Yes — our entire service is in English. No Danish required, whether you\'re calling, emailing, or visiting the workshop.'],
  ['Do you repair every computer brand?', 'Yes — we repair all major PC and Mac brands, plus custom builds and brands not individually listed. See "Other Brands & Custom Builds" if you don\'t see yours.'],
  ['How much does a repair cost?', 'Standard diagnostics are free (2–4 days), or express for 600 kr (1–2 hours). You\'ll always get a fixed quote before any repair work starts, so there are no surprises.'],
  ['How long does a repair take?', 'Many repairs are completed the same day, especially with express diagnostics. More involved repairs depend on parts availability.'],
  ['Do you serve businesses as well as individuals?', 'Yes — alongside device repair, we offer fixed-price IT service agreements for businesses, including unlimited support, monitoring, and security. See our Business IT page for details.'],
  ['Where are you located?', 'Falkoner Allé 108, Frederiksberg. We serve Frederiksberg and Copenhagen directly, plus the rest of Denmark via remote support for IT service agreements.'],
  ['Do you sell computers as well as repair them?', 'Yes — new and refurbished computers, plus backup and security equipment, are available in our shop.'],
];
function homeBody() {
  // [name, models, href, icon-key, optional linkText]
  const brands = [
    ['Lenovo', 'ThinkPad, IdeaPad, Legion, Yoga', '/lenovo-repair/', 'laptop'],
    ['Acer', 'Aspire, Swift, Nitro, Predator', '/acer-repair/', 'laptop'],
    ['HP', 'EliteBook, Pavilion, Spectre, Omen', '/hp-repair/', 'laptop'],
    ['Dell', 'XPS, Latitude, Inspiron, Precision', '/dell-repair/', 'laptop'],
    ['Asus', 'ZenBook, Vivobook, ROG, TUF', '/asus-repair/', 'laptop'],
    ['MSI', 'Katana, GF-series, Stealth, Prestige', '/msi-repair/', 'laptop'],
    ['Huawei', 'MateBook D14, D15, X Pro', '/huawei-repair/', 'laptop'],
    ['MacBook', 'Pro, Air, all generations', '/macbook-repair/', 'laptop'],
    ['Microsoft Surface', 'Pro, Laptop, Book', '/microsoft-surface-repair/', 'laptop'],
    ['Samsung', 'Galaxy Book series', '/samsung-repair/', 'laptop'],
    ['Mac (desktop)', 'iMac, Mac mini, Mac Studio, Mac Pro', '/mac-desktop-repair/', 'monitor'],
    ['Gaming PCs & Custom Builds', 'Repair, service & builds from scratch', '/gaming-pc-repair-and-build/', 'monitor'],
    ['Other Brands & Custom Builds', 'Gigabyte, Chromebook, custom PCs & more', '/other-brands-repair/', 'wrench', 'View other brands'],
    ['Network Equipment', 'UniFi, Netgear, TP-Link & more', '/network-equipment/', 'wifi', 'View network equipment'],
    ['Toshiba / Dynabook', 'Satellite, Portégé, Tecra', '/toshiba-dynabook-repair/', 'laptop'],
    ['Fujitsu', 'LIFEBOOK — repair & refurbished sales', '/fujitsu-repair/', 'laptop'],
    ['LG gram', 'Ultra-lightweight laptop repair', '/lg-gram-repair/', 'laptop'],
    ['Razer Blade', 'Gaming laptop repair', '/razer-blade-repair/', 'laptop'],
  ];
  const cards = brands.map(([n, m, h, i, lt]) => `<a class="card card-link brand-card" href="${h}"><div class="card-icon brand-icon">${lucide[i]}</div><h3>${esc(n)}</h3><p class="models">${esc(m)}</p><span class="arrow">${esc(lt ? lt : 'View ' + n + ' repair')} →</span></a>`).join('');
  const popular = [
    ['SSD Upgrade', 'Faster boot times for an older PC or laptop.', '/ssd-upgrade/'],
    ['Liquid Damage Repair', 'Any brand, any model — Windows or Mac.', '/liquid-damage-repair/'],
    ['Data Backup & Recovery', 'Protect your data, or recover it after a failure.', '/data-backup-and-recovery/'],
    ['Virus & Malware Removal', 'PC or Mac, cleaned and protected.', '/virus-removal/'],
  ].map(([t, d, h]) => `<a class="card card-link" href="${h}"><h3>${esc(t)}</h3><p>${esc(d)}</p><span class="arrow">Learn more →</span></a>`).join('');
  const faqHtml = HOME_FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><div class="answer">${esc(a)}</div></details>`).join('');
  return `  <section class="hero"><div class="wrap"><div class="eyebrow">Frederiksberg &amp; Copenhagen · English-speaking</div>
    <h1>Computer &amp; IT support — for you or your business</h1>
    <p class="lead">Fast, honest repair for individuals. Fixed-price IT support for businesses. No Danish required — pick your path below.</p>
    <div class="grid grid-2 hero-paths">
      <a class="card card-link" href="/contact/"><div class="card-icon">🖥️</div><h3>For Individuals</h3><p>PC &amp; Mac repair — free or express diagnostics, fixed quote, most repairs same-day.</p><span class="arrow">Book a repair →</span></a>
      <a class="card card-link" href="/business-it-service-agreement/"><div class="card-icon">🏢</div><h3>For Business</h3><p>IT service agreements — unlimited support, monitoring, and security for one fixed monthly price.</p><span class="arrow">See Business IT plans →</span></a>
    </div></div></section>
  <section class="section"><div class="wrap"><div class="eyebrow">Our Promise</div><h2>How it works</h2><div class="steps">
    <div class="step"><div class="num">1</div><h3>Diagnostics</h3><p>Free (2–4 days), or express for 600 kr (1–2 hours).</p></div>
    <div class="step"><div class="num">2</div><h3>Fixed quote</h3><p>You get a clear price before we touch anything.</p></div>
    <div class="step"><div class="num">3</div><h3>Repair</h3><p>We carry out the repair with the same care as the diagnostics.</p></div></div></div></section>
  <section class="section alt"><div class="wrap"><div class="eyebrow">What we repair</div><h2>Every major computer brand — PC and Mac</h2>
    <p class="sub">We repair all major computer brands — PC and Mac, laptop and desktop — for individuals and businesses in Frederiksberg and Copenhagen.</p>
    <div class="grid grid-3">${cards}</div></div></section>
  <section class="section"><div class="wrap"><div class="eyebrow">Common Services</div><h2>Beyond brand repairs</h2>
    <p class="sub">Beyond brand-specific repairs, we handle these frequently requested services:</p>
    <div class="grid grid-4">${popular}</div>
    <div style="margin-top:24px"><a class="btn btn-outline" href="/faq/">See all services &amp; FAQs →</a></div></div></section>
  <section class="section alt"><div class="wrap"><div class="eyebrow">Why PCKlinik</div><h2>Why choose PCKlinik</h2><ul class="why-list">
    <li><strong>English-speaking service</strong>Our entire service runs in English — no Danish required, start to finish.</li>
    <li><strong>Experienced service</strong>Deep experience across every major brand and model.</li>
    <li><strong>Fast turnaround</strong>Most repairs completed the same day.</li>
    <li><strong>Fixed quote before we start</strong>No surprises, ever.</li>
    <li><strong>Real people, real expertise</strong>A genuine team, not a call center — you always get a straight answer from someone who knows what they're talking about.</li></ul></div></section>
  <section class="section"><div class="wrap"><div class="cta-band"><h2>Looking to buy instead?</h2><p>New and refurbished computers, plus backup and security equipment — all tested and ready to use.</p><div class="cta-row"><a class="btn btn-white" href="/shop/">Visit the shop →</a></div></div></div></section>
  <section class="section alt"><div class="wrap"><div class="eyebrow">Find us</div><h2>Find us in Frederiksberg</h2>
    <p class="sub">We're a real repair shop — not just a website. Stop by, call, or write, and we'll take a look.</p>
    <div class="info-block"><div class="nap">
      <p><strong>Address</strong><br />${site.address}</p>
      <p><strong>Phone</strong><br /><a href="${site.phoneHref}">${site.phone}</a></p>
      <p><strong>Email</strong><br /><a href="mailto:${site.emailConsumer}">${site.emailConsumer}</a></p>
      <p><strong>Hours</strong><br />Mon–Fri 10:00–18:00 · Sat 10:00–14:00 · Sun closed</p>
      <a class="btn btn-primary" href="/contact/" style="margin-top:8px">Book a repair</a>
    </div>${mapFrame}</div></div></section>
  <section class="section"><div class="wrap"><div class="eyebrow">FAQ</div><h2>Frequently Asked Questions</h2><div class="faq">${faqHtml}</div></div></section>`;
}

// ---------- contact ----------
function contactBody() {
  return `  <section class="hero"><div class="wrap"><div class="eyebrow">Get in touch</div><h1>Contact Us</h1>
    <p class="lead">We're ready to help with your computer. Have a question about a repair, or want to book a time? Call, write, or stop by the workshop on Falkoner Allé — we respond quickly.</p><div class="badges"><span class="badge check">Walk-in service — no appointment needed</span><span class="badge check">Pickup and delivery available</span></div></div></section>
  <section class="section"><div class="wrap"><div class="info-block">
    <div class="nap"><div class="eyebrow">Contact details</div>
      <p><strong>Phone</strong><br /><a href="${site.phoneHref}">${site.phone}</a></p>
      <p><strong>Email</strong><br /><a href="mailto:${site.emailConsumer}">${site.emailConsumer}</a></p>
      <p><strong>Address</strong><br />${site.address}</p>
      <p><strong>Hours</strong><br />Mon–Fri 10:00–18:00 · Sat 10:00–14:00 · Sun closed</p></div>
    <div class="form-card">
      ${formOpen(site.emailConsumer, 'New contact form submission — pcklinik.eu', '/thank-you/')}
        <div class="form-row"><div><label for="name">Name</label><input id="name" name="name" type="text" autocomplete="name" required /></div></div>
        <div class="form-row"><div><label for="contact">Phone or email</label><input id="contact" name="contact" type="text" autocomplete="email" required /></div></div>
        <div class="form-row"><div><label for="model">Brand / model <span style="font-weight:400;color:var(--muted)">(optional — helps us prepare)</span></label><input id="model" name="model" type="text" placeholder="e.g. Lenovo ThinkPad T14" /></div></div>
        <div class="form-row"><div><label for="message">Message / description of the issue</label><textarea id="message" name="message" required></textarea></div></div>
        <button class="btn btn-primary" type="submit">Send Message</button>
      </form></div></div></div></section>
  <section class="section"><div class="wrap"><div class="eyebrow">Good to know</div><h2>Common questions</h2><div class="faq"><details><summary>Do I need an appointment?</summary><div class="answer">No — walk-in service is available, no appointment needed. You're welcome to stop by during opening hours.</div></details><details><summary>Can you pick up and deliver my computer?</summary><div class="answer">Yes, pickup and delivery is available — contact us for details based on your location.</div></details><details><summary>Can I request a specific time slot?</summary><div class="answer">Given it’s a small, personal operation, just call ahead and we’ll accommodate where possible.</div></details><details><summary>Is your workshop wheelchair accessible?</summary><div class="answer">Contact us directly if you have specific accessibility needs, and we’ll make sure your visit works for you.</div></details></div></div></section>
  <section class="section alt"><div class="wrap"><div class="eyebrow">Find us</div><h2>Falkoner Allé 108, Frederiksberg</h2>${mapFrame}</div></section>`;
}

// ---------- business IT ----------
function businessBody() {
  const features = [
    ['🛠️', 'Unlimited IT support', 'Help for your employees by phone, email and remote support — and on-site in Copenhagen when needed. Fixed price, no hourly billing.'],
    ['📡', 'Monitoring & operations', 'We watch your computers and servers around the clock and catch problems before they become outages.'],
    ['💾', 'Backup & recovery', 'Real backup of your data and Microsoft 365 — not just cloud storage. If something happens to a machine, we restore everything onto a new one.'],
    ['🛡️', 'IT security', 'Professional endpoint protection and antivirus — protection against viruses, ransomware, phishing and email threats, plus ongoing monitoring.'],
    ['📧', 'Microsoft 365', 'Setup and management of Microsoft 365, Teams, SharePoint and email — new employees are onboarded quickly and securely.'],
    ['📋', 'Advisory & NIS2', 'Practical IT advice so you make the right choices — and stay ready for requirements like GDPR and NIS2.'],
    ['🖥️', 'New IT equipment', 'We sell and set up new computers, Macs, monitors and other equipment — ready to use from day one.'],
    ['♻️', 'Refurbished equipment', 'Professionally restored computers and devices with up to 3 years warranty — cheaper and greener. Extended warranty available.'],
    ['🔒', 'Secure disposal', 'We take back your old equipment, securely erase all data, and dispose of it responsibly — fully GDPR-compliant.'],
  ];
  const tiers = [
    ['Starter', 'Unlimited remote support and proactive maintenance for smaller businesses.', '399', false,
      [['yes', 'Unlimited remote support (phone & email)'], ['yes', 'Response within 1 business day'], ['yes', 'Patch management & updates'], ['yes', 'RMM device monitoring'], ['yes', 'Monthly status report'], ['no', 'Antivirus & endpoint protection'], ['no', 'Backup monitoring']]],
    ['Premium', 'Everything your business needs: unlimited support and complete IT security.', '599', true,
      [['yes', 'Everything in Starter'], ['yes', 'Response within 4 hours'], ['yes', 'Antivirus & endpoint protection'], ['yes', '24/7 monitoring'], ['yes', 'Backup monitoring'], ['yes', 'Microsoft 365 administration'], ['yes', 'MFA & access management']]],
    ['Exclusive', 'Complete IT support, security and Microsoft 365 licensing — all in one package.', '899', false,
      [['yes', 'Everything in Premium'], ['yes', 'Microsoft 365 license included'], ['yes', 'Outlook, Teams & OneDrive'], ['yes', 'Exchange Online (business email)'], ['yes', 'Setup & migration included'], ['yes', 'Ongoing license management'], ['yes', 'GDPR-ready cloud solution']]],
  ];
  const faq = FAQ_BUSINESS;
  const feat = features.map(([i, t, b]) => `<div class="card"><div class="card-icon">${i}</div><h3>${esc(t)}</h3><p>${esc(b)}</p></div>`).join('');
  const price = tiers.map(([name, blurb, p, feat2, items]) => {
    const li = items.map(([k, l]) => `<li class="${k}">${esc(l)}</li>`).join('');
    const signup = `mailto:${site.emailBusiness}?subject=${encodeURIComponent('Sign up: ' + name + ' plan')}`;
    return `<div class="price-card${feat2 ? ' featured' : ''}">${feat2 ? '<span class="ribbon">⭐ Recommended</span>' : ''}<div class="tag">${esc(name)}</div><h3>${esc(name)}</h3><p class="blurb">${esc(blurb)}</p><div class="price">${p} kr. <small>/ user / month</small></div><div class="vat">excl. VAT</div><ul>${li}</ul><a class="btn ${feat2 ? 'btn-primary' : 'btn-outline'}" href="${signup}">Choose ${esc(name)}</a><div class="fine">No commitment • Start today</div></div>`;
  }).join('');
  const faqHtml = faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><div class="answer">${esc(a)}</div></details>`).join('');
  const reviewMail = `mailto:${site.emailBusiness}?subject=Free%20IT%20review`;
  return `  <section class="hero"><div class="wrap"><div class="eyebrow">Business · IT Service Agreement</div>
    <h1>Business IT Service Agreement — your IT department on subscription</h1>
    <p class="lead">Fixed-price IT support for businesses in Copenhagen and Frederiksberg. Unlimited support, proactive monitoring and IT security for one predictable monthly price. We're based on Falkoner Allé in Frederiksberg, travel across Copenhagen and help the rest of the country via remote support.</p>
    <div class="badges"><span class="badge check">Fixed packages from 399 kr./user/mo.</span><span class="badge check">Unlimited support — no hourly rates</span><span class="badge check">Same-day response</span><span class="badge check">Local IT partner in Frederiksberg</span></div>
    <div class="cta-row"><a class="btn btn-ghost-light" href="${site.phoneHref}">📞 Call ${site.phone}</a><a class="btn btn-white" href="#enquiry">Book a free IT review</a><a class="hero-text-link" href="#pricing">See pricing →</a></div></div></section>
  <section class="section alt"><div class="wrap"><div class="eyebrow">What is an IT service agreement?</div><h2>One fixed agreement — and your IT just runs</h2>
    <p class="sub">A business IT service agreement means PCKlinik looks after your IT so you can focus on your business. You get a dedicated IT manager who knows your setup, keeps an eye on your systems and steps in whenever something goes wrong — with no unexpected bills. Instead of calling around for help, you have one partner who keeps everything under control.</p>
    <div class="grid grid-3">${feat}</div></div></section>
  <section class="section"><div class="wrap"><div class="eyebrow">Why PCKlinik</div><h2>A real local IT partner — not a call center</h2><ul class="why-list">
    <li><strong>Predictable IT costs</strong>Fixed monthly price, no hourly rates or billing surprises.</li>
    <li><strong>A dedicated contact</strong>You get one named IT manager who knows your business, backed by a full team when you need more hands.</li>
    <li><strong>Fast help</strong>Most cases are resolved the same day via remote support.</li>
    <li><strong>Local and nationwide</strong>On-site in Copenhagen and the surrounding area, remote support across the country.</li></ul></div></section>
  <section class="section alt"><div class="wrap"><div class="eyebrow">How to get started</div><h2>Three simple steps</h2><div class="steps">
    <div class="step"><div class="num">1</div><h3>Free IT review</h3><p>We map out your current IT setup, identify security gaps and savings opportunities — completely no-obligation.</p></div>
    <div class="step"><div class="num">2</div><h3>A clear plan</h3><p>You get a concrete recommendation and a service agreement that fits your size and needs. You set the pace.</p></div>
    <div class="step"><div class="num">3</div><h3>We run your IT</h3><p>We set it up and maintain it going forward — support, monitoring and security included.</p></div></div></div></section>
  <section class="section" id="pricing"><div class="wrap"><div class="eyebrow">Pricing & Packages</div><h2>Transparent pricing — no surprises</h2>
    <p class="sub">Choose the package that fits your business. Fixed price per user, excl. VAT — no commitment.</p>
    <div class="pricing-grid">${price}</div>
    <p class="center" style="margin-top:28px;color:var(--muted)">Not sure what you need? <a href="${site.phoneHref}">Call ${site.phone}</a> for a no-obligation IT review.</p></div></section>
  <section class="section alt"><div class="wrap"><div class="eyebrow">Find us in Frederiksberg</div><h2>A physical IT shop and workshop — not just a website</h2>
    <p class="sub">Stop by, call, or write, and we'll find the right agreement for you.</p>
    <div class="info-block"><div class="nap"><p><strong>Address</strong><br />${site.address}</p><p><strong>Phone</strong><br /><a href="${site.phoneHref}">${site.phone}</a></p><p><strong>Email</strong><br /><a href="mailto:${site.emailBusiness}">${site.emailBusiness}</a></p></div>${mapFrame}</div></div></section>
  <section class="section alt" id="enquiry"><div class="wrap"><div class="eyebrow">Get in touch</div><h2>Book a free IT review</h2>
    <p class="sub">Tell us a bit about your business and we'll get back to you — no obligation.</p>
    <div class="form-card" style="max-width:640px">
      ${formOpen(site.emailBusiness, 'New Business IT enquiry — pcklinik.eu', '/thank-you/')}
        <div class="form-row"><div><label for="biz-name">Name</label><input id="biz-name" name="name" type="text" autocomplete="name" required /></div></div>
        <div class="form-row"><div><label for="biz-company">Company <span style="font-weight:400;color:var(--muted)">(optional)</span></label><input id="biz-company" name="company" type="text" autocomplete="organization" /></div></div>
        <div class="form-row"><div><label for="biz-email">Email</label><input id="biz-email" name="email" type="email" autocomplete="email" required /></div></div>
        <div class="form-row"><div><label for="biz-phone">Phone <span style="font-weight:400;color:var(--muted)">(optional)</span></label><input id="biz-phone" name="phone" type="tel" autocomplete="tel" /></div></div>
        <div class="form-row"><div><label for="biz-users">Number of users <span style="font-weight:400;color:var(--muted)">(optional)</span></label><input id="biz-users" name="users" type="text" placeholder="e.g. 8" /></div></div>
        <div class="form-row"><div><label for="biz-message">What do you need help with?</label><textarea id="biz-message" name="message" required></textarea></div></div>
        <button class="btn btn-primary" type="submit">Request a free IT review</button>
      </form>
    </div></div></section>
  <section class="section"><div class="wrap"><div class="eyebrow">FAQ</div><h2>Business IT support — common questions</h2><div class="faq">${faqHtml}</div></div></section>`;
}
function businessSchemaFaq() {
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ_BUSINESS.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
}
const FAQ_BUSINESS = [
  ["Can embassies or diplomatic missions request VAT-exempt invoicing?", "Contact us directly to discuss your specific administrative and invoicing requirements — we're happy to work within your organization's procurement process."],
  ["Do you offer onboarding for a large number of employees at once?", "Yes — bulk setup (multiple new starters, or migrating a whole team's equipment) is something we handle as part of a service agreement."],
  ["Can you work with our existing IT documentation or asset inventory system?", "Yes — contact us about your specific systems and we'll adapt to fit into your existing processes rather than requiring you to change them."],
  ['What does an IT service agreement cost?', 'We have three packages: Starter from 399 kr., Premium 599 kr., and Exclusive 899 kr. per user per month (excl. VAT). You pay a fixed monthly price, so you always know the cost upfront. Not sure which package fits? Book a review.'],
  ['Are there any hidden fees?', 'No — never. You pay one fixed monthly price per user, and that’s it. No setup fee, no hourly rate for support requests, and no surprises on the invoice.'],
  ['What’s your response time?', 'We guarantee a response within 4 hours during normal business hours (Mon–Fri 10:00–17:00). Most requests are resolved the same day — many within the first hour.'],
  ['Can I cancel my subscription at any time?', 'Monthly subscriptions can be cancelled with one month’s notice. Annual subscriptions run until the end of the period. No commitment beyond that.'],
  ['What does "unlimited support" cover?', 'Everything related to your daily IT: computer and software issues, network problems, printers, email, Microsoft 365, viruses and security. Does not cover hardware replacement or custom development — we agree on those separately.'],
  ['Does this work for businesses of any size?', 'Yes. We help sole proprietors, offices with 2–3 employees, and businesses with 50+ users. The price is per user, so you pay exactly for what you need.'],
  ['Do I need to install anything?', 'We install a small remote-access tool (TeamViewer or similar) so we can help you quickly without you needing to come to us. Setup typically takes under 15 minutes and we handle it for you.'],
  ['Do you help with printers and network printers?', 'Yes. We set up, configure and troubleshoot all types of printers — local, network and cloud printers. We also help with driver updates and integration with your existing network.'],
  ['Do you offer backup solutions?', 'Yes. We set up automatic backup — both local and cloud — so your data is always protected. We test the backup regularly and help with recovery if something goes wrong.'],
  ['What about antivirus software and IT security?', 'We install and manage antivirus and endpoint security on all your devices. The Premium package includes ongoing security monitoring, so you’re protected against viruses, ransomware and phishing.'],
  ['Can you help with our network and WiFi?', 'Yes. We set up and optimize networks, routers and WiFi — including guest networks, firewalls and VPN. Slow internet or poor coverage? We’ll find the solution.'],
  ['Do you sell computers and equipment?', 'Yes. We sell both new and used/refurbished equipment — computers, laptops, monitors, printers for business, and accessories. Refurbished equipment is professionally inspected and comes with a warranty. We help you find the right equipment for your needs and budget, and set it up ready to use.'],
  ['What’s the difference between a service agreement and hourly billing?', 'With a service agreement, you pay a fixed monthly price and get unlimited support — without thinking about what each call costs. With hourly billing, you pay per task, which makes costs unpredictable and often more expensive. An agreement also means we work proactively, so fewer problems arise in the first place.'],
  ['Can you take over from our current IT provider?', 'Yes. We manage a smooth transition, gather the necessary information, and take over operations without you experiencing downtime. You don’t need to coordinate it yourself.'],
  ['How quickly can we get started?', 'Usually within a few days. We start with a review, set up remote access (under 15 minutes), and run your agreement from there.'],
  ['Do you help with NIS2 and GDPR?', 'Yes. We advise on both GDPR and the new NIS2 directive, and help with backup, access management, security and documentation, so you meet the requirements.'],
  ['Do you support employees working from home?', 'Yes. Our support isn’t dependent on where employees are located. We help via remote support, whether they’re at the office or at home, and ensure a stable connection to company systems.'],
  ['What happens during an IT outage?', 'You contact us, and we get started immediately. With our monitoring, we often catch the problem before you even notice it. Our goal is to get you back up and running as fast as possible and keep downtime to a minimum.'],
  ['Do you help businesses across the whole country?', 'Yes. Remote support covers all of Denmark. We offer on-site service in Copenhagen and Frederiksberg, where we’re based.'],
];

// ---------- shop ----------
function productCard({ img, alt, title, desc, price, stripe = '#stripe-link-placeholder' }) {
  return `<div class="card product-card"><img class="img-placeholder" src="${img}" alt="${esc(alt)}" loading="lazy" width="480" height="360" /><h3>${esc(title)}</h3><p class="desc">${esc(desc)}</p><div class="price-tag">${esc(price)}</div><a class="btn btn-primary" href="${stripe}">Buy Now →</a></div>`;
}
function shopFaq(heading, items) {
  const d = items.map(([q, a]) => `<details><summary>${esc(q)}</summary><div class="answer">${esc(a)}</div></details>`).join('');
  return `\n  <section class="section alt"><div class="wrap"><div class="eyebrow">FAQ</div><h2>${esc(heading)}</h2><div class="faq">${d}</div></div></section>`;
}
function shopHub() {
  return `  <section class="hero"><div class="wrap"><div class="eyebrow">Shop</div><h1>Shop</h1><p class="lead">Computers, backup and security — hand-picked and tested by us.</p></div></section>
  <section class="section"><div class="wrap"><div class="trust-line" style="margin-bottom:36px">All products are personally selected and tested by us before sale. Questions before you buy? Call <a href="${site.phoneHref}">${site.phone}</a>.</div>
    <div class="grid grid-2">
      <a class="card card-link" href="/shop/computers/"><div class="card-icon">🖥️</div><h3>Computers</h3><p>New and refurbished computers — tested and ready to use.</p><span class="arrow">Browse computers →</span></a>
      <a class="card card-link" href="/shop/backup-security/"><div class="card-icon">🛡️</div><h3>Backup & Security</h3><p>External hard drives, NAS solutions and security software we personally recommend.</p><span class="arrow">Browse backup & security →</span></a>
    </div></div></section>`+shopFaq("Shop — common questions", [["Can I request a specific product not currently listed?","Yes, contact us and we'll see what we can source."],["Do you offer bundled deals (e.g. computer + backup drive)?","Ask us directly — bundling can sometimes be arranged."],["Can I trade in an old device toward a new or refurbished purchase?","Contact us to discuss — this can sometimes be arranged depending on the device and its condition."]]);
}
function shopComputers() {
  return `  <section class="hero"><div class="wrap"><div class="eyebrow"><a href="/shop/" style="color:#A9C1F0">Shop</a> · Computers</div><h1>Computers</h1><p class="lead">Choose between new and refurbished computers.</p></div></section>
  <section class="section"><div class="wrap"><div class="crumbs"><a href="/shop/">Shop</a> › <span>Computers</span></div>
    <p class="sub">Whether you want a brand-new machine or a well-maintained, tested computer at a lower price, we have both. Every computer is prepared and tested by us before it's sold.</p>
    <div class="grid grid-2">
      <a class="card card-link" href="/shop/computers/new/"><div class="card-icon">✨</div><h3>New Computers</h3><p>New computers from reliable brands, ready for pickup or delivery.</p><span class="arrow">View new computers →</span></a>
      <a class="card card-link" href="/shop/computers/refurbished/"><div class="card-icon">♻️</div><h3>Refurbished Computers</h3><p>Thoroughly tested and refurbished computers — great performance at a lower price, with warranty.</p><span class="arrow">View refurbished computers →</span></a>
    </div></div></section>`+shopFaq("Computers — common questions", [["Which is better for most people — new or refurbished?","Depends on budget and needs; refurbished offers better value for standard use, new suits those wanting the latest specs and full warranty."]]);
}
function shopNew() {
  const products = [{ img: '/images/shop/thinkpad-t14-new.jpg', alt: 'Lenovo ThinkPad T14 — new', title: 'Lenovo ThinkPad T14 — New', desc: 'Brand new and sealed, direct from supplier. Perfect for office work and everyday use.', price: '6,999 kr.' }];
  return `  <section class="hero"><div class="wrap"><div class="eyebrow"><a href="/shop/computers/" style="color:#A9C1F0">Computers</a> · New</div><h1>New Computers</h1><p class="lead">Ready for pickup or delivery.</p></div></section>
  <section class="section"><div class="wrap"><div class="crumbs"><a href="/shop/">Shop</a> › <a href="/shop/computers/">Computers</a> › <span>New</span></div>
    <p class="sub">New computers from reliable brands. We help you find the right equipment for your needs and budget, and set it up ready to use.</p>
    <div class="placeholder-note">⚙️ Placeholder product below. Add your real new-computer inventory (title, description, price, photo at <code>/images/shop/…</code>, and a Stripe Payment Link — separate from the Danish site).</div>
    <div class="grid grid-3" style="margin-top:24px">${products.map(productCard).join('')}</div></div></section>`+shopFaq("New computers — common questions", [["Can I customize the specs of a new computer before purchase?","Contact us about your requirements — we can often source configurations beyond what's listed."]]);
}
function shopRefurb() {
  const products = [
    { img: '/images/shop/thinkpad-t14-refurbished.jpg', alt: 'Lenovo ThinkPad T14 — refurbished', title: 'Lenovo ThinkPad T14 — Refurbished', desc: 'Thoroughly tested and cleaned by us, with a new battery if needed. Perfect for office work and everyday use. 6-month warranty.', price: '1,999 kr.' },
    { img: '/images/shop/macbook-air-refurbished.jpg', alt: 'MacBook Air M1 — refurbished', title: 'MacBook Air M1 — Refurbished', desc: 'Apple Silicon performance at a lower price. Tested, cleaned and battery-checked. 6-month warranty.', price: '4,499 kr.' },
    { img: '/images/shop/dell-latitude-refurbished.jpg', alt: 'Dell Latitude 7440 — refurbished', title: 'Dell Latitude 7440 — Refurbished', desc: 'Business-grade laptop, professionally refurbished and ready for work. 6-month warranty.', price: '2,799 kr.' },
  ];
  return `  <section class="hero"><div class="wrap"><div class="eyebrow"><a href="/shop/computers/" style="color:#A9C1F0">Computers</a> · Refurbished</div><h1>Refurbished Computers</h1><p class="lead">Tested, cleaned and ready to use — with warranty.</p></div></section>
  <section class="section"><div class="wrap"><div class="crumbs"><a href="/shop/">Shop</a> › <a href="/shop/computers/">Computers</a> › <span>Refurbished</span></div>
    <p class="sub">Thoroughly tested and refurbished computers — great performance at a lower price, with the same service guarantee as our repairs. Tested by the same person who repairs computers in the shop.</p>
    <div class="trust-line" style="margin:20px 0 8px"><strong>What "refurbished" means here:</strong> every machine is tested, cleaned, and fitted with a new battery if needed — then backed by a 6-month warranty. It's the same technician who repairs and refurbishes, so it's held to the same standard as our repair work.</div>
    <div class="placeholder-note">⚙️ Example products below. Refurbished stock changes often — update this page's cards, prices, photos and Stripe links as inventory changes.</div>
    <div class="grid grid-3" style="margin-top:24px">${products.map(productCard).join('')}</div></div></section>`+shopFaq("Refurbished computers — common questions", [["Do refurbished computers come with a licensed operating system?","Yes, all refurbished units include a valid, licensed OS installation."],["What happens to the old parts or devices you replace during refurbishment?","Where possible, working components are reused or recycled responsibly; anything non-functional is disposed of through proper e-waste channels rather than landfill."]]);
}
function shopBackup() {
  const products = [
    { img: '/images/shop/external-hdd-2tb.jpg', alt: 'External hard drive 2TB', title: 'External Hard Drive 2TB — For Automatic Backup', desc: "The drive we personally recommend to customers who want to secure their files. We're happy to help with setup if purchased from us.", price: '599 kr.' },
    { img: '/images/shop/nas-2bay.jpg', alt: '2-bay NAS solution', title: 'NAS 2-Bay — Home & Office Backup', desc: 'A network drive for automatic, redundant backup across all your devices. Setup help included if bought from us.', price: '2,199 kr.' },
    { img: '/images/shop/security-software.jpg', alt: 'Security software licence', title: 'Security Software — 1-Year Licence', desc: 'The endpoint protection we use and recommend — antivirus, ransomware and phishing protection for one computer.', price: '349 kr.' },
  ];
  return `  <section class="hero"><div class="wrap"><div class="eyebrow"><a href="/shop/" style="color:#A9C1F0">Shop</a> · Backup & Security</div><h1>Backup & Security</h1><p class="lead">Equipment and software we personally recommend and use.</p></div></section>
  <section class="section"><div class="wrap"><div class="crumbs"><a href="/shop/">Shop</a> › <span>Backup & Security</span></div>
    <p class="sub">External hard drives, NAS solutions and security software we personally recommend and use. We're happy to help with setup if purchased from us.</p>
    <div class="placeholder-note">⚙️ Example products below. Replace with the exact items you stock, real prices, photos, and Stripe Payment Links (separate from the Danish site).</div>
    <div class="grid grid-3" style="margin-top:24px">${products.map(productCard).join('')}</div></div></section>`+shopFaq("Backup & security — common questions", [["Do you offer cloud backup, or only physical drives?","Both — contact us about your specific needs and budget."]]);
}

// ---------- About / Team ----------
const TEAM = [
  ['Shan — Founder', '/images/team/shan.jpg', '20+ years of experience across Mac, PC, servers, and networks. Oversees the workshop and handles the most technically demanding repairs and business IT setups personally.'],
  ['On-Site Technician', '/images/team/on-site-technician-1.jpg', 'Handles home and office visits across Frederiksberg and Copenhagen — network setups, on-location troubleshooting, and hands-on work outside the workshop.'],
  ['On-Site Technician', '/images/team/on-site-technician-2.jpg', 'Handles home and office visits across Frederiksberg and Copenhagen — network setups, on-location troubleshooting, and hands-on work outside the workshop.'],
  ['Mac Specialist', '/images/team/mac-specialist.jpg', "Independent, not Apple-authorized — which means more flexibility: component-level repairs authorized shops often can't perform, and honest advice about repair vs. replace without pressure toward pricier official channels."],
  ['Website & SEO Specialist', '/images/team/seo-specialist.jpg', "15 years of experience, responsible for the technical and search side of PCKlinik's own web presence, as well as the Websites & SEO services we offer to clients."],
  ['Team Member', '/images/team/team-member-6.jpg', 'Rounds out the team for day-to-day repairs and customer support.'],
  ['Team Member', '/images/team/team-member-7.jpg', 'Rounds out the team for day-to-day repairs and customer support.'],
];
function aboutBody() {
  const cards = TEAM.map(([name, img, bio]) => `<div class="card"><img class="img-placeholder" src="${img}" alt="${esc(name)}" loading="lazy" width="480" height="360" /><h3>${esc(name)}</h3><p>${esc(bio)}</p></div>`).join('');
  return `  <section class="hero"><div class="wrap"><div class="eyebrow">About PCKlinik</div><h1>Meet the Team</h1>
    <p class="lead">Real people, real experience — not a call center. PCKlinik is a team of 7, based in our workshop on Falkoner All&eacute; in Frederiksberg. Between us, we cover PC and Mac repair, networks and servers, on-site support, and website/SEO work — so whatever you need, there's someone on the team who genuinely knows it well.</p></div></section>
  <section class="section"><div class="wrap"><div class="eyebrow">The team</div><h2>Seven people, one workshop</h2>
    <div class="grid grid-3" style="margin-top:24px">${cards}</div></div></section>
  <section class="section alt"><div class="wrap"><div class="eyebrow">Why this matters for you</div><h2>A bigger team — same straight answers</h2>
    <p class="sub">A bigger team means faster turnaround and more specialized expertise — but we still work the same way we always have: you get a straight answer from someone who actually knows what they're talking about, not a ticket number in a queue.</p>
    <div class="cta-row"><a class="btn btn-primary" href="/contact/">Contact us</a><a class="btn btn-outline" href="/business-it-service-agreement/">Business IT Support →</a></div></div></section>`;
}

// ---------- Arabic (RTL) section ----------
function headerAr(p) {
  const svc = (slug) => { const it = arServices.find((x) => x.slug === slug); return { label: it.label, href: `/ar/${slug}/` }; };
  const nav = [
    { label: 'الرئيسية', href: '/ar/' },
    { label: 'الدعم التقني للشركات', href: '/ar/business-it-service-agreement/' },
    { label: 'المواقع وتحسين محركات البحث', href: '/ar/website-design/', children: [
      { label: 'تصميم المواقع', href: '/ar/website-design/' },
      { label: 'تحسين محركات البحث (SEO)', href: '/ar/seo-services/' },
      { label: 'إعلانات جوجل', href: '/ar/google-ads/' },
      { label: 'استشارات تقنية للأعمال', href: '/ar/business-it/' },
    ] },
    { label: 'الخدمات', href: '/ar/', flyout: [
      { label: 'حسب الماركة', children: arBrands.map((b) => ({ label: b.label, href: `/ar/${b.slug}/` })) },
      { label: 'الإصلاح والصيانة', children: ['ssd-upgrade', 'pc-optimization', 'hard-drive-replacement', 'screen-replacement', 'liquid-damage-repair', 'pc-cleaning', 'charging-port-repair', 'keyboard-replacement', 'mac-cleaning', 'mac-battery-replacement', 'mac-screen-replacement', 'mac-keyboard-replacement', 'mac-trackpad-replacement'].map(svc) },
      { label: 'البيانات والأمان', children: ['data-backup-and-recovery', 'virus-removal'].map(svc) },
      { label: 'الدعم عن بُعد والتثبيت', children: [{ label: 'الدعم الفني عن بُعد', href: '/ar/remote-support/' }, svc('system-installation')] },
      { label: 'معدات الشبكة', children: arNetwork.map((n) => ({ label: n.label, href: `/ar/${n.slug}/` })).concat([svc('wifi-network-troubleshooting')]) },
      { label: 'المساعدة والأدلة', children: ['computer-wont-turn-on', 'error-messages'].map(svc) },
    ] },
    { label: 'المتجر', href: '/ar/shop/', children: arShop.map((sh) => ({ label: sh.label, href: `/ar/${sh.slug}/` })) },
    { label: 'اتصل بنا', href: '/ar/contact/' },
  ];
  const items = nav.map((item) => {
    if (item.flyout) {
      const cats = item.flyout.map((cat) => {
        const links = cat.children.map((c) => `<a href="${c.href}">${esc(c.label)}</a>`).join('');
        return `<div class="flyout-cat"><button type="button" class="flyout-cat-label">${esc(cat.label)} <span aria-hidden="true">◂</span></button><div class="flyout-panel">${links}</div></div>`;
      }).join('');
      return `<div class="nav-item dropdown flyout"><a href="${item.href}">${esc(item.label)} <span aria-hidden="true">▾</span></a><div class="dropdown-menu flyout-menu">${cats}</div></div>`;
    }
    if (item.children) {
      const menu = item.children.map((c) => `<a href="${c.href}">${esc(c.label)}</a>`).join('');
      return `<div class="nav-item dropdown"><a href="${item.href}">${esc(item.label)} <span aria-hidden="true">▾</span></a><div class="dropdown-menu">${menu}</div></div>`;
    }
    return `<div class="nav-item"><a href="${item.href}" class="${p === item.href ? 'active' : ''}">${esc(item.label)}</a></div>`;
  }).join('');
  return `<div class="topbar"><div class="wrap">
    <span>${lucideSm.phone} <a href="${site.phoneHref}">${arPhone}</a></span>
    <span class="lang-switch"><a href="${enHrefAr(p)}" hreflang="en" lang="en">English</a></span>
  </div></div><header class="site-header"><div class="wrap">
    <a href="/ar/" class="brand" aria-label="PCKlinik"><img src="/logo.png" alt="PCKlinik" width="100" height="40" /></a>
    <nav class="main" id="mainnav">${items}<div class="nav-item"><a href="${enHrefAr(p)}" hreflang="en" lang="en">English</a></div></nav>
    <button class="nav-toggle" id="navtoggle" aria-label="القائمة" aria-expanded="false"><span></span><span></span><span></span></button>
  </div></header>`;
}
function enHrefAr(p) { return AR_EN_MAP[p] || (p === '/ar/' ? '/' : p.replace(/^\/ar/, '')); }
function footerAr() {
  const year = new Date().getFullYear();
  const links = arNav.map((i) => `<a href="${i.href}">${esc(i.label)}</a>`).join('');
  return `<footer class="site-footer"><div class="wrap"><div class="cols">
    <div><h2>PCKlinik</h2><a href="/ar/" style="color:var(--muted)">دعم تقني وخدمات ويب عن بُعد — بفريق يتحدث العربية.</a></div>
    <div><h2>الخدمات عن بُعد</h2>${links}</div>
    <div><h2>المتجر</h2>${arShop.map((sh) => `<a href="/ar/${sh.slug}/">${esc(sh.label)}</a>`).join('')}</div>
    <div><h2>المناطق التي نخدمها</h2><a href="/ar/computer-repair-copenhagen/" lang="en">Copenhagen</a><a href="/ar/computer-repair-frederiksberg/" lang="en">Frederiksberg</a><a href="/ar/computer-repair-vesterbro/" lang="en">Vesterbro</a><a href="/ar/computer-repair-vanloese/" lang="en">Vanl&oslash;se</a><a href="/ar/computer-repair-valby/" lang="en">Valby</a><a href="/ar/computer-repair-nordvest/" lang="en">Nordvest</a></div>
    <div><h2>لغة أخرى</h2><a href="/" hreflang="en" lang="en">English site</a><a href="/contact/" hreflang="en" lang="en">Contact (in English)</a></div>
  </div><div class="footer-bottom"><div class="footer-nap">PCKlinik · Falkoner All&eacute; 108, 2000 Frederiksberg · <bdi>+45 91 81 61 81</bdi></div><div>© ${year} PCKlinik · CVR-nr. 33275145 · Frederiksberg</div></div></div></footer>`;
}
function arPageHtml(pg) {
  const cards = pg.cards ? `<section class="section"><div class="wrap"><div class="grid grid-3">${pg.cards.map((c) => `<a class="card card-link" href="${c.href}"><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p><span class="arrow">التفاصيل →</span></a>`).join('')}</div></div></section>` : '';
  const sections = (pg.sections || []).map((sec) => `<section class="section"><div class="wrap"><div class="eyebrow">${esc(sec.heading)}</div><ul class="check-list">${sec.items.map((it) => `<li>${esc(it)}</li>`).join('')}</ul></div></section>`).join('');
  const callout = pg.callout ? `<section class="section"><div class="wrap"><div class="callout"><strong>${esc(pg.callout.label)}:</strong> ${esc(pg.callout.text)}</div></div></section>` : '';
  const faq = pg.faq ? `<section class="section alt"><div class="wrap"><div class="eyebrow">الأسئلة الشائعة</div><div class="faq">${pg.faq.map((f) => `<details><summary>${esc(f.q)}</summary><div class="answer">${esc(f.a)}</div></details>`).join('')}</div></div></section>` : '';
  const cta = `<section class="section alt"><div class="wrap"><div class="cta-band"><h2>هل لديكم سؤال؟</h2><p>تواصلوا معنا وسنرد عليكم بلغتكم مباشرة.</p><div class="cta-row"><a class="btn btn-white" href="${site.phoneHref}">📞 ${arPhone}</a><a class="btn btn-ghost-light" href="mailto:${site.emailConsumer}">${arEmail}</a></div></div></div></section>`;
  return `  <section class="hero"><div class="wrap"><div class="eyebrow">PCKlinik · عن بُعد</div><h1>${esc(pg.h1)}</h1>${pg.sub ? `<p class="lead">${esc(pg.sub)}</p>` : ''}</div></section>
  <section class="section"><div class="wrap"><div class="lead-copy" style="max-width:760px">${pg.body}</div></div></section>
  ${cards}${sections}${callout}${faq}${cta}`;
}

// ---------- Arabic homepage + brand pages ----------
const AR_HOME_FAQ = [
  { q: 'هل تتحدثون العربية؟', a: 'نعم، فريقنا يضم متحدثين بالعربية والإنجليزية.' },
  { q: 'هل تصلحون كل ماركات الحاسوب؟', a: 'نعم، نصلح جميع الماركات الرئيسية، بالإضافة إلى الأجهزة المخصصة.' },
  { q: 'كم تكلفة الإصلاح؟', a: 'التشخيص القياسي مجاني (2–4 أيام)، أو سريع مقابل 600 كرونة (1–2 ساعة). ستحصلون دائمًا على سعر ثابت قبل بدء أي عمل.' },
  { q: "كيف يتم الدفع للعملاء خارج الدنمارك؟", a: "نقبل التحويل البنكي الدولي وبطاقات الدفع. سنوضح تفاصيل الدفع بوضوح عند الاتفاق على المشروع." },
  { q: "هل تتعاملون مع فروق التوقيت؟", a: "نعم، نتفق مسبقًا على أوقات مناسبة للتواصل تناسب منطقتكم الزمنية." },
  { q: "هل تتحدثون لهجات عربية غير الفصحى؟", a: "نتواصل بالعربية الفصحى بشكل أساسي، وبعض أفراد الفريق يفهمون لهجات معينة — أخبرونا وسنبذل جهدنا للتواصل بالطريقة الأنسب لكم." },
  { q: "بأي عملة تكون الفواتير؟", a: "عادة باليورو أو الكرونة الدنماركية — يمكن مناقشة ذلك حسب موقعكم عند بدء المشروع." },
  { q: "هل هناك حد أدنى لحجم المشروع؟", a: "لا يوجد حد أدنى صارم — تواصلوا معنا وسنخبركم إن كان مشروعكم مناسبًا لخدماتنا." },
];
function arHomeHtml() {
  const grid = arBrands.map((b) => `<a class="card card-link" href="/ar/${b.slug}/"><h3>${esc(b.label)}</h3><p>${esc(b.gridSub)}</p><span class="arrow">التفاصيل →</span></a>`).join('');
  const remote = [
    ['/ar/remote-support/', 'الدعم الفني عن بُعد', 'حل مشاكل البرامج والفيروسات وإعدادات النظام دون زيارة الورشة.'],
    ['/ar/website-design/', 'تصميم المواقع الإلكترونية', 'مواقع حديثة وسريعة، مبنية بأسس تقنية صحيحة.'],
    ['/ar/seo-services/', 'تحسين محركات البحث (SEO)', 'بحث كلمات مفتاحية حقيقي وتحسين تقني.'],
    ['/ar/business-it/', 'استشارات تقنية للأعمال', 'إعداد الشبكات والأمان واستراتيجية تقنية عن بُعد.'],
  ].map(([h, t, d]) => `<a class="card card-link" href="${h}"><h3>${esc(t)}</h3><p>${esc(d)}</p><span class="arrow">التفاصيل →</span></a>`).join('');
  const faq = AR_HOME_FAQ.map((f) => `<details><summary>${esc(f.q)}</summary><div class="answer">${esc(f.a)}</div></details>`).join('');
  return `  <section class="hero"><div class="wrap"><div class="eyebrow">Frederiksberg وCopenhagen · نتحدث العربية والإنجليزية</div>
    <h1>إصلاح الحاسوب وخدمات تقنية المعلومات — لك أو لعملك</h1>
    <p class="lead">إصلاح سريع وصادق للأفراد. دعم تقني بسعر ثابت للشركات. لا حاجة للدنماركية أو الإنجليزية — نتحدث العربية أيضًا.</p>
    <p class="lead" style="font-size:15px">إذا كنتم في Copenhagen، يمكننا أيضًا الاجتماع شخصيًا في ورشتنا لمناقشة مشروعكم — الخدمة عن بُعد اختيارية، وليست إلزامية.</p></div></section>
  <section class="section"><div class="wrap"><div class="grid grid-2">
    <a class="card card-link" href="/ar/mac-repair/"><div class="card-icon">🖥️</div><h3>للأفراد</h3><p>إصلاح الحاسوب وMac — تشخيص مجاني أو سريع، سعر ثابت، معظم الإصلاحات في نفس اليوم.</p><span class="arrow">احجز إصلاحًا ←</span></a>
    <a class="card card-link" href="/ar/business-it/"><div class="card-icon">🏢</div><h3>للشركات</h3><p>اتفاقيات دعم تقني بسعر ثابت — دعم غير محدود، مراقبة، وأمان لسعر شهري ثابت.</p><span class="arrow">شاهد خطط الدعم التقني ←</span></a>
  </div></div></section>
  <section class="section alt"><div class="wrap"><div class="eyebrow">كيف نعمل</div><h2>ثلاث خطوات بسيطة</h2><div class="steps">
    <div class="step"><div class="num">1</div><h3>التشخيص</h3><p>مجاني (2–4 أيام)، أو سريع مقابل 600 كرونة (1–2 ساعة).</p></div>
    <div class="step"><div class="num">2</div><h3>سعر ثابت</h3><p>تحصلون على سعر واضح قبل أن نلمس أي شيء.</p></div>
    <div class="step"><div class="num">3</div><h3>الإصلاح</h3><p>ننفذ الإصلاح بنفس العناية.</p></div>
  </div></div></section>
  <section class="section"><div class="wrap"><div class="eyebrow">ما نصلحه</div><h2>الماركات التي نصلحها</h2>
    <div class="grid grid-3" style="margin-top:24px">${grid}</div></div></section>
  <section class="section alt"><div class="wrap"><div class="eyebrow">خدمات عن بُعد</div><h2>لعملائنا في كل مكان</h2>
    <div class="grid grid-2" style="margin-top:24px">${remote}</div></div></section>
  <section class="section"><div class="wrap"><div class="eyebrow">خدمات الإصلاح والصيانة</div><h2>خدمات شائعة</h2><div class="crosslinks" style="margin-top:8px">${[...arServices, ...arNetwork].map((sv) => `<a href="/ar/${sv.slug}/">${esc(sv.label)} →</a>`).join('')}</div></div></section>
  <section class="section alt"><div class="wrap"><div class="eyebrow">لماذا PCKlinik</div><h2>لماذا تختارنا</h2><ul class="why-list">
    <li><strong>خبرة حقيقية</strong>فريق متمرس، وليس مركز اتصال.</li>
    <li><strong>سعر ثابت قبل البدء</strong>بدون مفاجآت.</li>
    <li><strong>نتحدث العربية والإنجليزية</strong>لا حاجة للدنماركية.</li></ul></div></section>
  <section class="section"><div class="wrap"><div class="eyebrow">الأسئلة الشائعة</div><h2>أسئلة متكررة</h2><div class="faq">${faq}</div></div></section>
  <section class="section"><div class="wrap"><div class="cta-band"><h2>هل لديكم سؤال؟</h2><p>تواصلوا معنا وسنرد عليكم بلغتكم مباشرة.</p><div class="cta-row"><a class="btn btn-white" href="${site.phoneHref}">📞 ${arPhone}</a><a class="btn btn-ghost-light" href="mailto:${site.emailConsumer}">${arEmail}</a></div></div></div></section>`;
}
function arBrandHtml(b) {
  const models = b.models ? `<p class="sub"><strong>الطرازات:</strong> ${esc(b.models)}</p>` : '';
  const callout = b.callout ? `<section class="section"><div class="wrap"><div class="callout"><strong>${esc(b.callout.label)}:</strong> ${esc(b.callout.text)}</div></div></section>` : '';
  const map = b.map ? `<section class="section alt"><div class="wrap"><div class="eyebrow">موقعنا</div><h2>Falkoner All&eacute; 108, Frederiksberg</h2>${mapFrame}</div></section>` : '';
  const cards = b.cards ? `<section class="section"><div class="wrap"><div class="grid grid-2">${b.cards.map((c) => `<a class="card card-link" href="${c.href}"><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p><span class="arrow">التفاصيل →</span></a>`).join('')}</div></div></section>` : '';
  const faq = b.faq ? `<section class="section alt"><div class="wrap"><div class="eyebrow">الأسئلة الشائعة</div><div class="faq">${b.faq.map((f) => `<details><summary>${esc(f.q)}</summary><div class="answer">${esc(f.a)}</div></details>`).join('')}</div></div></section>` : '';
  return `  <section class="hero"><div class="wrap"><div class="crumbs"><a href="/ar/">الرئيسية</a> › <span>${esc(b.label)}</span></div><h1>${esc(b.h1)}</h1></div></section>
  <section class="section"><div class="wrap"><div class="lead-copy" style="max-width:760px"><p>${esc(b.intro)}</p></div>${models}</div></section>
  ${callout}${cards}${faq}${map}
  <section class="section"><div class="wrap"><div class="cta-band"><h2>احجز تشخيصًا</h2><p>تشخيص مجاني (2–4 أيام) أو سريع مقابل 600 كرونة (1–2 ساعة). سعر ثابت قبل أن نبدأ.</p><div class="cta-row"><a class="btn btn-white" href="${site.phoneHref}">📞 ${arPhone}</a><a class="btn btn-ghost-light" href="mailto:${site.emailConsumer}">${arEmail}</a></div></div></div></section>`;
}

// ---------- Arabic Business IT (full pricing page) ----------
const AR_BIZ_TIERS = [
  ['الأساسية (Starter)', 'دعم عن بُعد غير محدود وصيانة استباقية للشركات الصغيرة.', '399', false,
    [['yes', 'دعم عن بُعد غير محدود'], ['yes', 'استجابة خلال يوم واحد'], ['yes', 'إدارة عن بُعد (RMM)'], ['yes', 'تحديثات دورية'], ['yes', 'تقرير شهري'], ['no', 'برنامج حماية وأمان النقاط الطرفية'], ['no', 'مراقبة النسخ الاحتياطي']]],
  ['المميزة (Premium)', 'كل ما في الأساسية، بالإضافة إلى حماية وأمان كامل.', '599', true,
    [['yes', 'كل ما في الأساسية'], ['yes', 'برنامج حماية وأمان النقاط الطرفية'], ['yes', 'استجابة خلال 4 ساعات'], ['yes', 'مراقبة على مدار الساعة'], ['yes', 'مراقبة النسخ الاحتياطي'], ['yes', 'إدارة Microsoft 365'], ['yes', 'المصادقة الثنائية (MFA)']]],
  ['الحصرية (Exclusive)', 'كل ما في المميزة، بالإضافة إلى تراخيص Microsoft 365.', '899', false,
    [['yes', 'كل ما في المميزة'], ['yes', 'ترخيص Microsoft 365 (Outlook، Teams، OneDrive، Exchange)'], ['yes', 'الإعداد والترحيل الكامل'], ['yes', 'سحابة جاهزة لمتطلبات حماية البيانات (GDPR)']]],
];
const AR_BIZ_FAQ = [
  { q: "هل يمكن للسفارات أو البعثات الدبلوماسية طلب فوترة معفاة من ضريبة القيمة المضافة؟", a: "تواصلوا معنا مباشرة لمناقشة متطلباتكم الإدارية والفوترة — يسعدنا العمل ضمن إجراءات الشراء في مؤسستكم." },
  { q: "هل تقدمون إعدادًا لعدد كبير من الموظفين دفعة واحدة؟", a: "نعم — الإعداد الجماعي (موظفون جدد متعددون، أو ترحيل أجهزة فريق كامل) جزء من اتفاقية الدعم." },
  { q: "هل يمكنكم العمل مع نظام توثيق تقنية المعلومات أو جرد الأصول الحالي لدينا؟", a: "نعم — تواصلوا معنا حول أنظمتكم وسنتكيّف مع إجراءاتكم القائمة بدلاً من مطالبتكم بتغييرها." },
  { q: "ما تكلفة اتفاقية الدعم التقني؟", a: "لدينا ثلاث باقات: الأساسية من 399 كرونة، المميزة 599 كرونة، والحصرية 899 كرونة لكل مستخدم شهريًا (بدون ضريبة القيمة المضافة). سعر شهري ثابت، تعرفون التكلفة مقدمًا. غير متأكدين من الباقة المناسبة؟ احجزوا مراجعة." },
  { q: "هل هناك رسوم خفية؟", a: "لا أبدًا. سعر شهري ثابت لكل مستخدم فقط. بدون رسوم إعداد، بدون رسوم بالساعة، وبدون مفاجآت في الفاتورة." },
  { q: "ما وقت الاستجابة لديكم؟", a: "نضمن الاستجابة خلال 4 ساعات في أوقات العمل الرسمية (الاثنين–الجمعة 10:00–17:00). معظم الطلبات تُحل في نفس اليوم — كثير منها خلال الساعة الأولى." },
  { q: "هل يمكنني إلغاء اشتراكي في أي وقت؟", a: "الاشتراكات الشهرية تُلغى بإشعار شهر واحد. الاشتراكات السنوية تستمر حتى نهاية المدة. لا التزام بعد ذلك." },
  { q: "ماذا يغطي \"الدعم غير المحدود\"؟", a: "كل ما يتعلق بتقنيتكم اليومية: مشاكل الحاسوب والبرامج، الشبكة، الطابعات، البريد، Microsoft 365، الفيروسات والأمان. لا يشمل استبدال العتاد أو التطوير المخصص — نتفق عليها بشكل منفصل." },
  { q: "هل يناسب هذا الشركات بأي حجم؟", a: "نعم. نساعد رواد الأعمال الأفراد، والمكاتب بموظفين 2–3، والشركات التي تضم أكثر من 50 مستخدمًا. السعر لكل مستخدم، فتدفعون بالضبط لما تحتاجونه." },
  { q: "هل أحتاج لتثبيت أي شيء؟", a: "نثبّت أداة وصول عن بُعد صغيرة (TeamViewer أو ما شابه) لنساعدكم بسرعة دون حاجة للحضور إلينا. الإعداد يستغرق عادة أقل من 15 دقيقة ونتولاه بأنفسنا." },
  { q: "هل تساعدون في الطابعات وطابعات الشبكة؟", a: "نعم. نعد ونضبط ونستكشف أخطاء جميع أنواع الطابعات — المحلية والشبكية والسحابية. ونساعد في تحديث التعريفات والدمج مع شبكتكم الحالية." },
  { q: "هل تقدمون حلول نسخ احتياطي؟", a: "نعم. نعد نسخًا احتياطيًا تلقائيًا — محليًا وسحابيًا — لتبقى بياناتكم محمية دائمًا. نختبر النسخ الاحتياطي دوريًا ونساعد في الاسترجاع عند الحاجة." },
  { q: "ماذا عن برنامج الحماية وأمان المعلومات؟", a: "نثبّت وندير برنامج الحماية وأمان النقاط الطرفية على جميع أجهزتكم. باقة المميزة تشمل مراقبة أمنية مستمرة، فتكونون محميين من الفيروسات وبرامج الفدية والتصيّد." },
  { q: "هل يمكنكم المساعدة في الشبكة وWiFi؟", a: "نعم. نعد ونحسّن الشبكات والراوترات وWiFi — بما في ذلك شبكات الضيوف والجدران النارية وVPN. إنترنت بطيء أو تغطية ضعيفة؟ سنجد الحل." },
  { q: "هل تبيعون الحواسيب والمعدات؟", a: "نعم. نبيع معدات جديدة ومستعملة/مجددة — حواسيب، لابتوبات، شاشات، طابعات للأعمال، وملحقات. المعدات المجددة مفحوصة باحتراف وبضمان. نساعدكم في اختيار المعدات المناسبة لاحتياجاتكم وميزانيتكم ونجهزها للاستخدام." },
  { q: "ما الفرق بين اتفاقية الدعم والفوترة بالساعة؟", a: "مع الاتفاقية تدفعون سعرًا شهريًا ثابتًا وتحصلون على دعم غير محدود دون التفكير في تكلفة كل مكالمة. الفوترة بالساعة تُدفع لكل مهمة، ما يجعل التكاليف غير متوقعة وغالبًا أغلى. الاتفاقية تعني أيضًا عملًا استباقيًا، فتقل المشاكل من الأساس." },
  { q: "هل يمكنكم استلام المهمة من مزود تقنية المعلومات الحالي لدينا؟", a: "نعم. ندير انتقالًا سلسًا، ونجمع المعلومات اللازمة، ونتولى التشغيل دون أن تواجهوا أي تعطل. لا تحتاجون لتنسيق ذلك بأنفسكم." },
  { q: "ما سرعة البدء؟", a: "عادة خلال أيام قليلة. نبدأ بمراجعة، ونعد الوصول عن بُعد (أقل من 15 دقيقة)، وندير اتفاقيتكم من هناك." },
  { q: "هل تساعدون في NIS2 وGDPR؟", a: "نعم. نقدم المشورة حول GDPR وتوجيه NIS2 الجديد، ونساعد في النسخ الاحتياطي وإدارة الوصول والأمان والتوثيق لتلبية المتطلبات." },
  { q: "هل تدعمون الموظفين العاملين من المنزل؟", a: "نعم. دعمنا لا يعتمد على موقع الموظف. نساعد عبر الدعم عن بُعد، سواء في المكتب أو المنزل، ونضمن اتصالاً مستقرًا بأنظمة الشركة." },
  { q: "ماذا يحدث أثناء انقطاع تقني؟", a: "تتواصلون معنا ونبدأ فورًا. بفضل المراقبة، غالبًا نكتشف المشكلة قبل أن تلاحظوها. هدفنا إعادتكم للعمل بأسرع وقت وتقليل التعطل لأدنى حد." },
  { q: "هل تساعدون الشركات في كل أنحاء الدولة؟", a: "نعم. الدعم عن بُعد يغطي كل الدنمارك. ونقدم خدمة ميدانية في Copenhagen وFrederiksberg حيث مقرنا." },
];
function arBusinessHtml() {
  const price = AR_BIZ_TIERS.map(([name, blurb, p, feat, items]) => {
    const li = items.map(([k, l]) => `<li class="${k}">${esc(l)}</li>`).join('');
    const signup = `mailto:${site.emailBusiness}?subject=${encodeURIComponent('اشتراك: باقة ' + name)}`;
    return `<div class="price-card${feat ? ' featured' : ''}">${feat ? '<span class="ribbon">⭐ الموصى بها</span>' : ''}<div class="tag">${esc(name)}</div><h3>${esc(name)}</h3><p class="blurb">${esc(blurb)}</p><div class="price">${p} كرونة <small>/ مستخدم / شهر</small></div><div class="vat">بدون ضريبة القيمة المضافة</div><ul>${li}</ul><a class="btn ${feat ? 'btn-primary' : 'btn-outline'}" href="${signup}">اختيار ${esc(name)}</a></div>`;
  }).join('');
  const faqHtml = AR_BIZ_FAQ.map((f) => `<details><summary>${esc(f.q)}</summary><div class="answer">${esc(f.a)}</div></details>`).join('');
  return `  <section class="hero"><div class="wrap"><div class="eyebrow">الأعمال · اتفاقية الدعم التقني</div>
    <h1>اتفاقية الدعم التقني للشركات</h1>
    <p class="lead">قسم تقنية المعلومات الخاص بكم، بالاشتراك. دعم غير محدود، مراقبة استباقية، وأمان تقني لسعر شهري ثابت. فريق يتحدث العربية والدنماركية والإنجليزية.</p>
    <div class="cta-row"><a class="btn btn-white" href="${site.phoneHref}">📞 ${arPhone}</a><a class="hero-text-link" href="#pricing">شاهد الأسعار ←</a></div></div></section>
  <section class="section alt"><div class="wrap"><div class="eyebrow">ما هي اتفاقية الدعم التقني؟</div><h2>اتفاقية واحدة ثابتة — وتقنيتكم تعمل ببساطة</h2>
    <p class="sub">بدلاً من انتظار مشكلة لحلها، نمنعها من الحدوث، وندير أنظمتكم باستمرار. تحصلون على مدير تقني مخصص يعرف إعدادكم ويتدخل فور حدوث أي خلل — دون فواتير مفاجئة.</p></div></section>
  <section class="section"><div class="wrap"><div class="eyebrow">كيف تبدأون</div><h2>ثلاث خطوات بسيطة</h2><div class="steps">
    <div class="step"><div class="num">1</div><h3>مراجعة تقنية مجانية</h3><p>نستعرض إعدادكم الحالي ونحدد الثغرات وفرص التوفير.</p></div>
    <div class="step"><div class="num">2</div><h3>خطة مخصصة</h3><p>نقترح المستوى الأنسب لحجم شركتكم واحتياجاتها.</p></div>
    <div class="step"><div class="num">3</div><h3>بدء الاتفاقية</h3><p>دعم مستمر يبدأ فورًا — دعم ومراقبة وأمان.</p></div></div></div></section>
  <section class="section alt" id="pricing"><div class="wrap"><div class="eyebrow">الأسعار والباقات</div><h2>أسعار شفافة — بدون مفاجآت</h2>
    <p class="sub">اختاروا الباقة المناسبة لشركتكم. سعر ثابت لكل مستخدم، بدون ضريبة القيمة المضافة، بدون التزام.</p>
    <div class="pricing-grid">${price}</div></div></section>
  <section class="section"><div class="wrap"><div class="eyebrow">لماذا PCKlinik</div><h2>شريك تقني محلي حقيقي — وليس مركز اتصال</h2><ul class="why-list">
    <li><strong>تكلفة تقنية ثابتة ومتوقعة</strong>سعر شهري ثابت، بدون رسوم بالساعة أو مفاجآت.</li>
    <li><strong>تعرفون مدير تقنيتكم</strong>مدير تقني مخصص يعرف إعدادكم وعملكم.</li>
    <li><strong>مساعدة سريعة</strong>معظم الحالات تُحل في نفس اليوم عبر الدعم عن بُعد.</li>
    <li><strong>محلي وعلى مستوى الدنمارك</strong>حضور ميداني في Copenhagen ودعم عن بُعد في كل الدنمارك.</li>
    <li><strong>نتحدث العربية والدنماركية والإنجليزية</strong>نعمل مع شركات وسفارات دولية يوميًا.</li></ul></div></section>
  <section class="section" id="enquiry"><div class="wrap"><div class="eyebrow">تواصلوا معنا</div><h2>احجزوا مراجعة تقنية مجانية</h2>
    <p class="sub">أخبرونا قليلاً عن شركتكم وسنعاود التواصل معكم — دون أي التزام.</p>
    <div class="form-card" style="max-width:640px">
      ${formOpen(site.emailBusiness, 'New Business IT enquiry (AR) — pcklinik.eu', '/ar/thank-you/')}
        <div class="form-row"><div><label for="arbiz-name">الاسم</label><input id="arbiz-name" name="name" type="text" required /></div></div>
        <div class="form-row"><div><label for="arbiz-company">الشركة <span style="font-weight:400;color:var(--muted)">(اختياري)</span></label><input id="arbiz-company" name="company" type="text" /></div></div>
        <div class="form-row"><div><label for="arbiz-email">البريد الإلكتروني</label><input id="arbiz-email" name="email" type="email" required /></div></div>
        <div class="form-row"><div><label for="arbiz-phone">الهاتف <span style="font-weight:400;color:var(--muted)">(اختياري)</span></label><input id="arbiz-phone" name="phone" type="tel" /></div></div>
        <div class="form-row"><div><label for="arbiz-message">بماذا يمكننا مساعدتكم؟</label><textarea id="arbiz-message" name="message" required></textarea></div></div>
        <button class="btn btn-primary" type="submit">اطلبوا مراجعة تقنية مجانية</button>
      </form>
    </div></div></section>
  <section class="section alt"><div class="wrap"><div class="eyebrow">الأسئلة الشائعة</div><h2>أسئلة متكررة</h2><div class="faq">${faqHtml}</div></div></section>
  <section class="section"><div class="wrap"><div class="cta-band"><h2>احجزوا مراجعة تقنية مجانية</h2><p>تواصلوا معنا وسنرد عليكم بلغتكم مباشرة.</p><div class="cta-row"><a class="btn btn-white" href="${site.phoneHref}">📞 ${arPhone}</a><a class="btn btn-ghost-light" href="mailto:${site.emailBusiness}">${arEmail}</a></div></div></div></section>`;
}

// ---------- Thank-you pages ----------
function thankYouHtml() {
  return `  <section class="hero"><div class="wrap"><div class="eyebrow">PCKlinik</div><h1>Thank You</h1>
    <p class="lead">Your message has been sent. We'll get back to you as soon as possible.</p>
    <div class="cta-row"><a class="btn btn-white" href="/">← Back to homepage</a></div></div></section>`;
}
function thankYouArHtml() {
  return `  <section class="hero"><div class="wrap"><div class="eyebrow">PCKlinik</div><h1>شكرًا لكم</h1>
    <p class="lead">تم إرسال رسالتكم. سنتواصل معكم في أقرب وقت ممكن.</p>
    <div class="cta-row"><a class="btn btn-white" href="/ar/">→ العودة للصفحة الرئيسية</a></div></div></section>`;
}

// ---------- Arabic Contact ----------
function arContactHtml() {
  return `  <section class="hero"><div class="wrap"><div class="eyebrow">تواصلوا معنا</div><h1>تواصلوا معنا</h1>
    <p class="lead">لديكم سؤال حول إصلاح، أو تريدون حجز موعد؟ اتصلوا، راسلونا، أو مروا بالورشة على Falkoner All&eacute; — نرد بسرعة، بالعربية والدنماركية والإنجليزية.</p>
    <div class="badges"><span class="badge check">خدمة بدون موعد مسبق</span><span class="badge check">خدمة استلام وتوصيل متاحة</span></div></div></section>
  <section class="section"><div class="wrap"><div class="info-block">
    <div class="nap"><div class="eyebrow">بيانات التواصل</div>
      <p><strong>الهاتف</strong><br /><a href="${site.phoneHref}">${arPhone}</a></p>
      <p><strong>البريد الإلكتروني</strong><br /><a href="mailto:${site.emailConsumer}">${arEmail}</a></p>
      <p><strong>العنوان</strong><br /><bdi>Falkoner All&eacute; 108, 2000 Frederiksberg</bdi></p>
      <p><strong>ساعات العمل</strong><br />الاثنين–الجمعة 10:00–18:00 · السبت 10:00–14:00 · الأحد مغلق</p></div>
    <div class="form-card">
      ${formOpen(site.emailConsumer, 'New contact form (AR) — pcklinik.eu', '/ar/thank-you/')}
        <div class="form-row"><div><label for="arc-name">الاسم</label><input id="arc-name" name="name" type="text" required /></div></div>
        <div class="form-row"><div><label for="arc-email">البريد الإلكتروني</label><input id="arc-email" name="email" type="email" required /></div></div>
        <div class="form-row"><div><label for="arc-subject">الموضوع</label><input id="arc-subject" name="subject" type="text" /></div></div>
        <div class="form-row"><div><label for="arc-message">الرسالة</label><textarea id="arc-message" name="message" required></textarea></div></div>
        <button class="btn btn-primary" type="submit">إرسال</button>
      </form></div></div></div></section>
  <section class="section alt"><div class="wrap"><div class="eyebrow">موقعنا</div><h2>Falkoner All&eacute; 108, Frederiksberg</h2>${mapFrame}</div></section>`;
}

// ---------- News ----------
function fmtDate(d) {
  const [y, m, day] = d.split('-').map(Number);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${day} ${months[m - 1]} ${y}`;
}
function newsIndexHtml() {
  const cards = news.map((n) => `<a class="card card-link" href="/news/${n.slug}/"><div class="eyebrow" style="margin-bottom:8px">${esc(n.category)} · ${esc(fmtDate(n.date))}</div><h3>${esc(n.title)}</h3><p>${esc(n.description)}</p><span class="arrow">Read more →</span></a>`).join('');
  return `  <section class="hero"><div class="wrap"><div class="eyebrow">News · Guides</div><h1>News &amp; Guides</h1>
    <p class="lead">Straight, practical answers to common computer and Mac questions — written by people who fix them for a living. No jargon, no filler.</p></div></section>
  <section class="section"><div class="wrap"><div class="grid grid-3">${cards}</div>
    <p class="sub" style="margin-top:32px">Got a question you don't see answered here? <a href="/ask-a-question/">Ask us directly</a> — the most useful ones become guides on this page.</p></div></section>`;
}
function newsPostHtml(n) {
  const idx = news.findIndex((x) => x.slug === n.slug);
  const others = news.filter((_, i) => i !== idx).slice(0, 2)
    .map((o) => `<a href="/news/${o.slug}/">${esc(o.title)} →</a>`).join('');
  return `  <section class="hero"><div class="wrap"><div class="crumbs"><a href="/news/">News</a> › <span>${esc(n.category)}</span></div>
    <h1>${esc(n.title)}</h1><p class="lead">${esc(fmtDate(n.date))}</p></div></section>
  <section class="section"><div class="wrap"><div class="lead-copy" style="max-width:760px">${n.body}</div>
    ${others ? `<div style="margin-top:40px"><p class="eyebrow">More from News</p><div class="crosslinks">${others}</div></div>` : ''}</div></section>
  <section class="section alt"><div class="wrap"><div class="cta-band"><h2>Need a hand with this?</h2><p>Free diagnostics (2–4 days) or express for 600 kr (1–2 hours). Fixed quote before we start.</p><div class="cta-row"><a class="btn btn-white" href="/contact/">Contact us</a><a class="btn btn-ghost-light" href="${site.phoneHref}">📞 Call ${site.phone}</a></div></div></div></section>`;
}
function newsPostSchema(n) {
  return { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: n.title, datePublished: n.date, dateModified: n.date, description: n.description, author: { '@type': 'Organization', name: 'PCKlinik' }, publisher: { '@type': 'Organization', name: 'PCKlinik' }, mainEntityOfPage: `${site.domain}/news/${n.slug}/` };
}

// ---------- Ask Us a Question ----------
function askQuestionBody() {
  return `  <section class="hero"><div class="wrap"><div class="eyebrow">Ask us a question</div><h1>Ask Us a Question</h1>
    <p class="lead">Real questions from real people — some end up helping others too. Not sure if something's worth a repair, curious about a specific problem, or just want a quick answer before deciding what to do? Ask us directly. We read every question — the most useful ones get turned into a proper answer on our <a href="/news/" style="color:#A9C1F0">News page</a>, so your question might end up helping someone else with the same problem.</p></div></section>
  <section class="section"><div class="wrap"><div class="form-card" style="max-width:640px">
      ${formOpen(site.emailConsumer, 'New question — pcklinik.eu Ask Us', '/thank-you/')}
        <div class="form-row"><div><label for="aq-name">Name <span style="font-weight:400;color:var(--muted)">(optional)</span></label><input id="aq-name" name="name" type="text" autocomplete="name" /></div></div>
        <div class="form-row"><div><label for="aq-email">Email <span style="font-weight:400;color:var(--muted)">(optional — only needed if you want a personal reply)</span></label><input id="aq-email" name="email" type="email" autocomplete="email" /></div></div>
        <div class="form-row"><div><label for="aq-device">Device / brand <span style="font-weight:400;color:var(--muted)">(optional — helps us answer more specifically)</span></label><input id="aq-device" name="device" type="text" placeholder="e.g. MacBook Air M2" /></div></div>
        <div class="form-row"><div><label for="aq-question">Your question</label><textarea id="aq-question" name="question" required></textarea></div></div>
        <div class="form-row"><label style="display:flex;gap:10px;align-items:flex-start;font-weight:400;color:var(--muted);font-size:14.5px"><input type="checkbox" name="feature_ok" value="yes" style="width:auto;margin-top:3px" /> It's okay to feature this question (anonymously) on your News page.</label></div>
        <button class="btn btn-primary" type="submit">Send Question</button>
      </form>
      <p class="sub" style="margin-top:20px;font-size:14.5px">Private by default. We never publish anything unless you tick the box above — and even then, we anonymize it (for example, "a customer recently asked…"). Your name and email are never published.</p>
    </div></div></section>`;
}

// ---------- task-based service pages ----------
function serviceBody(s) {
  const intro = s.intro.map((p) => `<p>${p}</p>`).join('');
  const included = s.whatsIncluded ? `<div class="trust-line" style="margin:6px 0 20px"><strong>What's included:</strong> ${esc(s.whatsIncluded)}</div>` : '';
  const bullets = (s.bulletSections || []).map((b) => `<section class="section"><div class="wrap"><div class="eyebrow">${esc(b.heading)}</div><ul class="check-list">${b.items.map((it) => `<li>${esc(it)}</li>`).join('')}</ul></div></section>`).join('');
  const callout = s.callout ? `<section class="section"><div class="wrap"><div class="callout"><strong>${esc(s.callout.label)}:</strong> ${esc(s.callout.text)}</div></div></section>` : '';
  const pricing = s.pricing
    ? `<section class="section alt"><div class="wrap"><div class="eyebrow">Pricing</div><h2>${esc(s.pricing.h2)}</h2><p class="sub">${esc(s.pricing.text)}</p></div></section>`
    : `<section class="section alt"><div class="wrap"><div class="eyebrow">Diagnostics &amp; pricing</div><h2>Free or express — your choice</h2><p class="sub">Standard diagnostics are free (2–4 days), or express for 600 kr (1–2 hours) — with repair and delivery within 24 hours if no special parts need ordering. You get a fixed quote before we start, always.</p></div></section>`;
  const cta = esc(s.ctaLabel || 'Book diagnostics');
  const faq = s.faq.map((f) => `<details><summary>${esc(f.q)}</summary><div class="answer">${esc(f.a)}</div></details>`).join('');
  const cross = s.crosslinks.map((c) => `<a href="${c.href}">${esc(c.label)} →</a>`).join('') + `<a href="/contact/">Contact & booking →</a>`;
  return `  <section class="hero"><div class="wrap"><div class="eyebrow">Service · Frederiksberg &amp; Copenhagen</div><h1>${esc(s.h1)}</h1>${s.subhead ? `<p class="lead">${esc(s.subhead)}</p>` : ''}
    <div class="cta-row"><a class="btn btn-white" href="/contact/">${cta}</a><a class="btn btn-ghost-light" href="${site.phoneHref}">📞 Call ${site.phone}</a></div></div></section>
  <section class="section"><div class="wrap lead-copy"><div class="crumbs"><a href="/">Home</a> › <span>${esc(s.h1)}</span></div>${intro}${included}</div></section>
  ${bullets}
  ${callout}
  ${pricing}
  <section class="section"><div class="wrap"><div class="eyebrow">FAQ</div><h2>Common questions</h2><div class="faq">${faq}</div></div></section>
  <section class="section alt"><div class="wrap"><div class="cta-band"><h2>Ready to get started?</h2><p>Contact us and we'll help you book the right service.</p><div class="cta-row"><a class="btn btn-white" href="/contact/">${cta}</a><a class="btn btn-ghost-light" href="${site.phoneHref}">📞 Call ${site.phone}</a></div></div>
    <div style="margin-top:32px"><p class="eyebrow">Related services</p><div class="crosslinks">${cross}</div></div></div></section>`;
}
function faqSchemaFrom(items) {
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
}


// ---------- location / area pages ----------
function locationBody(loc) {
  const intro = loc.intro.map((p) => `<p>${p}</p>`).join('');
  const trust = loc.trustLine ? `<div class="trust-line" style="margin:8px 0 24px">${esc(loc.trustLine)}</div>` : '';
  const areas = loc.areas ? `<section class="section alt"><div class="wrap"><div class="eyebrow">Areas we serve</div><h2>Copenhagen neighbourhoods</h2><div class="grid grid-3">${loc.areas.map((sl) => { const a = locations.find((x) => x.slug === sl); return `<a class="card card-link" href="/${a.slug}/"><h3>${esc(a.h1.replace('Computer Repair in ', ''))}</h3><p>${esc(a.subhead)}</p><span class="arrow">View area →</span></a>`; }).join('')}</div></div></section>` : '';
  const faq = loc.faq.map((f) => `<details><summary>${esc(f.q)}</summary><div class="answer">${esc(f.a)}</div></details>`).join('');
  const cross = loc.crosslinks.map((c) => `<a href="${c.href}">${esc(c.label)} →</a>`).join('');
  return `  <section class="hero"><div class="wrap"><div class="eyebrow">Copenhagen · English-speaking</div>
    <h1>${esc(loc.h1)}</h1><p class="lead">${esc(loc.subhead)}</p>
    <div class="cta-row"><a class="btn btn-white" href="/contact/">Book a repair</a><a class="btn btn-ghost-light" href="${site.phoneHref}">📞 Call ${site.phone}</a></div></div></section>
  <section class="section"><div class="wrap lead-copy"><div class="crumbs"><a href="/">Home</a> › <span>${esc(loc.h1)}</span></div>${intro}${trust}</div></section>
  ${areas}
  <section class="section"><div class="wrap"><div class="eyebrow">FAQ</div><h2>Common questions</h2><div class="faq">${faq}</div></div></section>
  <section class="section alt"><div class="wrap"><div class="eyebrow">Find us</div><h2>Our workshop — Falkoner Allé 108, Frederiksberg</h2><p class="sub">We serve this area from our Frederiksberg workshop; drop-off, pickup and delivery options available depending on your location.</p>${mapFrame}</div></section>
  <section class="section"><div class="wrap"><div class="cta-band"><h2>Need a repair in ${esc(loc.h1.replace('Computer Repair in ', ''))}?</h2><p>Free diagnostics (2–4 days) or express (600 kr, 1–2 hours). English-speaking, fixed quote before we start.</p><div class="cta-row"><a class="btn btn-white" href="/contact/">Book a repair</a><a class="btn btn-ghost-light" href="${site.phoneHref}">📞 Call ${site.phone}</a></div></div>
    <div style="margin-top:32px"><p class="eyebrow">Related</p><div class="crosslinks">${cross}</div></div></div></section>`;
}
// ---------- write helpers ----------
async function writePage(p, html) {
  const dir = p === '/' ? DIST : path.join(DIST, p);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, 'index.html'), html);
}
async function copyDir(src, dst) {
  await fs.mkdir(dst, { recursive: true });
  for (const e of await fs.readdir(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) await copyDir(s, d); else await fs.copyFile(s, d);
  }
}

// ---------- run ----------
async function run() {
  await fs.rm(DIST, { recursive: true, force: true });
  await fs.mkdir(DIST, { recursive: true });

  // static assets
  await copyDir(path.join(__dirname, 'public'), DIST);
  await fs.mkdir(path.join(DIST, 'styles'), { recursive: true });
  await fs.copyFile(path.join(__dirname, 'src/styles/global.css'), path.join(DIST, 'styles/global.css'));

  const pages = [];
  // home
  pages.push(['/', page({ title: 'PCKlinik | Computer & Mac Repair in Copenhagen', description: 'Fast, honest PC and Mac repair in Frederiksberg and Copenhagen. Free diagnostics (2-4 days) or express (600 kr, 1-2 hours). Call 91 81 61 81.', p: '/', body: homeBody(), schema: faqSchemaFrom(HOME_FAQ) })]);
  // repairs
  for (const r of repairs) {
    pages.push([`/${r.slug}/`, page({ title: r.title, description: r.description, p: `/${r.slug}/`, body: repairBody(r), schema: repairSchema(r) })]);
  }
  // contact
  pages.push(['/contact/', page({ title: 'Contact PCKlinik | Frederiksberg & Copenhagen', description: 'Contact PCKlinik for PC and Mac repair in Frederiksberg and Copenhagen. Call 91 81 61 81 or email contact@pcklinik.eu.', p: '/contact/', body: contactBody() })]);
  // business
  pages.push(['/business-it-service-agreement/', page({ title: 'Business IT Service Agreement | PCKlinik', description: 'Fixed-price IT support for businesses in Copenhagen and Frederiksberg. Unlimited support, monitoring, security and backup — from 399 kr./user/month.', p: '/business-it-service-agreement/', body: businessBody(), schema: businessSchemaFaq() })]);
  // shop
  pages.push(['/shop/', page({ title: 'Shop | Computers, Backup & Security | PCKlinik', description: 'Buy refurbished and new computers, plus backup and security solutions, from PCKlinik. Simple and secure checkout via Stripe.', p: '/shop/', body: shopHub() })]);
  pages.push(['/shop/computers/', page({ title: 'Computers | New & Refurbished | PCKlinik Shop', description: 'New and refurbished computers from PCKlinik — tested and ready to use, with warranty. Browse our selection and buy securely via Stripe.', p: '/shop/computers/', body: shopComputers() })]);
  pages.push(['/shop/computers/new/', page({ title: 'New Computers | PCKlinik Shop', description: 'Buy new computers from PCKlinik. Reliable brands, prepared and ready to use. Secure payment via Stripe.', p: '/shop/computers/new/', body: shopNew() })]);
  pages.push(['/shop/computers/refurbished/', page({ title: 'Refurbished Computers with Warranty | PCKlinik Shop', description: 'Thoroughly tested and refurbished computers from PCKlinik, with warranty. Great performance at a lower price. Secure payment via Stripe.', p: '/shop/computers/refurbished/', body: shopRefurb() })]);
  pages.push(['/shop/backup-security/', page({ title: 'Backup & Security | PCKlinik Shop', description: 'External hard drives, NAS solutions and security software recommended by PCKlinik. Secure payment via Stripe.', p: '/shop/backup-security/', body: shopBackup() })]);

  // Mac Repair hub (broad intent)
  pages.push(['/mac-repair/', page({ title: 'Mac Repair in Frederiksberg & Copenhagen | PCKlinik', description: 'MacBook, iMac, Mac mini, Mac Studio and Mac Pro repair in Frederiksberg and Copenhagen. Free diagnostics, fixed quote, fast turnaround.', p: '/mac-repair/', body: macHubHtml(), schema: faqSchemaFrom(MAC_HUB_FAQ) })]);
  // Gaming PC repair, service & custom builds
  pages.push(['/gaming-pc-repair-and-build/', page({ title: 'Gaming PC Repair, Service & Custom Builds | PCKlinik', description: 'Gaming PC repair, cooling service, and custom PC builds in Frederiksberg and Copenhagen. GPU, overheating, upgrades — plus builds from scratch.', p: '/gaming-pc-repair-and-build/', body: gamingHtml(), schema: faqSchemaFrom(GAMING_FAQ) })]);
  // Error messages reference page
  pages.push(['/error-messages/', page({ title: 'Common Computer Error Messages & Codes | PCKlinik', description: 'Blue screen errors, boot failures, kernel panics and more — what common Windows and Mac error messages mean, and how we fix them.', p: '/error-messages/', body: errorMessagesHtml(), schema: faqSchemaFrom(ERROR_FAQ) })]);
  // Computer won't turn on (guide)
  pages.push(['/computer-wont-turn-on/', page({ title: "Computer Won't Turn On? Here's Why | PCKlinik", description: 'Laptop or PC not turning on? The three most common causes, what they mean, and how we diagnose and fix it. Frederiksberg and Copenhagen.', p: '/computer-wont-turn-on/', body: computerWontTurnOnHtml(), schema: faqSchemaFrom(WONT_TURN_ON_FAQ) })]);
  // General site-wide FAQ
  pages.push(['/faq/', page({ title: 'Frequently Asked Questions | PCKlinik', description: 'English-speaking PC and Mac repair in Copenhagen — FAQs on diagnostics, pricing, brands, services, business IT, and our shop.', p: '/faq/', body: faqPageHtml(), schema: faqSchemaFrom(GENERAL_FAQ) })]);
  // Network Equipment hub
  pages.push(['/network-equipment/', page({ title: 'Network & Router Setup | UniFi, Netgear, TP-Link & More | PCKlinik', description: 'Router and network setup, configuration, and troubleshooting — UniFi, Netgear, TP-Link, ASUS, Eero and Google Nest. Frederiksberg and Copenhagen.', p: '/network-equipment/', body: networkHubHtml(), schema: faqSchemaFrom(NETWORK_HUB_FAQ) })]);
  // Websites & SEO hub
  pages.push(['/websites-seo-google-ads/', page({ title: 'Website Design, SEO & Google Ads | PCKlinik', description: 'Website design, SEO, and Google Ads management for businesses in Copenhagen. Built and optimized by someone who actually does this work.', p: '/websites-seo-google-ads/', body: websitesHubHtml(), schema: faqSchemaFrom(WEBSITES_HUB_FAQ) })]);
  // About / Meet the Team
  pages.push(['/about-us/', page({ title: 'About PCKlinik & Our Team | PCKlinik', description: 'Meet the PCKlinik team — 7 people covering PC, Mac, networks, on-site support, and web/SEO, based in Frederiksberg.', p: '/about-us/', body: aboutBody() })]);
  // News section
  pages.push(['/news/', page({ title: 'News & Guides | PCKlinik', description: 'Practical computer, Mac, and IT guides from PCKlinik in Frederiksberg — straight answers to common questions, no jargon.', p: '/news/', body: newsIndexHtml() })]);
  for (const n of news) pages.push([`/news/${n.slug}/`, page({ title: `${n.title} | PCKlinik News`, description: n.description, p: `/news/${n.slug}/`, body: newsPostHtml(n), schema: newsPostSchema(n) })]);
  // Ask Us a Question
  pages.push(['/ask-a-question/', page({ title: 'Ask Us a Question | PCKlinik', description: 'Have a question about your computer, Mac, or IT setup? Ask us directly — real questions get real answers, and some become guides on our News page.', p: '/ask-a-question/', body: askQuestionBody() })]);
  // Thank-you pages (form redirect targets)
  pages.push(['/thank-you/', page({ title: 'Thank You | PCKlinik', description: 'Your message has been sent. We will get back to you as soon as possible.', p: '/thank-you/', body: thankYouHtml() })]);
  pages.push(['/ar/thank-you/', page({ title: 'شكرًا لكم | PCKlinik', description: 'تم إرسال رسالتكم. سنتواصل معكم في أقرب وقت ممكن.', p: '/ar/thank-you/', body: thankYouArHtml(), lang: 'ar', dir: 'rtl', chrome: 'ar' })]);
  pages.push(['/ar/contact/', page({ title: 'اتصل بنا | PCKlinik', description: 'تواصلوا مع PCKlinik في Frederiksberg وCopenhagen. نتحدث العربية والدنماركية والإنجليزية.', p: '/ar/contact/', body: arContactHtml(), lang: 'ar', dir: 'rtl', chrome: 'ar' })]);
  // Arabic (RTL) remote-services section
  // Arabic homepage (Batch 1)
  pages.push(['/ar/', page({ title: 'PCKlinik | إصلاح الحاسوب وأجهزة Mac في Copenhagen', description: 'إصلاح حاسوب وMac في Frederiksberg وCopenhagen. فريق يتحدث العربية والإنجليزية. تشخيص مجاني، سعر ثابت.', p: '/ar/', body: arHomeHtml(), schema: faqSchemaFrom(AR_HOME_FAQ), lang: 'ar', dir: 'rtl', chrome: 'ar' })]);
  // Arabic remote-service sub pages (skip old hub)
  for (const pg of arPages.filter((x) => x.slug !== '/ar/')) pages.push([pg.slug, page({ title: pg.title, description: pg.description, p: pg.slug, body: arPageHtml(pg), schema: pg.faq ? faqSchemaFrom(pg.faq) : null, lang: 'ar', dir: 'rtl', chrome: 'ar' })]);
  // Arabic brand/repair pages (Batch 2 — 18)
  for (const b of arBrands) pages.push([`/ar/${b.slug}/`, page({ title: `${b.h1} | PCKlinik`, description: b.intro.slice(0, 155), p: `/ar/${b.slug}/`, body: arBrandHtml(b), schema: b.faq ? faqSchemaFrom(b.faq) : null, lang: 'ar', dir: 'rtl', chrome: 'ar' })]);
  // Arabic service/task pages (Batch 3 — 19)
  for (const sv of arServices) pages.push([`/ar/${sv.slug}/`, page({ title: `${sv.h1} | PCKlinik`, description: sv.intro.slice(0, 155), p: `/ar/${sv.slug}/`, body: arBrandHtml(sv), schema: sv.faq ? faqSchemaFrom(sv.faq) : null, lang: 'ar', dir: 'rtl', chrome: 'ar' })]);
  // Arabic network (Batch 4), shop + locations (Batch 5)
  for (const grp of [arNetwork, arShop, arLocations]) for (const it of grp) pages.push([`/ar/${it.slug}/`, page({ title: `${it.h1} | PCKlinik`, description: it.intro.slice(0, 155), p: `/ar/${it.slug}/`, body: arBrandHtml(it), schema: it.faq ? faqSchemaFrom(it.faq) : null, lang: 'ar', dir: 'rtl', chrome: 'ar' })]);
  // Arabic Business IT full pricing page (Batch 6)
  pages.push(['/ar/business-it-service-agreement/', page({ title: 'اتفاقية الدعم التقني للشركات | PCKlinik', description: 'دعم تقني بسعر شهري ثابت للشركات — دعم غير محدود، مراقبة، وأمان. فريق يتحدث العربية والدنماركية والإنجليزية.', p: '/ar/business-it-service-agreement/', body: arBusinessHtml(), schema: faqSchemaFrom(AR_BIZ_FAQ), lang: 'ar', dir: 'rtl', chrome: 'ar' })]);
  // Location / area pages
  for (const loc of locations) pages.push([`/${loc.slug}/`, page({ title: loc.title, description: loc.description, p: `/${loc.slug}/`, body: locationBody(loc), schema: faqSchemaFrom(loc.faq) })]);
  // 15 task-based service pages
  for (const s of services) pages.push([`/${s.slug}/`, page({ title: s.title, description: s.description, p: `/${s.slug}/`, body: serviceBody(s), schema: faqSchemaFrom(s.faq) })]);

  for (const [p, html] of pages) await writePage(p, html);

  // sitemap + robots
  const urls = pages.map(([p]) => `  <url><loc>${site.domain}${p}</loc></url>`).join('\n');
  await fs.writeFile(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  await fs.writeFile(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site.domain}/sitemap.xml\n`);

  console.log(`Built ${pages.length} pages -> dist/`);
}
run().catch((e) => { console.error(e); process.exit(1); });
