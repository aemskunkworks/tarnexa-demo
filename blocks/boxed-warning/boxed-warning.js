/* boxed-warning: collapsible FDA boxed warning. A box, because it is required to be one.
   Authoring (DA table):
     | boxed-warning |
     | Serious infections · Mortality · Malignancy · MACE · Thrombosis |   ← one-line summary
     | <rich text: the warning paragraphs> |
   Opens expanded if the URL hash is #boxed-warning (ISI links point here). */
export default function decorate(block) {
  const [summaryRow, bodyRow] = block.children;
  const details = document.createElement('details');
  details.id = 'boxed-warning';
  const summary = document.createElement('summary');
  const h2 = document.createElement('h2'); h2.textContent = 'Boxed warning';
  const line = document.createElement('span'); line.textContent = summaryRow?.textContent.trim() || '';
  const toggle = document.createElement('span'); toggle.className = 'toggle'; toggle.setAttribute('aria-hidden', 'true');
  summary.append(h2, line, toggle);
  const body = document.createElement('div'); body.className = 'body';
  if (bodyRow) body.append(...bodyRow.children[0].childNodes);
  details.append(summary, body);
  block.textContent = '';
  block.append(details);
  const openIfTargeted = () => { if (window.location.hash === '#boxed-warning') details.open = true; };
  window.addEventListener('hashchange', openIfTargeted);
  openIfTargeted();
}
