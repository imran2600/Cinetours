// src/pages/ClientPortal/state.js
const keyFor = (email) => `qt_portal_state_${email}`;

export function getPortalState(email) {
  if (!email) return { hasOrder: false };
  try {
    return JSON.parse(localStorage.getItem(keyFor(email))) || { hasOrder: false };
  } catch {
    return { hasOrder: false };
  }
}

export function setPortalState(email, patch) {
  if (!email) return;
  const cur = getPortalState(email);
  const next = { ...cur, ...patch };
  localStorage.setItem(keyFor(email), JSON.stringify(next));
  return next;
}

