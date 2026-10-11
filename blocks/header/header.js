/* header: loads /nav (three sections: lockup, primary links, signed-in state). Replaces boilerplate header. */
import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);
  const [brand, sections, tools] = nav.children;
  if (brand) { brand.classList.add('nav-brand'); const a = brand.querySelector('a'); if (a) a.classList.add('product'); }
  if (sections) { sections.classList.add('nav-sections'); sections.setAttribute('aria-label', 'Primary'); }
  if (tools) tools.classList.add('nav-tools');
  // mark current page
  nav.querySelectorAll('.nav-sections a').forEach((a) => {
    if (new URL(a.href).pathname === window.location.pathname) a.setAttribute('aria-current', 'page');
  });
  const wrapper = document.createElement('div');
  wrapper.className = 'nav-wrapper';
  wrapper.append(nav);
  block.append(wrapper);
}
