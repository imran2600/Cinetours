// src/services/portalApi.js
const BASE_URL = "https://qunatum-tour.onrender.com";
const CLIENT_PREFIX = "/api/client";   // Assuming this is the prefix used for your FastAPI router
const STRIPE_PREFIX = "/stripe";

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
  getUserInvoices(userId) {
    // ✅ Matches GET /{user_id}/invoices
    return get(`${CLIENT_PREFIX}/${encodeURIComponent(userId)}/invoices`);
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

