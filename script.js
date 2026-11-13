document.getElementById('year').textContent = new Date().getFullYear();

// Theme toggle (remembered when storage is available)
const root = document.documentElement;
try {
  const saved = localStorage.getItem('theme');
  if (saved) root.dataset.theme = saved;
} catch (e) {}
document.getElementById('theme').addEventListener('click', () => {
  const dark = root.dataset.theme
    ? root.dataset.theme === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
});

// Scroll reveal
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  });
}, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

/* ---------- Motion / VFX ---------- */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Typewriter that cycles through roles
const words = ['Senior Python Data Engineer', 'Web Scraping', 'ETL Pipelines', 'Resilient Crawling'];
const typeEl = document.getElementById('type');
if (reduce) { typeEl.textContent = words.join(' · '); }
else {
  let w = 0, c = 0, del = false;
  (function tick() {
    const word = words[w];
    typeEl.textContent = word.slice(0, c);
    if (!del && c === word.length) { del = true; return setTimeout(tick, 1400); }
    if (del && c === 0) { del = false; w = (w + 1) % words.length; }
    c += del ? -1 : 1;
    setTimeout(tick, del ? 35 : 70);
  })();
}

// Cursor glow + scroll progress
const glow = document.querySelector('.glow');
let gx = innerWidth / 2, gy = innerHeight / 3, tx = gx, ty = gy;
addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; });
(function follow() {
  gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
  glow.style.transform = `translate(${gx}px, ${gy}px)`;
  requestAnimationFrame(follow);
})();
const bar = document.querySelector('.progress');
addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
}, { passive: true });

// Count-up stats
const countIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    countIO.unobserve(e.target);
    const end = +e.target.dataset.count, t0 = performance.now();
    if (reduce) return;
    (function step(t) {
      const p = Math.min((t - t0) / 1400, 1);
      e.target.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  });
});
document.querySelectorAll('[data-count]').forEach((el) => countIO.observe(el));

// Staggered cards + 3D tilt + spotlight
const grid = document.querySelector('.grid');
grid.querySelectorAll('.card').forEach((card, i) => {
  card.classList.add('reveal-item');
  card.style.setProperty('--i', i);
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    card.style.setProperty('--mx', x + 'px');
    card.style.setProperty('--my', y + 'px');
    if (!reduce && matchMedia('(hover: hover)').matches) card.style.transform =
      `perspective(700px) rotateX(${((y / r.height) - .5) * -10}deg) rotateY(${((x / r.width) - .5) * 10}deg) translateY(-4px)`;
  });
  card.addEventListener('pointerleave', () => { card.style.transform = ''; });
});
new IntersectionObserver((entries, o) => entries.forEach((e) => {
  if (e.isIntersecting) { grid.classList.add('visible'); o.disconnect(); setTimeout(() => grid.classList.add('done'), 1500); }
}), { threshold: 0.15 }).observe(grid);

// Particle network background
if (!reduce) {
  const cv = document.getElementById('fx'), ctx = cv.getContext('2d');
  let W, H, pts = [];
  const mouse = { x: -999, y: -999 };
  addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  function resize() {
    const d = devicePixelRatio || 1;
    W = cv.width = innerWidth * d; H = cv.height = innerHeight * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    pts = Array.from({ length: Math.min(90, Math.floor(innerWidth / 14)) }, () => ({
      x: Math.random() * innerWidth, y: Math.random() * innerHeight,
      vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
    }));
  }
  resize(); addEventListener('resize', resize);
  (function draw() {
    const col = getComputedStyle(root).getPropertyValue('--accent').trim() || '#00b8e6';
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.fillStyle = col; ctx.strokeStyle = col;
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
      if (p.y < 0 || p.y > innerHeight) p.vy *= -1;
      const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (dm < 140) { p.x += (p.x - mouse.x) * 0.012; p.y += (p.y - mouse.y) * 0.012; }
      ctx.globalAlpha = .55; ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 6.283); ctx.fill();
    }
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
      if (d < 120) {
        ctx.globalAlpha = (1 - d / 120) * .22; ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  })();
}

/* ---------- Hero visual ---------- */
(function heroVisual() {
  const log = document.getElementById('log'), rows = document.getElementById('rows');
  const vis = document.querySelector('.hero-visual');
  if (!log) return;
  const script = [
    ['d', '$ scrapy crawl products'], ['k', '→ GET /catalog?page=1'], ['ok', '200 OK  · 48 items'],
    ['k', '→ solving anti-bot challenge…'], ['ok', '✓ session established'], ['k', '→ parsing JSON + HTML'],
    ['ok', '✓ 1,248 rows cleaned'], ['d', '→ export: products.csv'], ['ok', '✓ done in 4.2s'],
  ];
  function line(cls, txt) { const s = document.createElement('span'); s.className = cls; s.textContent = txt + '\n'; log.appendChild(s); }
  if (reduce) { script.forEach(([c, t]) => line(c, t)); return; }
  let i = 0;
  (function next() {
    if (i >= script.length) { setTimeout(() => { log.textContent = ''; i = 0; next(); }, 2200); return; }
    if (log.children.length > 7) log.removeChild(log.firstChild);
    line(...script[i++]);
    if (i === 7) { let n = 0; const iv = setInterval(() => { n += 83; rows.textContent = Math.min(n, 1248).toLocaleString(); if (n >= 1248) clearInterval(iv); }, 40); }
    setTimeout(next, 650);
  })();
  // mouse parallax
  const layers = vis.querySelectorAll('[data-depth]');
  addEventListener('pointermove', (e) => {
    const x = (e.clientX / innerWidth - .5), y = (e.clientY / innerHeight - .5);
    layers.forEach((l) => { const d = +l.dataset.depth; l.style.transform = `translate(${x * d}px, ${y * d}px)`; });
  });
})();

/* ---------- Use-case diagrams ---------- */
(function diagrams() {
  const FLOWS = [
    ['County court records', 'Scrape · de-dupe · enrich', 'Skip-trace queue + API', 'Real-estate investors'],
    ['Google search queries', 'Scrapy parses SERP + AI', 'Rankings & citations data', 'SEO / GEO teams'],
    ['Grid, energy & geo data', 'PostGIS site scoring', 'Dashboard + AI assistant', 'Data-center developers'],
    ['ZVG court portal', 'Ingest & normalise', 'Staging table', 'Deal analysts'],
    ['Court portal (CAPTCHA)', 'Scrapy + Playwright', 'Clean case rows', 'Legal researchers'],
  ];
  const LBL = ['SOURCE', 'PROCESS', 'OUTPUT', 'WHO USES IT'];
  const NS = 'http://www.w3.org/2000/svg';
  document.querySelectorAll('.grid .card').forEach((card, idx) => {
    const flow = FLOWS[idx]; if (!flow) return;
    const H = 6 + 4 * 52 + 3 * 26;
    let svg = `<svg viewBox="0 0 250 ${H}" role="img" aria-label="Use case flow">`;
    flow.forEach((t, i) => {
      const y = 4 + i * 78;
      svg += `<rect class="node${i === 3 ? ' last' : ''}" x="4" y="${y}" width="242" height="52" rx="12"/>` +
             `<text class="lbl" x="18" y="${y + 20}">${LBL[i]}</text><text class="ttl" x="18" y="${y + 39}">${t}</text>`;
      if (i < 3) svg += `<path class="flow" d="M125 ${y + 52} V${y + 74}"/><path class="arr" d="M119 ${y + 70} h12 l-6 8z"/>`;
    });
    svg += '</svg>';
    const wrap = document.createElement('div'); wrap.className = 'dia'; wrap.innerHTML = svg;
    const btn = document.createElement('button'); btn.className = 'dia-btn'; btn.textContent = 'View use-case diagram';
    btn.addEventListener('click', () => {
      const open = card.classList.toggle('open');
      btn.textContent = open ? 'Hide diagram' : 'View use-case diagram';
    });
    card.append(btn, wrap);
  });
})();

/* ---------- Case studies ---------- */
(function cases() {
  const C = [
    { t: 'Florida County Property-Records Pipeline', m: 'US real estate data & AI company · Jan–Apr 2024 · Solo developer · Fiverr',
      k: [['65', 'Florida county sites'], ['630K', 'properties, largest county'], ['2 wks → 26 h', 'Sarasota full run'], ['1', 'schema for every county']],
      ch: 'Each of the 65 county appraiser sites was built differently and several sat behind CloudFront/Cloudflare and reCAPTCHA, yet the client needed one standard format for a single importer.',
      b: ['65 county scrapers as separate Scrapy projects, each handling its own pop-ups, autocomplete and internal API', 'Zyte Smart Proxy instead of browser automation, with 2Captcha only where reCAPTCHA is required', 'One snake_case JSON schema plus a CSV parcel list matched on parcel_id, and a missed-address log'],
      r: 'Rebuilt Sarasota to request each property by parcel ID: 300,000+ properties went from an estimated ~2 weeks to ~26 hours.',
      p: [['INPUT', 'Street / parcel list (CSV)'], ['CRAWL', 'Scrapy + Zyte proxy rotation'], ['PROTECTION', '2Captcha where required'], ['NORMALISE', 'Standard schema validation'], ['OUTPUT', 'CSV parcel list + JSON details']],
      tech: ['Python', 'Scrapy', 'Zyte', '2Captcha'], q: ['I like working with you, quality and communication is good.', 'Client feedback, Fiverr'] },
    { t: 'Real-Time Property Listings Pipeline for a CRM', m: 'Suif Grup (Romanian real estate CRM) · 2025–Mar 2026 · Solo developer · Direct client',
      k: [['5', 'classifieds sources'], ['10–30 min', 'incremental runs'], ['50+', 'standard fields'], ['5', 'linked SQL tables']],
      ch: 'The CRM needed every new listing from Romania\'s main classifieds sites within minutes, plus every price change, merged into one deduplicated database.',
      b: ['Scrapers for OLX, Anuntul, Imobiliare.ro, LaJumate and Publi24 across residential, land and commercial', 'Newest-first incremental runs, new vs known detection and a price-history table', 'Private vs agency classification, weekly expiry job and an email summary per run'],
      r: 'Agents always work with fresh, deduplicated listings, with price drops flagged in the CRM.',
      p: [['SOURCES', '5 classifieds sites, newest first'], ['CHECK', 'Listing ID vs database'], ['EXTRACT', 'New: full record · Known: updates'], ['LOAD', 'MySQL: main, agency, price history'], ['CRM', 'Fresh listings + price changes']],
      tech: ['Python', 'Scrapy', 'Selenium', 'MySQL'] },
    { t: '3.3 Million Court Decisions for a Legal-AI Database', m: 'Canadian legal-AI company · Jun–Jul 2024 · Solo developer · Fiverr custom order',
      k: [['3.3M', 'court decisions'], ['100+ yrs', 'covered (1800 onward)'], ['~750K', 'search partitions'], ['~250 GB', 'MongoDB dataset']],
      ch: 'Collect every published Canadian court decision with full judgments and cited documents for an AI team to search. A previous freelancer could not deliver. The site caps results per search, so a normal crawl misses most cases.',
      b: ['Partitioned searches by single day across 100+ years, then by court and category, so no search hit the cap', 'Per-case deduplication against MongoDB and HTML capture that keeps image-based judgments', 'Parallel crawlers raised throughput from 107K to 282K records in 12 hours'],
      r: 'Delivered 3M+ searchable cases with documentation, a Zoom walkthrough and an incremental script for new cases.',
      p: [['PARTITION', 'Day × court × category'], ['CRAWL', 'Scrapy + rotating proxies (parallel)'], ['DEDUP', 'Check case ID in MongoDB'], ['CAPTURE', 'Judgment HTML + cited documents'], ['DATABASE', 'MongoDB · 3M+ searchable cases']],
      tech: ['Python', 'Scrapy', 'MongoDB', 'DigitalOcean'], q: ['For me it looks really good… very happy thus far.', 'Client feedback, Fiverr'] },
    { t: 'Global Grocery & E-commerce Intelligence: 200+ Scrapers', m: 'UK e-commerce brand · 2022–2024 (18+ months) · Solo developer & maintainer · Upwork',
      k: [['200+', 'production scrapers'], ['60+', 'marketplaces'], ['15+', 'countries'], ['Daily', 'scheduled runs']],
      ch: 'The e-commerce team wanted a daily view of competitors\' prices, rankings, promotions and reviews across the world\'s major grocery and e-commerce retailers.',
      b: ['Category-tree, search/listing, product-page and banner scrapers, plus reviews, Amazon Q&A and location pricing', 'Daily runs driven by keyword and URL files the client manages, with error alerts to Discord', 'Continuous maintenance as marketplaces changed layouts'],
      r: 'Kept 200+ scrapers working for over 18 months, feeding timestamped CSVs into the client\'s workflow.',
      p: [['INPUT', 'Keyword & URL files (client)'], ['CRAWL', 'Scrapy · Playwright · Selenium + proxies'], ['EXTRACT', 'Category · listing · product · banners'], ['OUTPUT', 'Timestamped CSV per run'], ['OPS', 'Daily schedule · Discord alerts']],
      tech: ['Python', 'Scrapy', 'Playwright', 'Zyte', 'ScrapingBee'],
      q: ['Shahzaib has been a partner for over a year now working on building and maintaining 200+ scrapers and integrating them into my workflow. Shahzaib works efficiently and reliably and is my go-to partner for all scraping tasks. Highly recommended.', 'Jonathan T., Global E-Commerce Manager · verified Upwork testimonial, Aug 2023'] },
    { t: 'API Documentation Extraction for AI Training', m: 'Rivery (data-integration / ELT platform) · Jul–Sep 2024 · System designer & developer · Direct client',
      k: [['450', 'docs sites tested'], ['2 modes', 'quick & deep'], ['Markdown', 'AI-ready output'], ['S3', 'mirrored structure']],
      ch: 'Collect technical and API documentation from anywhere on the web, static, JavaScript-rendered or dynamically loaded, as clean Markdown to train AI and ETL models.',
      b: ['General-purpose crawler: Quick mode (Scrapy) for static docs, Deep mode (Selenium) for JavaScript-heavy sites', 'Domain limiting, page validation and Markdown conversion with Jina AI', 'AWS S3 storage mirroring the original folder structure, plus an end-of-run report'],
      r: 'Tested and refined across 450 documentation sites. Rivery received a reusable system and full ownership of the code. I\'m happy to walk through the architecture and approach in a meeting.',
      p: [['INPUT', 'Docs site URL'], ['CRAWL', 'Quick (Scrapy) or Deep (Selenium)'], ['VALIDATE', 'Domain limit + page checks'], ['CONVERT', 'Jina AI → Markdown'], ['STORE', 'AWS S3, same folder structure']],
      tech: ['Python', 'Scrapy', 'Selenium', 'Jina AI', 'AWS S3'] },
    { t: 'Multi-Client Lead-Generation Platform: 7 Live Dashboards', m: 'Easy Button Real Estate (US real estate investor platform) · Jun 2026–present · Lead developer · Upwork, ongoing',
      k: [['7', 'client builds live'], ['65', 'county sites'], ['7', 'states'], ['Daily', 'automated lead delivery']],
      ch: 'Each investor client gets a private instance that turns county public records into motivated-seller leads. Two previous developers had not finished: scrapers were missing, enrichment was unconnected and dashboards had blocking bugs.',
      b: ['New county recorder, assessor, clerk and court scrapers for pre-foreclosure, tax delinquency, liens, probate and more', 'Free enrichment via assessor APIs (ArcGIS, Socrata), skip-tracing options and satellite view', 'Fixed and built React dashboards with filters and CSV export, daily automation and per-client Railway deployments'],
      r: 'All 7 client builds are live, delivering fresh, enriched leads daily across 65 county sites in California, Texas, Ohio, Washington, South Carolina, New York and Wisconsin.',
      p: [['COUNTY SOURCES', 'Recorder · clerk · assessor · courts'], ['SCRAPE', 'Playwright · Cheerio · ScraperAPI'], ['ENRICH', 'Assessor APIs: owner · address'], ['STORE', 'Postgres per client (Railway)'], ['DASHBOARD', 'Filters · CSV · skip trace · map']],
      tech: ['Node.js', 'TypeScript', 'React', 'PostgreSQL', 'Playwright', 'Railway'], q: ['I\'ve enjoyed working with you a lot and would like to keep working with you for any future Atlas buildouts.', 'Easy Button Real Estate, project manager'] },
    { t: 'Multi-Board Job Aggregation Engine with Evidence Screenshots', m: 'US job-aggregation platform (agency client) · 2022 · Python developer at GulzarSoft · Delivered to production',
      k: [['4', 'job boards'], ['1,000s', 'keywords'], ['1,000s', 'locations'], ['Millions', 'job listings collected']],
      ch: 'Fresh listings from the largest US job boards for every keyword × location combination, posted to the client\'s API without duplicates, each with a timestamped screenshot as evidence.',
      b: ['One Scrapy framework with a shared base spider for ZipRecruiter, Monster, Glassdoor and Indeed', 'Keyword × location matrix loaded from the client\'s API, with job-ID dedup and early stop', 'Full-page evidence screenshots stamped with time and URL, stored on Backblaze B2, plus per-keyword run reports'],
      r: 'A production system that collected millions of listings, with a screenshot record for each posted job.',
      p: [['CLIENT API', 'Keywords × locations'], ['CRAWL', 'Scrapy · 4 boards · ScrapingBee'], ['DEDUP', 'Job ID check via client API'], ['CAPTURE', 'Details + stamped screenshot'], ['PUBLISH', 'Client API + B2 storage']],
      tech: ['Python', 'Scrapy', 'Selenium', 'ScrapingBee', 'Backblaze B2'] },
  ];
  const FB = [["I work with Mirza on multiple projects and each time he makes it happen. He thinks with me and if there are hurdles we didn't foresee he will solve them.", "Client feedback"], ["I had an excellent experience working with Shahzaib Mirza. He demonstrated exceptional attention to detail, professionalism, and delivered the project on time without compromising quality. His language fluency and clear communication made the process seamless. Highly recommend Shahzaib for top-notch results!", "Client feedback"], ["Met and exceeded my expectations. This was a difficult project however it completed smoothly. I highly recommend Mirza", "Client feedback"], null, ["Excellent experience! The seller delivered accurate and well-organized data scraping exactly as requested. Communication was clear throughout the project, delivery was on time, and the final dataset was clean and complete. They paid close attention to the requirements and even went the extra mile to ensure everything was accurate. I highly recommend this seller for any data scraping or web scraping project and will definitely work with them again", "Client review"], ["Shahzaib is responsive, professional and focused on solving problems. I look forward to working with him again in the future", "Easy Button Real Estate"], ["I've worked with Shahzaib on multiple projects and he has consistently delivered excellent results. His communication is clear and professional, making collaboration smooth and efficient. Shahzaib is an expert in his field, highly reliable, and always ensures tasks are completed on time with great attention to detail. I highly recommend him for any future work.", "Client feedback"]];
  C.forEach((c, i) => { if (FB[i]) c.q = FB[i]; });
  const host = document.getElementById('cases'); if (!host) return;
  const esc = (x) => x.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  C.forEach((c, i) => {
    const el = document.createElement('article'); el.className = 'case reveal';
    el.innerHTML = `
      <span class="case-no">CASE STUDY ${i + 1}</span>
      <h3>${esc(c.t)}</h3><p class="meta">${esc(c.m)}</p>
      <ul class="metrics">${c.k.map(([v, l]) => `<li><b>${esc(v)}</b><span>${esc(l)}</span></li>`).join('')}</ul>
      <p><b class="lab">Challenge</b> ${esc(c.ch)}</p>
      <p class="result"><b class="lab">Result</b> ${esc(c.r)}</p>
      ${c.q ? `<div class="fb"><div class="stars" role="img" aria-label="5 out of 5 stars">${'<i>★</i>'.repeat(5)}<em>5.0 · Client feedback</em></div><blockquote>“${esc(c.q[0])}”<cite>${esc(c.q[1])}</cite></blockquote></div>` : ''}
      <div class="tags">${c.tech.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
      <button class="dia-btn" aria-expanded="false">View architecture &amp; details</button>
      <div class="more"><div class="more-in">
        <h4>What I built</h4><ul class="built">${c.b.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        <h4>Architecture</h4>
        <div class="pipe">${c.p.map(([a, b], n) => `${n ? '<i class="ar"></i>' : ''}<div class="n${n === c.p.length - 1 ? ' last' : ''}"><small>${esc(a)}</small>${esc(b)}</div>`).join('')}</div>
      </div></div>`;
    const btn = el.querySelector('.dia-btn');
    btn.addEventListener('click', () => {
      const open = el.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
      btn.innerHTML = open ? 'Hide details' : 'View architecture &amp; details';
    });
    host.appendChild(el); io.observe(el);
  });
})();

/* ---------- Mobile menu ---------- */
(function menu() {
  const nav = document.querySelector('.nav'), btn = document.getElementById('menu');
  if (!btn) return;
  const set = (open) => { nav.classList.toggle('open', open); btn.setAttribute('aria-expanded', open); btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); };
  btn.addEventListener('click', () => set(!nav.classList.contains('open')));
  nav.querySelectorAll('nav a').forEach((a) => a.addEventListener('click', () => set(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  addEventListener('resize', () => { if (innerWidth > 720) set(false); });
})();
