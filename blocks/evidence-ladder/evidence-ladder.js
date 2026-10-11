/* evidence-ladder: progressive disclosure of evidence, summary → MSL request.
   This block IS the Audience of One item: each rung opened is an observation (evidence.depth).

   Authoring (DA table): one row per rung, in order.
     | evidence-ladder |
     | What the pivotal trial showed | Summary       | <rich text body> |
     | Trial design and endpoints    | Pivotal data  | <rich text body, may include a table> |
     ...
   Optional first row "claim | <fragment-id>" ties the ladder to a fragment so events carry its attributes.
   The first rung opens by default. */
import { getClaim, trackFragment } from '../../scripts/fragments.js';

export default async function decorate(block) {
  const rows = [...block.children];
  let claim = { id: 'evidence-ladder', scope: { claimType: 'efficacy' } };
  if (rows[0] && rows[0].children[0]?.textContent.trim().toLowerCase() === 'claim') {
    const id = rows.shift().children[1]?.textContent.trim();
    claim = (await getClaim(id)) || { id, scope: { claimType: 'efficacy' } };
  }

  const ol = document.createElement('ol');
  ol.setAttribute('aria-label', 'Evidence, from summary to source');
  rows.forEach((row, i) => {
    const [titleCell, rungCell, bodyCell] = row.children;
    const li = document.createElement('li');
    const details = document.createElement('details');
    details.dataset.rung = String(i + 1);
    if (i === 0) details.open = true;
    const summary = document.createElement('summary');
    const h3 = document.createElement('h3'); h3.textContent = titleCell?.textContent.trim() || `Step ${i + 1}`;
    const rung = document.createElement('span'); rung.className = 'rung'; rung.textContent = rungCell?.textContent.trim() || '';
    summary.append(h3, rung);
    const content = document.createElement('div'); content.className = 'content';
    if (bodyCell) content.append(...bodyCell.childNodes);
    content.querySelectorAll('a.button').forEach((a) => { a.classList.add('button'); });
    details.append(summary, content);
    details.addEventListener('toggle', () => {
      if (details.open) trackFragment('fragment.engaged', claim, { evidence: { depth: i + 1, label: rung.textContent } });
    });
    li.append(details);
    ol.append(li);
  });
  block.textContent = '';
  block.append(ol);
  // Initial open rung counts as an observation once visible.
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { trackFragment('fragment.engaged', claim, { evidence: { depth: 1, label: 'Summary' } }); io.disconnect(); }
  }, { threshold: 0.4 });
  io.observe(block);
}
