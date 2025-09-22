// src/services/authApi.js
const BASE_URL = "https://qunatum-tour.onrender.com";

async function post(path, body, asJson = true) {
  const init = { method: "POST", headers: {} };
  if (asJson && body !== undefined) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  } else if (body !== undefined) {
    init.body = body;
  }

  const res = await fetch(`${BASE_URL}${path}`, init);
  let data = {};
  try { data = await res.json(); } catch {}

  if (!res.ok) {
    const msg = data?.detail || data?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export function apiSignup(email, password) {
  return post("/auth/signup", { email, password });
}

export function apiSignin(email, password) {
  return post("/auth/signin", { email, password });
}

export function apiGuest() {
  return post("/auth/guest", undefined);
}

export function apiForgotPassword(email) {
  return post("/auth/password/forgot", { email });
}

