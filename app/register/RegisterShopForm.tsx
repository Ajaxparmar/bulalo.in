"use client";

import { FormEvent, useState } from "react";
import { useFormStatus } from "react-dom";
import { registerOwnerAction } from "@/app/register/actions";
import RegistrationSelections from "@/app/register/RegistrationSelections";

type Plan = {
  id: string;
  name: string;
  durationMonths: number;
  pricePaise: number;
};

type Category = {
  id: string;
  name: string;
};

function RegisterButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="primary-button" disabled={pending} aria-busy={pending}>
      {pending ? (
        <span className="register-submit-loading">
          <i className="fas fa-circle-notch fa-spin" aria-hidden="true" />
          Saving your shop...
        </span>
      ) : (
        "Save details and continue to payment"
      )}
    </button>
  );
}

export default function RegisterShopForm({
  plans,
  categories,
}: {
  plans: Plan[];
  categories: Category[];
}) {
  const [clientError, setClientError] = useState("");

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const formData = new FormData(form);
    const phoneInput = String(formData.get("phone") || "");
    const phone = phoneInput.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
    const pincode = String(formData.get("pincode") || "").trim();

    if (!/^[6-9]\d{9}$/.test(phone)) {
      event.preventDefault();
      setClientError("Enter a valid 10-digit Indian mobile number.");
      form.querySelector<HTMLInputElement>('[name="phone"]')?.focus();
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      event.preventDefault();
      setClientError("Enter a valid 6-digit pincode.");
      form.querySelector<HTMLInputElement>('[name="pincode"]')?.focus();
      return;
    }

    setClientError("");
  }

  return (
    <form action={registerOwnerAction} className="stack-form" onSubmit={validateBeforeSubmit}>
      {clientError ? <p className="form-error" role="alert">{clientError}</p> : null}

      <RegistrationSelections plans={plans} categories={categories} />

      <div className="form-grid">
        <label>
          Owner name
          <input name="name" autoComplete="name" required />
        </label>
        <label>
          Phone number
          <input
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="9876543210"
            required
          />
        </label>
        <label>
          Email
          <input name="email" type="email" autoComplete="email" />
        </label>
        <label>
          Password
          <input name="password" type="password" autoComplete="new-password" required minLength={6} />
        </label>
        <label>
          Shop name
          <input name="businessName" required />
        </label>
        <label>
          Shop phone
          <input name="businessPhone" type="tel" inputMode="tel" placeholder="9876543210" required />
        </label>
        <label className="full">
          Address
          <textarea name="address" required rows={3} />
        </label>
        <label>
          City
          <input name="city" required />
        </label>
        <label>
          State
          <input name="state" required />
        </label>
        <label>
          Pincode
          <input
            name="pincode"
            inputMode="numeric"
            maxLength={6}
            required
          />
        </label>
      </div>

      <RegisterButton />
    </form>
  );
}
