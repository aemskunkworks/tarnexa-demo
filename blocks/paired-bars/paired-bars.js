/* paired-bars: two (or more) proportions drawn to scale, for a primary endpoint.
   Reads the fragment's dataPoints when given a claim id; otherwise takes rows as authored.
   Authoring (DA table):
     | paired-bars |
     | claim   | acr20-week24-tnf-ir |            ← pulls dataPoints[0..1] from the fragment
     | caption | Primary endpoint in adults with ... |
   or, authored directly:
     | Tarnexa 15 mg + csDMARD | 58% |
     | Placebo + csDMARD       | 29% |
     | caption | ... |
   Second row is drawn in the muted "placebo" style. */
import { getClaim } from '../../scripts/fragments.js';

export default async function decorate(block) {
  const rows = [...block.children].map((r) => [...r.children].map((c) => c.textContent.trim()));
  const cfg = Object.fromEntries(rows.filter((r) => ['claim', 'caption', 'note'].includes(r[0]?.toLowerCase())).map((r) => [r[0].toLowerCase(), r[1]]));
  let bars = rows.filter((r) => !['claim', 'caption', 'note'].includes(r[0]?.toLowerCase())).map(([label, value]) => ({ label, value }));
  let note = cfg.note || '';
  if (cfg.claim) {
    const claim = await getClaim(cfg.claim);
    const dps = (claim?.content?.dataPoints || []).slice(0, 2);
    if (dps.length) bars = dps.map((d) => ({ label: d.label, value: d.value }));
    if (!note && dps[0]) note = `${dps[0].label.split(',')[0]} at ${dps[0].timepoint}`;
  }
  block.textContent = '';
  const fig = document.createElement('figure');
  const rowsEl = document.createElement('div'); rowsEl.className = 'rows';
  bars.forEach((b, i) => {
    const pct = parseFloat(b.value) || 0;
    const bar = document.createElement('div'); bar.className = `bar${i === 1 ? ' placebo' : ''}`;
    bar.innerHTML = `<span class="lab">${b.label}</span><span class="track"><span class="fill" style="width:${Math.min(100, pct)}%"></span></span><span class="val">${b.value}</span>`;
    rowsEl.append(bar);
  });
  fig.append(rowsEl);
  if (note) { const n = document.createElement('div'); n.className = 'note'; n.textContent = note; fig.append(n); }
  if (cfg.caption) { const cap = document.createElement('figcaption'); cap.textContent = cfg.caption; fig.append(cap); }
  block.append(fig);
}
