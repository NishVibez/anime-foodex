import "server-only";

import Razorpay from "razorpay";
import Stripe from "stripe";

export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe is not configured.");
  return new Stripe(key, {
    appInfo: { name: "Anime FooDex", version: "0.1.0" },
  });
}

export function razorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay is not configured.");
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}
