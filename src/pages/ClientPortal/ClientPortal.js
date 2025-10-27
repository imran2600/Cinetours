// src/pages/ClientPortal/ClientPortal.js
import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import portalApi from "../../services/portalApi";

import OrderStatus from "./components/OrderStatus";
import DownloadCenter from "./components/DownloadCenter";
import BrandAssets from "./components/BrandAssets";
import Reorder from "./components/Reorder";
import Invoices from "./components/Invoices";
import styles from "./styles/Portal.module.css";

import ClientPortalGate from "./components/ClientPortalGate";
import UploadScreen from "./components/UploadScreen";
import OrderHub from "./components/OrderHub";
import AddonScreen from "./components/AddOns";

import { getPortalState, setPortalState } from "./state";

function readPreselection() {
  const rawPkg = localStorage.getItem("qt_pkgId");
  const rawAdd = localStorage.getItem("qt_addons");
  return {
    pkgId: rawPkg ? Number(rawPkg) : null,
    addons: rawAdd ? JSON.parse(rawAdd) : null,
  };
}

function clearPreselection() {
  localStorage.removeItem("qt_pkgId");
  localStorage.removeItem("qt_addons");
}

const PACKAGE_OPTIONS = [
  { id: 1, name: "Starter",      photos: "5-10",  price: 49  },
  { id: 2, name: "Professional", photos: "11-20", price: 99  },
  { id: 3, name: "Premium",      photos: "21-30", price: 149 },
];

export default function ClientPortal() {
  const { user, authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [stage, setStage] = useState(null);
  const [preselectedPkgId, setPreselectedPkgId] = useState(null);
  const [preselectedAddons, setPreselectedAddons] = useState(null);
  const [activeTab, setActiveTab] = useState(null);

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [checkedOrders, setCheckedOrders] = useState(false);

  const userId = user?.id ?? user?.user?.id;

  /* ------------------- INITIAL STAGE DECISION ------------------- */
  useEffect(() => {
    if (authLoading || !userId || checkedOrders) return;

    if (searchParams.get("start") === "upload") {
      console.log("[Portal] start=upload detected — jumping straight to upload stage.");
      setStage("upload");
      setCheckedOrders(true);   // prevent the other effect from running again
      return;
    }

    (async () => {
      try {
        const res = await portalApi.getClientStatus();
        console.log("Client status response:", res);
        if (res.has_orders === true) {
          setPortalState(user.email, { hasOrder: true });
          setStage("hub");
        } else {
          setPortalState(user.email, { hasOrder: false });
          setStage("gate");
        }
      } catch (err) {
        console.error("Failed to fetch client status:", err);
        setStage("gate");
      } finally {
        setCheckedOrders(true);
      }
    })();
  }, [authLoading, userId, checkedOrders, user]);

  /* ------------------- FETCH ORDERS FOR STATUS/REORDER ------------------- */
  useEffect(() => {
    const uId = userId;
    if (!uId) return;

    if (stage === "hub" || (stage === "portal" && ["status", "reorder"].includes(activeTab))) {
      (async () => {
        try {
          setIsLoading(true);
          const data = await portalApi.getUserOrders();
          const list = Array.isArray(data?.orders) ? data.orders : data || [];
          setOrders(
            list.map((o, i) => ({
              id: o.order_id ?? o.id ?? `order-${i}`,
              package: o.package ?? "Unknown",
              status: String(o.status ?? "submitted").toLowerCase(),
              date: o.date ?? o.created_at ?? o.updated_at ?? new Date().toISOString(),
              videos: o.videos ?? [],
              photos: o.photos ?? (o.videos?.length || 0),
            }))
          );
        } catch (e) {
          setOrders([]);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [stage, activeTab, userId]);

  /* ------------------- STRIPE REDIRECT & UPLOAD HANDLING ------------------- */
  useEffect(() => {
    const sid = searchParams.get("session_id");
    const paid = searchParams.get("paid");
    const startUpload = searchParams.get("start") === "upload";
    if (!sid || paid !== "1") return;

    let cancelled = false;
    const poll = async (attempt = 0) => {
      try {
        const { status } = await portalApi.getPaymentStatus(sid);
        if (cancelled) return;
        if (status === "succeeded") {
          if (user?.email) setPortalState(user.email, { hasOrder: true });
          setStage("upload");
          return;
        }
        if (status === "failed" || status === "canceled") {
          alert(`Payment ${status}.`);
          return;
        }
        if (attempt < 30) setTimeout(() => poll(attempt + 1), 2000);
        else if (!startUpload) alert("Payment still pending. Please refresh in a moment.");
      } catch (e) {
        console.error(e);
        if (attempt < 5) setTimeout(() => poll(attempt + 1), 2000);
        else if (!startUpload) alert("Unable to verify payment status.");
      }
    };
    poll();
    return () => { cancelled = true; };
  }, [searchParams, user]);

  useEffect(() => {
    const startUpload = searchParams.get("start") === "upload";
    if (!startUpload) return;

    const { pkgId, addons } = readPreselection();
    if (pkgId) setPreselectedPkgId(pkgId);
    if (addons) setPreselectedAddons(addons);

    setStage("upload");
  }, [searchParams]);

  /* ------------------- DOWNLOAD CENTER ------------------- */
  const [dlVideos, setDlVideos] = useState([]);
  useEffect(() => {
    if (stage !== "portal" || activeTab !== "downloads") return;
    if (!userId) return;

    (async () => {
      try {
        const data = await portalApi.getDownloads(userId);
        const mapped = (data?.downloads || []).flatMap((ord) =>
          (ord.videos || []).map((v, idx) => ({
            id: `${ord.order_id}-${idx}`,
            orderId: ord.order_id,
            name: v.filename?.replace(/\.(mp4|mov)$/i, "") || `Video ${idx + 1}`,
            downloadUrl: v.url,
            created: ord.date,
          }))
        );
        setDlVideos(mapped);
      } catch (e) {
        setDlVideos([]);
      }
    })();
  }, [stage, activeTab, userId]);

  /* ------------------- INVOICES ------------------- */
  const [invoiceList, setInvoiceList] = useState([]);
  useEffect(() => {
    if (stage !== "portal" || activeTab !== "invoices") return;
    if (!userId) return;

    (async () => {
      try {
        const data = await portalApi.getUserInvoices();
        console.log("Invoie Data: ",data);
        const mapped = (data?.invoices || []).map((inv) => ({
          id: inv.invoice_id,
          amount: inv.amount,
          date: inv.created_at,
          is_paid: inv.is_paid,
        }));
        setInvoiceList(mapped);
      } catch (e) {
        setInvoiceList([]);
      }
    })();
  }, [stage, activeTab, userId]);

  /* ------------------- HELPERS ------------------- */
  const clearNewFlag = () => setSearchParams({});
  const toGate = () => {
    if (user?.email) setPortalState(user.email, { hasOrder: false });
    setPreselectedPkgId(null);
    setPreselectedAddons(null);
    setStage("gate");
  };

  /* ------------------------------- RENDER ------------------------------- */
  const selectedPackage = PACKAGE_OPTIONS.find(
    (p) => String(p.id) === String(preselectedPkgId)
  );

  // STEP 1: Choose Package
  if (stage === "gate") {
    return (
      <ClientPortalGate
        packages={PACKAGE_OPTIONS}
        onContinue={(id) => {
          setPreselectedPkgId(id);
          setStage("addons");
        }}
      />
    );
  }

  // STEP 2: Add-Ons
  if (stage === "addons") {
    return (
      <AddonScreen
        onBack={() => setStage("gate")}
        onContinue={(addons) => {
          setPreselectedAddons(addons);
          setStage("upload");
        }}
        userId={userId}
        selectedPackage={selectedPackage}
      />
    );
  }

  // STEP 3: Upload Photos
  if (stage === "upload") {
    return (
      <UploadScreen
        packages={PACKAGE_OPTIONS}
        preselectedPackageId={preselectedPkgId}
        preselectedAddons={preselectedAddons}
        onSubmitted={() => {
          if (user?.email) setPortalState(user.email, { hasOrder: true });
          clearNewFlag();
          clearPreselection();
          setStage("hub");
        }}
        onBack={() => {
          setStage("addons");
          clearPreselection();
        }}
      />
    );
  }

  // STEP 4: Hub
  if (stage === "hub") {
    return (
      <OrderHub
        onGo={(tab) => {
          setActiveTab(tab);
          setStage("portal");
        }}
        onStartOrder={() => {
          toGate();
          setSearchParams({ new: "1" });
        }}
      />
    );
  }

  // STEP 5: Portal (detailed tabs)
  if (stage === "portal") {
    const goBack = () => {
      clearNewFlag();
      setStage("hub");
    };

    if (activeTab === "status") {
      return (
        <div className={styles.screenWrap}>
          <button onClick={goBack} className={styles.backBtn}>← Back</button>
          <OrderStatus orders={orders} loading={isLoading} />
        </div>
      );
    }

    if (activeTab === "downloads") {
      return (
        <div className={styles.screenWrap}>
          <button onClick={goBack} className={styles.backBtn}>← Back</button>
          <DownloadCenter videos={dlVideos} userId={userId} />
        </div>
      );
    }

    if (activeTab === "branding") {
      return (
        <div className={styles.screenWrap}>
          <button onClick={goBack} className={styles.backBtn}>← Back</button>
          <BrandAssets
            assets={{
              logo: ["/assets/logo-placeholder.png"],
              colorScheme: "#21ABB5",
              font: "Montserrat",
            }}
            onUpdate={(assets) => {
              alert("Brand assets updated (hook up backend)");
              console.log(assets);
            }}
          />
        </div>
      );
    }

    if (activeTab === "reorder") {
      return (
        <div className={styles.screenWrap}>
          <button onClick={goBack} className={styles.backBtn}>← Back</button>
          <Reorder pastOrders={orders.filter((o) => o.status === "completed")} />
        </div>
      );
    }

    if (activeTab === "invoices") {
      return (
        <div className={styles.screenWrap}>
          <button onClick={goBack} className={styles.backBtn}>← Back</button>
          <Invoices invoices={invoiceList} />
        </div>
      );
    }
  }

  return <Container fluid className={styles.portalContainer}>Loading…</Container>;
}
