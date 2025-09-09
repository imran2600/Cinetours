import React, { useState } from "react";
import { Container } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

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

  // Decide first screen: Hub if the user has an order, otherwise Gate.
  // ?new=1 always opens Gate for a fresh order.
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

  const clearNewFlag = () => setSearchParams({}); // clear ?new so future landings go to Hub

  const toGate = () => {
    setPreselectedPkgId(null);
    setPreselectedAddons(null);
    setStage("gate");
  };

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
          // Persist "hasOrder" so future visits go to Hub
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
          // Start a new order from the Hub
          toGate();
          // Optional: set ?new=1 while the user is in the new-order flow
          // (we'll clear it on submit or when going back to the hub)
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
          <DownloadCenter
            videos={orders
              .filter(o => o.status === "completed")
              .map(o => ({
                id: o.id,
                orderId: o.id,
                name: `${o.package} Package Video`,
                downloadUrl: "#",
                created: o.date
              }))}
            onDownload={(id) => alert(`Downloading video ${id} (hook up backend)`)}
          />
        </div>
      );
    }

    if (activeTab === "branding") {
      return (
        <div className={styles.screenWrap}>
          <button onClick={goBack} className={styles.backBtn}>← Back</button>
          <BrandAssets
            assets={{ logo: "/assets/logo-placeholder.png", colorScheme: "#21ABB5", font: "Montserrat" }}
            onUpdate={(assets) => { alert("Brand assets updated (hook up backend)"); console.log(assets); }}
          />
        </div>
      );
    }

    if (activeTab === "reorder") {
      return (
        <div className={styles.screenWrap}>
          <button onClick={goBack} className={styles.backBtn}>← Back</button>
          <Reorder pastOrders={orders.filter(o => o.status === "completed")} />
        </div>
      );
    }

    if (activeTab === "invoices") {
      return (
        <div className={styles.screenWrap}>
          <button onClick={goBack} className={styles.backBtn}>← Back</button>
          <Invoices
            invoices={orders.map(o => ({
              id: o.id,
              date: o.date,
              amount: PACKAGE_OPTIONS.find(p => p.name === o.package)?.price || 0,
              status: "paid",
            }))}
          />
        </div>
      );
    }
  }

  return <Container fluid className={styles.portalContainer}>Loading…</Container>;
}
