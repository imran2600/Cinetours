import React, { useEffect, useState } from "react";
import { Form, Button, Card, Spinner } from "react-bootstrap";
import styles from "./UploadOrder.module.css";
import { useAuth } from "../../../auth/AuthContext";
import portalApi from "../../../services/portalApi";

const ADDON_PRICES = {
  voiceoverAI: 30,
  talkThrough: 80,
  reelSplit: 50,
  extraReel: 10,
  rush12h: 50,
  revisionRound: 10,
  premiumEdit: 40,
};

const BUNDLES = {
  socialBoost: { price: 90, includes: ["reelSplit", "voiceoverAI", "rush12h"] },
  agentPresenter: { price: 150, includes: ["talkThrough", "premiumEdit"] },
  fullMarketing: {
    price: 200,
    includes: ["voiceoverAI", "talkThrough", "reelSplit", "rush12h", "premiumEdit"],
  },
};

function computeAddonsTotal(a = {}) {
  let total = 0;
  if (a.bundle && BUNDLES[a.bundle]) total += BUNDLES[a.bundle].price;
  const covered = new Set(a.bundle ? BUNDLES[a.bundle].includes : []);
  if (a.voiceoverAI && !covered.has("voiceoverAI")) total += ADDON_PRICES.voiceoverAI;
  if (a.talkThrough && !covered.has("talkThrough")) total += ADDON_PRICES.talkThrough;
  if (a.reelSplit && !covered.has("reelSplit")) total += ADDON_PRICES.reelSplit;
  if (a.rush12h && !covered.has("rush12h")) total += ADDON_PRICES.rush12h;
  if (a.premiumEdit && !covered.has("premiumEdit")) total += ADDON_PRICES.premiumEdit;
  if (a.extraReels > 0) total += a.extraReels * ADDON_PRICES.extraReel;
  if (a.revisionRounds > 0) total += a.revisionRounds * ADDON_PRICES.revisionRound;
  return total;
}

const UploadOrder = ({
  packages,
  isLoading: propLoading,
  preselectedPackageId,
  initialAddons = null,
  onSubmit,
}) => {
  const { user } = useAuth();
  const PACKAGE_LIMITS = {
    Starter:       { min: 5,  max: 10 },
    Professional:  { min: 11, max: 20 },
    Premium:       { min: 21, max: 30 },
  };


  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedPackageId != null) setSelectedPackage(String(preselectedPackageId));
  }, [preselectedPackageId]);

  const selectedPkg = packages.find((p) => String(p.id) === String(selectedPackage));
  const pkgPrice = selectedPkg?.price ?? 0;

  const addons =
    initialAddons ?? {
      voiceoverAI: false,
      talkThrough: false,
      reelSplit: false,
      rush12h: false,
      premiumEdit: false,
      extraReels: 0,
      revisionRounds: 0,
      bundle: null,
    };

  const addonsTotal = computeAddonsTotal(addons);
  const grandTotal = pkgPrice + addonsTotal;

  const addonChips = [];
  if (addons.bundle) addonChips.push(addons.bundle);
  if (addons.voiceoverAI) addonChips.push("Voiceover AI");
  if (addons.talkThrough) addonChips.push("Talk-through");
  if (addons.reelSplit) addonChips.push("Reel Split");
  if (addons.rush12h) addonChips.push("Rush 12h");
  if (addons.premiumEdit) addonChips.push("Premium Edit");
  if (addons.extraReels > 0) addonChips.push(`+${addons.extraReels} extra reel${addons.extraReels > 1 ? "s" : ""}`);
  if (addons.revisionRounds > 0) addonChips.push(`${addons.revisionRounds} revision${addons.revisionRounds > 1 ? "s" : ""}`);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return alert("Please upload at least one photo.");
    if (!selectedPackage) return alert("Please select a package.");

    const filesCount = selectedFiles.length;
    const limits = PACKAGE_LIMITS[selectedPkg?.name];
    if (limits && (filesCount > limits.max)) {  // filesCount < limits.min ||
      alert(`${selectedPkg.name} allows ${limits.min}-${limits.max} photos. You selected ${filesCount}.`);
      setIsSubmitting(false);
      return;
    }


    const userId = user?.id ?? user?.user?.id; 
    if (!userId) return alert("Please sign in again.");

    setIsSubmitting(true);
    try {
      const order = await portalApi.createOrder(userId, selectedPkg.name, addons, selectedFiles);

      onSubmit(order);            
      setSelectedFiles([]);
      setSelectedPackage("");
    } catch (err) {
      console.error("Order submission error:", err);
      alert(err.message || "Order submission failed.");
    } finally {
      setIsSubmitting(false);
    }

  };

  return (
    <Card className={styles.portalCard}>
      <Card.Header as="h4" className={styles.portalCardHeader}>
        Create New Order
      </Card.Header>

      <Card.Body className={styles.portalCardBody}>
        <Form onSubmit={handleSubmit} className={styles.orderForm}>
          <Form.Group className={`mb-4 ${styles.fileUploadGroup}`}>
            <Form.Label className={styles.fileUploadLabel}>Upload Property Photos</Form.Label>
            <Form.Control
              type="file"
              multiple
              onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
              accept="image/*"
              required
              className={styles.fileUploadInput}
            />
            <Form.Text className={styles.fileUploadText}>
              Upload 5–30 high quality photos of your property
            </Form.Text>
            {!!selectedFiles.length && (
              <div className={`mt-2 ${styles.fileUploadInfo}`}>
                <small>{selectedFiles.length} file(s) selected</small>
              </div>
            )}
          </Form.Group>

          {preselectedPackageId ? (
            <div className={`mb-4 ${styles.packageGroup}`}>
              <div className={styles.packageLabel}>Selected Package</div>
              <div className={styles.selectedChip}>
                {selectedPkg?.name} • {selectedPkg?.photos} photos • ${pkgPrice}
              </div>
            </div>
          ) : (
            <Form.Group className={`mb-4 ${styles.packageGroup}`}>
              <Form.Label className={styles.packageLabel}>Select Package</Form.Label>
              <div className={styles.packageOptions}>
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`${styles.packageCard} ${
                      String(selectedPackage) === String(pkg.id) ? styles.selected : ""
                    }`}
                    onClick={() => setSelectedPackage(String(pkg.id))}
                  >
                    <h5 className={styles.packageName}>{pkg.name}</h5>
                    <p className={styles.packagePhotos}>{pkg.photos} photos</p>
                    <p className={styles.price}>${pkg.price}</p>
                  </div>
                ))}
              </div>
            </Form.Group>
          )}

          <div className={`mb-4 ${styles.summaryCard}`}>
            <div className={styles.summaryRow}>
              <span>Package</span>
              <strong>${pkgPrice.toFixed(0)}</strong>
            </div>

            <div className={styles.summaryRow}>
              <span>Add-ons</span>
              <strong>${addonsTotal.toFixed(0)}</strong>
            </div>

            <div className={styles.summaryAddonsList}>
              {addonChips.length ? addonChips.join(" • ") : "No add-ons selected"}
            </div>

            <hr className={styles.summaryDivider} />

            <div className={`${styles.summaryRow} ${styles.summaryGrand}`}>
              <span>Total</span>
              <strong>${grandTotal.toFixed(0)}</strong>
            </div>
          </div>

          <Button
            variant="primary"
            type="submit"
            disabled={!selectedFiles.length || !selectedPackage || isSubmitting || propLoading}
            className={`w-100 ${styles.submitButton}`}
          >
            {isSubmitting || propLoading ? (
              <>
                <Spinner animation="border" size="sm" className={`me-2 ${styles.submitSpinner}`} />
                Processing...
              </>
            ) : (
              "Submit Order"
            )}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

UploadOrder.defaultProps = {
  packages: [
    { id: 1, name: "Starter", photos: "5-10", price: 49 },
    { id: 2, name: "Professional", photos: "11-20", price: 99 },
    { id: 3, name: "Premium", photos: "21-30", price: 149 },
  ],
  isLoading: false,
};

export default UploadOrder;
