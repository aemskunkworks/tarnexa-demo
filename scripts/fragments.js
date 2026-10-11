/* Shared loader for product-claim fragments published by saltmarsh-fragments → DA sheet.
   Sheet lives at /fragments/product-claim.json (one row per claim, columns flattened with dots). */

const cache = new Map();

function unflatten(row) {
  const out = {};
  Object.entries(row).forEach(([key, value]) => {
    const parts = key.split('.');
    let cur = out;
    parts.forEach((p, i) => {
      if (i === parts.length - 1) cur[p] = value;
      else cur = cur[p] = cur[p] || {};
    });
  });
  return out;
}

export async function loadClaims(sheet = '/fragments/product-claim.json') {
  if (!cache.has(sheet)) {
    cache.set(sheet, fetch(sheet).then((r) => (r.ok ? r.json() : { data: [] })).then((json) => {
      const byId = new Map();
      (json.data || []).forEach((row) => {
        const doc = unflatten(row);
        const c = doc.content = doc.content || {};
        // arrays were joined with " | " on publish; arrays of objects were JSON-encoded
        ['referenceIds', 'mslTalkingPoints'].forEach((k) => { if (typeof c[k] === 'string') c[k] = c[k] ? c[k].split(' | ') : []; });
        if (typeof c.dataPoints === 'string') { try { c.dataPoints = JSON.parse(c.dataPoints); } catch { c.dataPoints = []; } }
        if (doc.attributes) Object.keys(doc.attributes).forEach((k) => { const n = Number(doc.attributes[k]); if (doc.attributes[k] !== '' && !Number.isNaN(n)) doc.attributes[k] = n; });
        doc.scope = doc.scope || {};
        byId.set(doc.id, doc);
      });
      return byId;
    }).catch(() => new Map()));
  }
  return cache.get(sheet);
}

export async function getClaim(id, sheet) {
  const all = await loadClaims(sheet);
  return all.get(id);
}

/* Data layer: every fragment interaction is an observation for the Audience of One model. */
export function trackFragment(event, fragment, extra = {}) {
  window.adobeDataLayer = window.adobeDataLayer || [];
  window.adobeDataLayer.push({
    event,
    fragment: { id: fragment.id, model: 'product-claim', claimType: fragment['scope.claimType'] || fragment.scope?.claimType },
    attributes: fragment.attributes || null,
    hcp: window.tarnexaHcp || { authenticated: false },
    ...extra,
  });
}
