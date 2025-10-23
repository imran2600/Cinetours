import { useEffect, useState, useCallback } from "react";
import  portalApi from "../../services/portalApi";


const usePortalData = (userId) => {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);


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


  const refetchInvoices = useCallback(async () => {
    if (!userId) return;
    try {
      const list = await portalApi.getUserInvoices(userId);
      setInvoices(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(normalizeErr(e, "Failed to load invoices"));
    }
  }, [userId]);


  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!userId) return;
      setIsLoading(true);
      setError(null);
      try {
        const invoicesRes = await portalApi.getUserInvoices(userId);
        if (cancelled) return;
        setInvoices(Array.isArray(invoicesRes) ? invoicesRes : []);
      } catch (e) {
        if (!cancelled) setError(normalizeErr(e, "Failed to load portal data"));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [userId]);



  return {
    invoices,
    isLoading,
    error,
    refetchInvoices,
  };
};

export default usePortalData;
