// // src/services/portalApi.js
const BASE_URL = "https://qunatum-tour.onrender.com";
const CLIENT_PREFIX = "/api/client"; 
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
    // FormData: don't set Content-Type
    init.body = body;
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
  // Upload (immediate generation)
  uploadPhotos(pkgName, addOns, files) {
    const fd = new FormData();
    fd.append("package", pkgName);
    if (addOns) fd.append("add_ons", JSON.stringify(addOns));
    files.forEach(f => fd.append("files", f));
    return post("/upload", fd, /*asJson*/ false);
  },

  // Create Order (+ invoice)
  createOrder(userId, pkgName, addOns, files) {
    const fd = new FormData();
    fd.append("user_id", userId);
    fd.append("package", pkgName);
    if (addOns) fd.append("add_ons", JSON.stringify(addOns));
    files.forEach(f => fd.append("files", f));
    return post(`${CLIENT_PREFIX}/orders/new`, fd, false);
  },

  // Download center
  getDownloads(userId) {
    return get(`${CLIENT_PREFIX}/download-center?user_id=${encodeURIComponent(userId)}`);
  },

  // Reorder
  reorder(orderId) {
    return post(`${CLIENT_PREFIX}/orders/${orderId}/reorder`);
  },

  // Invoices
  getUserInvoices(userId) {
    return get(`${CLIENT_PREFIX}/${encodeURIComponent(userId)}/invoices`);
  },

  getInvoice(invoiceId) {
    return get(`${CLIENT_PREFIX}/invoice/${encodeURIComponent(invoiceId)}`);
  },

  // list orders for a user
  getUserOrders(userId) {
     return get(`${CLIENT_PREFIX}/orders?user_id=${encodeURIComponent(userId)}`);
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
