// src/services/portalApi.js
const BASE_URL = "https://qunatum-tour.onrender.com";
const CLIENT_PREFIX = "/api/client";   // Assuming this is the prefix used for your FastAPI router
const STRIPE_PREFIX = "/stripe";

async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return false;

  const res = await fetch(`${BASE_URL}/auth/token/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refresh }),
  });

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
  const res = await fetch(`${BASE_URL}${path}`, { headers: authHeaders() });
  let data = {};
  try { data = await res.json(); } catch {}

  // ✅ Handle expired/invalid token
  if (res.status === 401 || res.status === 403) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return await get(path);
    // if refresh failed, clear session + redirect
    localStorage.clear();
    window.location.href = "/portal"; // redirect to client hub
    return;
  }

  if (!res.ok) {
    throw new Error(data?.detail || data?.message || `GET ${path} failed (${res.status})`);
  }
  return data;
}

async function post(path, body, asJson = true) {
  const init = { method: "POST", headers: authHeaders() };
  if (asJson && body !== undefined) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  } else if (body !== undefined) {
    init.body = body; // for FormData uploads
  }

  const res = await fetch(`${BASE_URL}${path}`, init);
  let data = {};
  try { data = await res.json(); } catch {}

  // ✅ Handle expired/invalid token
  if (res.status === 401 || res.status === 403) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return await post(path, body, asJson);
    localStorage.clear();
    window.location.href = "/portal";
    return;
  }

  if (!res.ok) {
    throw new Error(data?.detail || data?.message || `POST ${path} failed (${res.status})`);
  }
  return data;
}

const portalApi = {
  /* ------------------ ORDERS ------------------ */

  createOrder(userId, pkgName, addOns, files) {
    const fd = new FormData();
    fd.append("user_id", userId);
    fd.append("package", pkgName);
    if (addOns) fd.append("add_ons", JSON.stringify(addOns));
    if (files && files.length) files.forEach(f => fd.append("files", f));
    return post(`${CLIENT_PREFIX}/orders/new`, fd, false);
  },

  reorder(orderId) {
    // ✅ Matches POST /orders/{order_id}/reorder
    return post(`${CLIENT_PREFIX}/orders/${encodeURIComponent(orderId)}/reorder`);
  },

  getClientStatus() {
    return get(`${CLIENT_PREFIX}/client/status`);
  },

  getUserOrders() {
    return get(`${CLIENT_PREFIX}/orders/status`);
  },

  /* ------------------ DOWNLOAD CENTER ------------------ */
  getDownloads(userId) {
    return get(`${CLIENT_PREFIX}/download-center?user_id=${encodeURIComponent(userId)}`);
  },

  /* ------------------ INVOICES ------------------ */
  getUserInvoices() {
    return get(`${CLIENT_PREFIX}/invoices`);
  },

  getInvoice(invoiceId) {
    // ✅ Matches GET /invoice/{invoice_id}
    return get(`${CLIENT_PREFIX}/invoice/${encodeURIComponent(invoiceId)}`);
  },

  async getInvoiceBlob(invoiceId) {
    // Handles PDF and JSON gracefully
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
    // ✅ Matches POST /invoice/{order_id}/pay
    return post(`${CLIENT_PREFIX}/invoice/${encodeURIComponent(orderId)}/pay`);
  },

  /* ------------------ UPLOAD ------------------ */
  // upload(formData) {
  //   // ✅ Matches POST /upload
  //   return post(`${CLIENT_PREFIX}/upload`, formData, false);
  // },

  /* ------------------ STRIPE ------------------ */
  createCheckoutSession(payload) {
    return post(`${STRIPE_PREFIX}/create-checkout-session`, payload);
  },

  getPaymentStatus(sessionId) {
    return get(`${STRIPE_PREFIX}/payment-status/${encodeURIComponent(sessionId)}`);
  },
};

export default portalApi;

