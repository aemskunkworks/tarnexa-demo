/* hcp-gate: mock authentication for the demo. No backend.
   Authoring (DA table):
     | hcp-gate |
     | <rich text shown above the form: who this site is for> |
   Behaviour: if no `tarnexa_hcp` cookie, render a modal-style gate over the page and hide main content
   (aria-hidden + inert). Submitting sets the cookie, sets window.tarnexaHcp, pushes an identity event
   to adobeDataLayer and reveals the page. A "Sign out" link anywhere (href="/sign-out") clears it.
   The NPI is never sent anywhere; a 10-digit shape check is the only validation. */

const COOKIE = 'tarnexa_hcp';

function readCookie() {
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  if (!m) return null;
  try { return JSON.parse(decodeURIComponent(m[1])); } catch { return null; }
}
function writeCookie(obj) { document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(obj))}; path=/; max-age=${60 * 60 * 8}; SameSite=Lax`; }
function clearCookie() { document.cookie = `${COOKIE}=; path=/; max-age=0`; }

function applyIdentity(hcp) {
  window.tarnexaHcp = { authenticated: true, specialty: hcp.specialty, hcpId: hcp.hcpId };
  window.adobeDataLayer = window.adobeDataLayer || [];
  window.adobeDataLayer.push({ event: 'hcp.authenticated', hcp: window.tarnexaHcp });
  document.querySelectorAll('[data-hcp-name]').forEach((el) => { el.textContent = hcp.name; });
  document.querySelectorAll('[data-hcp-specialty]').forEach((el) => { el.textContent = hcp.specialtyLabel; });
}

export default function decorate(block) {
  const intro = block.children[0]?.children[0];
  const main = document.querySelector('main');

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href="/sign-out"]');
    if (!a) return;
    e.preventDefault(); clearCookie(); window.location.href = '/';
  });

  const existing = readCookie();
  if (existing) { applyIdentity(existing); block.remove(); return; }

  // Gate the page
  main.querySelectorAll(':scope > .section').forEach((s) => { if (!s.contains(block)) { s.setAttribute('inert', ''); s.setAttribute('aria-hidden', 'true'); } });
  document.body.classList.add('hcp-gated');

  block.textContent = '';
  const panel = document.createElement('div'); panel.className = 'panel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-labelledby', 'gate-h');
  const h = document.createElement('h1'); h.id = 'gate-h'; h.textContent = 'For US healthcare professionals';
  panel.append(h);
  if (intro) panel.append(...intro.childNodes);

  const form = document.createElement('form'); form.noValidate = true;
  form.innerHTML = `
    <label for="gate-name">Name</label>
    <input id="gate-name" name="name" autocomplete="name" required value="Dr. Ines Okafor-Lindqvist">
    <label for="gate-npi">NPI number</label>
    <input id="gate-npi" name="npi" inputmode="numeric" pattern="[0-9]{10}" required value="1234567893" aria-describedby="gate-npi-help">
    <small id="gate-npi-help">10 digits. Simulated: the number is checked for shape only and never sent anywhere.</small>
    <label for="gate-spec">Specialty</label>
    <select id="gate-spec" name="specialty">
      <option value="rheumatology">Rheumatology</option>
      <option value="internal-medicine">Internal medicine</option>
      <option value="dermatology">Dermatology</option>
      <option value="pharmacy">Pharmacy</option>
    </select>
    <p class="err" role="alert" hidden></p>
    <div class="button-container"><button class="button primary" type="submit">Continue to the HCP site</button></div>
    <p class="fine">By continuing you confirm you are a US healthcare professional. Fictional site for a technology demonstration.</p>`;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim(); const npi = form.npi.value.trim();
    const err = form.querySelector('.err');
    if (!name || !/^\d{10}$/.test(npi)) { err.textContent = 'Enter your name and a 10-digit NPI number.'; err.hidden = false; return; }
    const spec = form.specialty; const hcp = { name, hcpId: `npi:${npi.slice(-4)}`, specialty: spec.value, specialtyLabel: spec.options[spec.selectedIndex].text };
    writeCookie(hcp); applyIdentity(hcp);
    main.querySelectorAll('[inert]').forEach((s) => { s.removeAttribute('inert'); s.removeAttribute('aria-hidden'); });
    document.body.classList.remove('hcp-gated');
    block.remove();
  });
  panel.append(form);
  block.append(panel);
  form.querySelector('input').focus();
}
