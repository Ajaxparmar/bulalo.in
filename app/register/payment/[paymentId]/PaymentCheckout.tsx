"use client";

import { useState } from "react";

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name?: string | null; email?: string | null; contact?: string };
  handler: (response: RazorpayResponse) => Promise<void>;
  modal: { ondismiss: () => void; confirm_close?: boolean };
  theme: { color: string };
};

type RazorpayFailure = {
  error?: {
    code?: string;
    description?: string;
    reason?: string;
  };
};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: "payment.failed", handler: (response: RazorpayFailure) => void) => void;
    };
  }
}

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PaymentCheckout({ paymentId }: { paymentId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function openCheckout() {
    setLoading(true);
    setError("");

    try {
      const loaded = await loadRazorpay();

      if (!loaded) {
        setError("Unable to load Razorpay checkout. Please check your connection and try again.");
        setLoading(false);
        return;
      }

      const orderResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });
      const order = await orderResponse.json();

      if (!orderResponse.ok) {
        setError(order.error || "Unable to begin payment.");
        setLoading(false);
        return;
      }

      const checkout = new window.Razorpay({
        key: order.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: order.amount,
        currency: order.currency,
        name: "Bulalo.in",
        description: `${order.planName} for ${order.businessName}`,
        order_id: order.order_id || order.orderId,
        prefill: {
          name: order.ownerName,
          email: order.ownerEmail,
          contact: order.ownerPhone,
        },
        handler: async (response) => {
          try {
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId, ...response }),
            });
            const result = await verifyResponse.json();

            if (!verifyResponse.ok) {
              setError(result.error || "Payment verification failed.");
              setLoading(false);
              return;
            }

            window.location.href = "/register/success";
          } catch {
            setError("Payment completed, but verification could not be reached. Please retry or contact support.");
            setLoading(false);
          }
        },
        modal: {
          confirm_close: true,
          ondismiss: () => {
            setLoading(false);
            setError("Payment was cancelled. Your account and shop details are saved; you can continue anytime.");
          },
        },
        theme: { color: "#f97316" },
      });

      checkout.on("payment.failed", (response) => {
        setLoading(false);
        setError(
          response.error?.description
            || response.error?.reason
            || "Payment failed. Please try another payment method.",
        );
      });

      checkout.open();
    } catch {
      setError("Unable to start payment. Please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <>
      {error ? <p className="form-error">{error}</p> : null}
      <button type="button" className="primary-button" onClick={openCheckout} disabled={loading}>
        {loading ? "Opening secure payment..." : "Pay securely with Razorpay"}
      </button>
    </>
  );
}
