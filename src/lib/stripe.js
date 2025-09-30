import { loadStripe } from "@stripe/stripe-js";

let stripePromise;
export function getStripe() {
  if (!stripePromise) {
    const pk = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
    console.log("PK from env:", process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
    if (!pk) throw new Error("Missing REACT_APP_STRIPE_PUBLISHABLE_KEY");
    stripePromise = loadStripe(pk);
  }
  return stripePromise;
}
