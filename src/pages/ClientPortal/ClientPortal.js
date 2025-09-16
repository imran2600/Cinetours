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

import { useOrders } from "../hooks/useOrders";
import styles from "./styles/Portal.module.css";

import ClientPortalGate from "./components/ClientPortalGate";
import UploadScreen from "./components/UploadScreen";
import OrderHub from "./components/OrderHub";
import AddonScreen from "./components/AddOns";

import { getPortalState, setPortalState } from "./state";

const PACKAGE_OPTIONS = [
  { id: 1, name: "Starter",      photos: "5-10",  price: 49  },
  { id: 2, name: "Professional", photos: "11-20", price: 99  },
  { id: 3, name: "Premium",      photos: "21-30", price: 149 },
];

export default function ClientPortal() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Decide first screen
  const startNew = searchParams.get("new") === "1";
  const portalState = getPortalState(user?.email); // { hasOrder: boolean }

  const [stage, setStage] = useState(
    startNew || !portalState?.hasOrder ? "gate" : "hub"
  ); // "gate" → "addons" → "upload" → "hub" → "portal"

  const [preselectedPkgId, setPreselectedPkgId] = useState(null);
  const [preselectedAddons, setPreselectedAddons] = useState(null);
  const [activeTab, setActiveTab] = useState(null);

  const { orders } = useOrders();
  const [isLoading] = useState(false);

  // Backend data for download center & invoices
  const [dlVideos, setDlVideos] = useState([]);
  const [invoiceList, setInvoiceList] = useState([]);

  const clearNewFlag = () => setSearchParams({});
  const toGate = () => {
    setPreselectedPkgId(null);
    setPreselectedAddons(null);
    setStage("gate");
  };

  /* ------------------- Effects (top-level; not conditional) ------------------- */

  // Fetch Download Center items when the "downloads" tab is opened
  useEffect(() => {
    if (stage !== "portal" || activeTab !== "downloads") return;
    const userId = user?.id ?? user?.user?.id;
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
        console.error("Download center fetch failed:", e);
        setDlVideos([]);
      }
    })();
  }, [stage, activeTab, user]);

  // Fetch invoices when the "invoices" tab is opened
  useEffect(() => {
    if (stage !== "portal" || activeTab !== "invoices") return;
    const userId = user?.id ?? user?.user?.id;
    if (!userId) return;

    (async () => {
      try {
        const data = await portalApi.getUserInvoices(userId);
        const mapped = (data?.invoices || []).map((inv) => ({
          ...inv,
          status: inv.status === "paid" ? "paid" : "pending",
        }));
        setInvoiceList(mapped);
      } catch (e) {
        console.error("Invoices fetch failed:", e);
        setInvoiceList([]);
      }
    })();
  }, [stage, activeTab, user]);

  /* ------------------------------- Rendering ------------------------------- */

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
          setStage("hub");
        }}
        onBack={() => setStage("addons")}
      />
    );
  }

  // STEP 4: Hub (no sidebar)
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

  // STEP 5: Dedicated views with Back
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
          <DownloadCenter videos={dlVideos} />
        </div>
      );
    }

    if (activeTab === "branding") {
      return (
        <div className={styles.screenWrap}>
          <button onClick={goBack} className={styles.backBtn}>← Back</button>
          <BrandAssets
            assets={{ 
              logo: "/assets/logo-placeholder.png", 
              logos: [],
              headshots: [],
              colorScheme: "#21ABB5", 
              font: "Montserrat" 
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
