import { useEffect, useState, useCallback } from "react";
// ⬇️ Adjust the import path if your portalApi lives elsewhere
import * as portalApi from "../services/portalApi";

/**
 * Central data management hook for Client Portal (no mocks)
 * @param {string} userId - signed-in user's id
 */
const usePortalData = (userId) => {
  const [orders, setOrders] = useState([]);
  const [videos, setVideos] = useState([]);
  const [brandAssets, setBrandAssets] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Helpers --------------------------------------------------------------

  const normalizeErr = (e, fallback = "Request failed") => {
    try {
      if (!e) return fallback;
      if (typeof e === "string") return e;
      if (e.message) return e.message;
      return JSON.stringify(e);
    } catch {
      return fallback;
    }
  };

  // --- Fetchers -------------------------------------------------------------

  const refetchOrders = useCallback(async () => {
    if (!userId) return;
    try {
      const list = await portalApi.getUserOrders(userId);
      setOrders(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(normalizeErr(e, "Failed to load orders"));
    }
  }, [userId]);

  const refetchInvoices = useCallback(async () => {
    if (!userId) return;
    try {
      const list = await portalApi.getUserInvoices(userId);
      setInvoices(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(normalizeErr(e, "Failed to load invoices"));
    }
  }, [userId]);

  const refetchVideos = useCallback(async () => {
    if (!userId) return;
    try {
      const list = await portalApi.getUserVideos(userId);
      setVideos(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(normalizeErr(e, "Failed to load videos"));
    }
  }, [userId]);

  const refetchBrand = useCallback(async () => {
    if (!userId) return;
    try {
      const assets = await portalApi.getBrandAssets(userId);
      setBrandAssets(assets || null);
    } catch (e) {
      setError(normalizeErr(e, "Failed to load brand assets"));
    }
  }, [userId]);

  // --- Initial load ---------------------------------------------------------

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!userId) return;
      setIsLoading(true);
      setError(null);
      try {
        const [ordersRes, invoicesRes, videosRes, brandRes] = await Promise.all([
          portalApi.getUserOrders(userId),
          portalApi.getUserInvoices(userId),
          portalApi.getUserVideos(userId),
          portalApi.getBrandAssets(userId),
        ]);
        if (cancelled) return;
        setOrders(Array.isArray(ordersRes) ? ordersRes : []);
        setInvoices(Array.isArray(invoicesRes) ? invoicesRes : []);
        setVideos(Array.isArray(videosRes) ? videosRes : []);
        setBrandAssets(brandRes || null);
      } catch (e) {
        if (!cancelled) setError(normalizeErr(e, "Failed to load portal data"));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [userId]);

  // --- Mutations ------------------------------------------------------------

  /**
   * Upload photos for a new or existing order.
   * Typical server flow (adapt to your API):
   * 1) create an order -> returns { id, ... }
   * 2) upload files against that order.id
   * 3) (optionally) create an invoice for that order
   */
  const uploadPhotos = async ({ packageName, addons = [], files }) => {
    if (!userId) throw new Error("No userId");
    if (!files || files.length === 0) throw new Error("Please select at least 1 file");

    setIsLoading(true);
    setError(null);
    try {
      // 1) create order (server decides status, timestamp, etc.)
      const order = await portalApi.createOrder(userId, packageName, addons);

      // 2) upload files for that order
      await portalApi.uploadOrderFiles(order.id, files);

      // 3) refresh lists from server (no local fabrication)
      await refetchOrders();
      await refetchInvoices();

      return order;
    } catch (e) {
      const msg = normalizeErr(e, "Failed to upload photos");
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Download a processed video (server should return a signed URL or stream)
   */
  const downloadVideo = async (videoId) => {
    try {
      await portalApi.downloadVideo(videoId);
    } catch (e) {
      setError(normalizeErr(e, "Failed to download video"));
      throw e;
    }
  };

  /**
   * Update brand assets
   */
  const updateBrandAssets = async (assets) => {
    if (!userId) throw new Error("No userId");
    setIsLoading(true);
    try {
      const saved = await portalApi.updateBrandAssets(userId, assets);
      setBrandAssets(saved || assets);
      return saved;
    } catch (e) {
      const msg = normalizeErr(e, "Failed to update brand assets");
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // data
    orders,
    videos,
    brandAssets,
    invoices,
    // state
    isLoading,
    error,
    // actions
    refetchOrders,
    refetchInvoices,
    refetchVideos,
    refetchBrand,
    uploadPhotos,
    downloadVideo,
    updateBrandAssets,
  };
};

export default usePortalData;
