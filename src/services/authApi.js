// src/services/authApi.js
const BASE_URL = "https://qunatum-tour.onrender.com";

async function request(path, { method = "GET", body, asJson = true } = {}) {
  const headers = {};
  const token = localStorage.getItem("access_token"); // remove this if you use httpOnly cookies
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const init = { method, headers };
  if (asJson && body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  } else if (body !== undefined) {
    init.body = body; // e.g., FormData
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

export function apiSignup(name, email, password) {
  return request("/auth/signup", { method: "POST", body: { name, email, password } });
}
export function apiSignin(email, password) {
  return request("/auth/signin", { method: "POST", body: { email, password } });
}
export function apiGuest() {
  return request("/auth/guest", { method: "POST" });
}
export function apiForgotPassword(email) {
  return request("/auth/password/forgot", { method: "POST", body: { email } });
}