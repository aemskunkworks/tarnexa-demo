/* isi: Important Safety Information. Two-column on desktop, authored as a single rich-text cell
   with h3 subheads; the block splits the h3 groups across two columns.
   Authoring (DA table):
     | isi |
     | <rich text: h3 + paragraphs, repeated> |
   The block is usually authored once as a DA fragment and included on every page. */
export default function decorate(block) {
  const source = block.children[0]?.children[0];
  if (!source) return;
  const groups = [];
  let cur = null;
  [...source.childNodes].forEach((n) => {
    if (n.nodeType === 1 && n.tagName === 'H3') { cur = document.createElement('div'); cur.className = 'block'; groups.push(cur); }
    if (!cur) { cur = document.createElement('div'); cur.className = 'block'; groups.push(cur); }
    cur.append(n);
  });
  const h2 = document.createElement('h2'); h2.textContent = 'Important Safety Information'; h2.id = 'safety';
  const cols = document.createElement('div'); cols.className = 'cols';
  const left = document.createElement('div'); const right = document.createElement('div');
  const half = Math.ceil(groups.length / 2);
  groups.forEach((g, i) => (i < half ? left : right).append(g));
  cols.append(left, right);
  block.textContent = '';
  block.append(h2, cols);
}
