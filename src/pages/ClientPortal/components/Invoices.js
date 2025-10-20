import React, { useEffect, useRef, useState } from "react";
import { Button, Badge } from "react-bootstrap";
import { gsap } from "gsap";
import styles from "./Invoices.module.css";

// NEW: Helper function to get invoices from localStorage
const getInvoicesFromLocalStorage = () => {
  try {
    const storedInvoices = localStorage.getItem('qt_invoices');
    return storedInvoices ? JSON.parse(storedInvoices) : [];
  } catch (error) {
    console.error('Error reading invoices from localStorage:', error);
    return [];
  }
};

// NEW: Safe ID check function
const isLocalStorageInvoice = (invoice) => {
  return invoice?.id && typeof invoice.id === 'string' && invoice.id.startsWith('local_');
};

// NEW: Safe ID display function
const getDisplayId = (invoice) => {
  if (!invoice?.id) return 'N/A';
  return `#${invoice.id}`;
};

const Invoices = ({ invoices: propInvoices, onBack }) => {
  const containerRef = useRef();
  
  // NEW: State to combine backend invoices with localStorage invoices
  const [allInvoices, setAllInvoices] = useState([]);

  // NEW: Load invoices from localStorage on component mount
  useEffect(() => {
    const localInvoices = getInvoicesFromLocalStorage();
    
    console.log('Backend invoices:', propInvoices);
    console.log('Local invoices:', localInvoices);
    
    // FIXED: Better duplicate detection - only show localStorage invoices if no backend invoices exist
    let combinedInvoices = [];
    
    if (propInvoices && propInvoices.length > 0) {
      // If we have backend invoices, prefer those and ignore localStorage duplicates
      combinedInvoices = [...propInvoices];
      
      // Only add localStorage invoices that don't exist in backend (by matching amount/date)
      localInvoices.forEach(localInv => {
        const isDuplicate = propInvoices.some(backendInv => 
          backendInv.amount === localInv.amount && 
          backendInv.date && localInv.date &&
          Math.abs(new Date(backendInv.date) - new Date(localInv.date)) < 60000 // within 1 minute
        );
        
        if (!isDuplicate) {
          combinedInvoices.push(localInv);
        }
      });
    } else {
      // If no backend invoices, use localStorage ones
      combinedInvoices = [...localInvoices];
    }
    
    // Remove exact duplicates based on ID
    const uniqueInvoices = combinedInvoices.filter((invoice, index, self) => {
      if (!invoice?.id) return index === self.findIndex(i => !i.id); // Keep one invoice without ID
      return index === self.findIndex(i => i.id === invoice.id);
    });
    
    // Sort by date (newest first)
    const sortedInvoices = uniqueInvoices.sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date(0);
      const dateB = b.date ? new Date(b.date) : new Date(0);
      return dateB - dateA;
    });
    
    console.log('Final combined invoices:', sortedInvoices);
    setAllInvoices(sortedInvoices);
  }, [propInvoices]);

  useEffect(() => {
    gsap.set(`.${styles.invoiceRow}`, { opacity: 1, y: 0 }); // ensures visible state
    gsap.from(`.${styles.invoiceRow}`, {
      opacity: 0,
      y: 20,
      stagger: 0.08,
      duration: 0.6,
      ease: "power2.out",
    });
  }, [allInvoices]); // CHANGED: Now depends on allInvoices

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(`.${styles.invoiceCard}`, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power2.out",
      });
      gsap.from(`.${styles.invoiceRow}`, {
        opacity: 0,
        y: 20,
        stagger: 0.08,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.2,
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : "N/A");

  // NEW: Handle download for localStorage invoices
  const handleDownload = (invoice) => {
    if (isLocalStorageInvoice(invoice)) {
      // For localStorage invoices, create a simple text download
      const invoiceText = `
INVOICE ${getDisplayId(invoice)}
Date: ${formatDate(invoice.date)}
Package: ${invoice.package_name || 'N/A'}
Package Price: $${invoice.package_price || 0}
Add-ons Total: $${invoice.addons_total || 0}
Grand Total: $${invoice.amount?.toFixed(2) || '0.00'}
Status: ${invoice.is_paid ? 'Paid' : 'Pending'}
      `.trim();
      
      const blob = new Blob([invoiceText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.id || 'unknown'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // For backend invoices, use existing download logic
      console.log('Download backend invoice:', invoice.id);
      // You might need to adjust this based on your existing download implementation
    }
  };

  // NEW: Clear duplicate localStorage invoices
  const clearLocalInvoices = () => {
    localStorage.removeItem('qt_invoices');
    window.location.reload(); // Refresh to show only backend invoices
  };

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <div className={styles.headerBar}>
        <h2 className={styles.title}>Invoice History</h2>
        
      </div>

      <div className={styles.invoiceCard}>
        <div className={styles.tableHeader}>
          <div>Invoice ID</div>
          <div>Date</div>
          <div>Amount</div>
          <div>Status</div>
          <div>Action</div>
        </div>

        <div className={styles.invoiceList}>
          {allInvoices.map((inv) => (
            <div key={inv.id || `invoice-${Date.now()}-${Math.random()}`} className={styles.invoiceRow}>
              <div>
                {getDisplayId(inv)}
                {isLocalStorageInvoice(inv) && (
                  <span style={{ fontSize: '0.7em', opacity: 0.6, marginLeft: '5px' }}>
                    
                  </span>
                )}
              </div>
              <div>{formatDate(inv.date)}</div>
              <div>${inv.amount?.toFixed(2) || "0.00"}</div>
              <div>
                <Badge
                  className={
                    inv.is_paid
                      ? styles.status_paid
                      : styles.status_pending
                  }
                >
                  {inv.is_paid ? "Paid" : "Pending"}
                </Badge>
              </div>
              <div>
                <Button 
                  className={styles.invoiceDownloadBtn}
                  onClick={() => handleDownload(inv)}
                >
                  Download
                </Button>
              </div>
            </div>
          ))}
          
          {/* NEW: Show message if no invoices */}
          {allInvoices.length === 0 && (
            <div className={styles.noInvoices}>
              No invoices found. Your invoices will appear here after purchase.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Invoices;