/* claim-card: renders one MLR-approved product-claim fragment by id.
   Authoring (DA table):
     | claim-card            |
     | id      | acr20-week24-tnf-ir |
     | show    | headline, lede, claim, cta   (optional; default all) |
   The block never carries copy of its own. If the fragment is missing it renders nothing,
   so an unapproved or expired claim simply disappears from the page. */
import { getClaim, trackFragment } from '../../scripts/fragments.js';

function readConfig(block) {
  const cfg = {};
  [...block.children].forEach((row) => {
    const [k, v] = [...row.children].map((c) => c.textContent.trim());
    if (k) cfg[k.toLowerCase()] = v;
  });
  return cfg;
}

export default async function decorate(block) {
  const cfg = readConfig(block);
  block.textContent = '';
  const claim = await getClaim(cfg.id);
  if (!claim) { block.dataset.state = 'missing'; return; }
  const show = (cfg.show || 'headline, lede, claim, cta').split(',').map((s) => s.trim());
  const c = claim.content;
  block.dataset.claimId = claim.id;
  block.dataset.claimType = claim.scope.claimType;

  const art = document.createElement('article');
  if (show.includes('headline')) { const h = document.createElement('h2'); h.textContent = c.headline; art.append(h); }
  if (show.includes('lede') && c.lede) { const p = document.createElement('p'); p.className = 'lede'; p.textContent = c.lede; art.append(p); }
  if (show.includes('claim')) {
    const p = document.createElement('p'); p.className = 'claim';
    p.textContent = c.claimText;
    const sup = document.createElement('sup'); sup.textContent = (claim.referenceIds || []).map((r) => r.replace('REF-', '').replace(/^0+/, '')).join(',');
    p.append(sup); art.append(p);
  }
  if (show.includes('cta') && c.ctaUrl) {
    const d = document.createElement('div'); d.className = 'button-container';
    const a = document.createElement('a'); a.className = 'button primary'; a.href = c.ctaUrl; a.textContent = c.ctaLabel || 'Learn more';
    a.addEventListener('click', () => trackFragment('fragment.cta', claim));
    d.append(a); art.append(d);
  }
  const safety = document.createElement('p'); safety.className = 'safety';
  safety.innerHTML = 'See <a href="/tarnexa/prescribing-information">full Prescribing Information, including Boxed Warning</a>.';
  art.append(safety);
  block.append(art);

  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { trackFragment('fragment.viewed', claim); io.disconnect(); }
  }, { threshold: 0.5 });
  io.observe(block);
}
