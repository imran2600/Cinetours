import { useState, useEffect, useCallback } from "react";
import portalApi from "../../services/portalApi";

/**
 * Central data management hook for Client Portal
 * Fully integrated with backend (no mock data)
 *
 * @param {string} userId - Logged-in user's ID
 */
const usePortalData = (userId) => {
  const [orders, setOrders] = useState([]);
  const [videos, setVideos] = useState([]);
  const [brandAssets, setBrandAssets] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------
  const normalizeError = (err, fallback = "Unexpected error") => {
    if (!err) return fallback;
    if (typeof err === "string") return err;
    if (err.message) return err.message;
    try {
      return JSON.stringify(err);
    } catch {
      return fallback;
    }
  };

  // --------------------------------------------------------------------------
  // Fetch all portal data
  // --------------------------------------------------------------------------
  const fetchPortalData = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);

    try {
      const [downloads, invoicesRes] = await Promise.all([
        portalApi.getDownloads(userId),
        portalApi.getUserInvoices(userId),
      ]);

      // Derive simplified "orders" list from download-center data
      const derivedOrders = (downloads?.downloads || []).map((d) => ({
        id: d.order_id || d.id,
        date: d.date,
        package: d.package || "Starter",
        status: (d.videos?.length ?? 0) > 0 ? "completed" : "submitted",
        photos: d.photos ?? (d.videos?.length ?? 0),
      }));

      setOrders(derivedOrders);
      setVideos(downloads?.videos || []);
      setBrandAssets(downloads?.branding || null);
      setInvoices(invoicesRes || []);
    } catch (e) {
      setError(normalizeError(e));
    } finally {
      setIsLoading(false);
    }
  }, [userId]); // ✅ dependency

  useEffect(() => {
    fetchPortalData();
  }, [fetchPortalData]); // ✅ avoids missing-dependency warning

  // --------------------------------------------------------------------------
  // Upload photos -> creates order & invoice
  // --------------------------------------------------------------------------
  const uploadPhotos = async (pkgName, addOns = [], files = []) => {
    if (!userId) throw new Error("User ID missing");
    if (!pkgName) throw new Error("Package name required");
    if (!files?.length) throw new Error("Please select at least 1 file");

    setIsLoading(true);
    setError(null);

    try {
      const order = await portalApi.createOrder(userId, pkgName, addOns, files);
      await fetchPortalData(); // refresh after upload
      return order;
    } catch (e) {
      const msg = normalizeError(e, "Upload failed");
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Reorder (backend handles duplication)
  // --------------------------------------------------------------------------
  const reorder = async (orderId) => {
    if (!orderId) return;
    setIsLoading(true);
    try {
      await portalApi.reorder(orderId);
      await fetchPortalData();
    } catch (e) {
      setError(normalizeError(e, "Reorder failed"));
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Download a processed video
  // --------------------------------------------------------------------------
  const downloadVideo = async (videoId) => {
    if (!videoId) return;
    try {
      const res = await portalApi.getDownloads(userId);
      const video = res?.videos?.find((v) => v.id === videoId);
      if (video?.downloadUrl) window.open(video.downloadUrl, "_blank");
      else throw new Error("Download link not available yet");
    } catch (e) {
      setError(normalizeError(e, "Download failed"));
    }
  };

  // --------------------------------------------------------------------------
  // Pay invoice (Stripe integration)
  // --------------------------------------------------------------------------
  const payInvoice = async (invoiceId) => {
    if (!invoiceId) return;
    setIsLoading(true);
    try {
      await portalApi.payInvoice(invoiceId);
      await fetchPortalData();
    } catch (e) {
      setError(normalizeError(e, "Payment failed"));
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Expose data & actions
  // --------------------------------------------------------------------------
  return {
    // Data
    orders,
    videos,
    brandAssets,
    invoices,

    // States
    isLoading,
    error,

    // Actions
    fetchPortalData,
    uploadPhotos,
    reorder,
    downloadVideo,
    payInvoice,
  };
};

export default usePortalData;
