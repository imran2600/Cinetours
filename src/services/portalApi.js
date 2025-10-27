// src/services/portalApi.js
const BASE_URL = "https://qunatum-tour.onrender.com"; // verify spelling!
const CLIENT_PREFIX = "/api/client";
const STRIPE_PREFIX = "/stripe";

async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return false;

  const res = await fetch(`${BASE_URL}/auth/token/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refresh }),
  });

  console.log("🔄 Refresh response:", res.status);
  if (!res.ok) return false;
  const data = await res.json();
  if (!data.access_token) return false;
  localStorage.setItem("access_token", data.access_token);
  return true;
}

function authHeaders(extra = {}) {
  const token = localStorage.getItem("access_token");
  const h = { ...extra };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

async function get(path) {
  const url = `${BASE_URL}${path}`;
  console.log("[API] GET ->", url);
  const res = await fetch(url, { headers: authHeaders() });
  let data = {};
  try { data = await res.json(); } catch {}
  console.log("[API] <-", res.status, data);

  if (res.status === 401 || res.status === 403) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return await get(path);
    localStorage.clear();
    window.location.href = "/portal";
    return;
  }

  if (!res.ok) throw new Error(data?.detail || data?.message || `GET ${path} failed (${res.status})`);
  return data;
}

// SINGLE post() helper (keep this one; remove duplicates)
async function post(path, body, asJson = true) {
  const url = `${BASE_URL}${path}`;
  const init = { method: "POST", headers: authHeaders() };
  if (asJson && body !== undefined) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  } else if (body !== undefined) {
    init.body = body; // FormData (no manual content-type)
  }

  console.log("[API] POST ->", url, "asJson:", asJson, body instanceof FormData ? "(FormData)" : body);
  const res = await fetch(url, init);
  let data = {};
  try { data = await res.json(); } catch {}
  console.log("[API] <-", res.status, data);

  if (res.status === 401 || res.status === 403) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return await post(path, body, asJson);
    localStorage.clear();
    window.location.href = "/portal";
    return;
  }

  if (!res.ok) throw new Error(data?.detail || data?.message || `POST ${path} failed (${res.status})`);
  return data;
}


const portalApi = {

  uploadPhotos(pkgName, addOns, files) {
    const fd = new FormData();
    fd.append("package", pkgName);
    if (addOns) fd.append("add_ons", JSON.stringify(addOns));
    (files || []).forEach(f => fd.append("files", f));
    return post(`/upload`, fd, false);
  },

  createOrder(userId, pkgName, addOns, files) {
    const fd = new FormData();
    fd.append("user_id", userId);
    fd.append("package", pkgName);
    if (addOns) fd.append("add_ons", JSON.stringify(addOns));
    (files || []).forEach(f => fd.append("files", f));
    return post(`${CLIENT_PREFIX}/orders/new`, fd, false);
  },

  reorder(orderId) {
    return post(`${CLIENT_PREFIX}/orders/${encodeURIComponent(orderId)}/reorder`);
  },

  getClientStatus() {
    return get(`${CLIENT_PREFIX}/client/status`);
  },

  getUserOrders() {
    return get(`${CLIENT_PREFIX}/orders/status`);
  },

  getDownloads(userId) {
    return get(`${CLIENT_PREFIX}/download-center?user_id=${encodeURIComponent(userId)}`);
  },

  getUserInvoices() {
    return get(`${CLIENT_PREFIX}/invoices`);
  },

  getInvoice(invoiceId) {
    return get(`${CLIENT_PREFIX}/invoice/${encodeURIComponent(invoiceId)}`);
  },

  async getInvoiceBlob(invoiceId) {
    const path = `${CLIENT_PREFIX}/invoice/${encodeURIComponent(invoiceId)}`;
    const res = await fetch(`${BASE_URL}${path}`, { headers: authHeaders() });
    if (!res.ok) throw new Error(`GET ${path} failed (${res.status})`);
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/pdf")) {
      return { blob: await res.blob(), contentType };
    }
    const json = await res.json().catch(() => ({}));
    return { json, contentType };
  },

  payInvoice(orderId) {
    return post(`${CLIENT_PREFIX}/invoice/${encodeURIComponent(orderId)}/pay`);
  },

  createCheckoutSession(payload) {
    return post(`${STRIPE_PREFIX}/create-checkout-session`, payload);
  },

  getPaymentStatus(sessionId) {
    return get(`${STRIPE_PREFIX}/payment-status/${encodeURIComponent(sessionId)}`);
  },
};

export default portalApi;
