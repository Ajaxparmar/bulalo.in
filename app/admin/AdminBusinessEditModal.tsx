"use client";

import { useState } from "react";
import ImageUploadField from "@/app/admin/ImageUploadField";
import { updateBusinessAction } from "@/app/admin/actions";

type BusinessStatus = "PENDING_PAYMENT" | "PENDING_REVIEW" | "ACTIVE" | "SUSPENDED" | "REJECTED";

type AdminBusiness = {
  id: string;
  name: string;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  status: BusinessStatus;
  isTopListing: boolean | null;
};

const businessStatuses: BusinessStatus[] = ["PENDING_PAYMENT", "PENDING_REVIEW", "ACTIVE", "SUSPENDED", "REJECTED"];

export default function AdminBusinessEditModal({ business }: { business: AdminBusiness }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" className="admin-edit-button" onClick={() => setIsOpen(true)}>
        Edit
      </button>
      {isOpen ? (
        <div className="admin-modal-backdrop" role="presentation">
          <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby={`edit-business-${business.id}`}>
            <div className="admin-modal-header">
              <div>
                <span>Edit business</span>
                <h3 id={`edit-business-${business.id}`}>{business.name}</h3>
              </div>
              <button type="button" className="admin-modal-close" onClick={() => setIsOpen(false)} aria-label="Close edit popup">
                <i className="fas fa-times" />
              </button>
            </div>
            <form id={`business-${business.id}`} action={updateBusinessAction} className="stack-form compact">
              <input type="hidden" name="businessId" value={business.id} />
              <div className="form-grid">
                <label>
                  Shop name
                  <input name="name" defaultValue={business.name} required />
                </label>
                <label>
                  Phone
                  <input name="phone" type="tel" defaultValue={business.phone} required />
                </label>
                <label>
                  WhatsApp
                  <input name="whatsapp" type="tel" defaultValue={business.whatsapp || ""} />
                </label>
                <label>
                  Email
                  <input name="email" type="email" defaultValue={business.email || ""} />
                </label>
                <label>
                  Website
                  <input name="website" type="url" defaultValue={business.website || ""} />
                </label>
                <label>
                  City
                  <input name="city" defaultValue={business.city} required />
                </label>
                <label>
                  State
                  <input name="state" defaultValue={business.state} required />
                </label>
                <label>
                  Pincode
                  <input name="pincode" defaultValue={business.pincode} required maxLength={6} />
                </label>
                <label>
                  Status
                  <select name="status" defaultValue={business.status}>
                    {businessStatuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
                  </select>
                </label>
                <label>
                  Listing type
                  <select name="isTopListing" defaultValue={String(business.isTopListing)}>
                    <option value="true">Featured</option>
                    <option value="false">Standard</option>
                  </select>
                </label>
                <label className="full">
                  Address
                  <textarea name="address" defaultValue={business.address} required rows={3} />
                </label>
                <label className="full">
                  Description
                  <textarea name="description" defaultValue={business.description || ""} rows={4} />
                </label>
                <ImageUploadField label="Logo image" name="logo" required={false} currentImageUrl={business.logoUrl || ""} />
                <ImageUploadField label="Cover image" name="cover" required={false} currentImageUrl={business.coverUrl || ""} />
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="secondary-button" onClick={() => setIsOpen(false)}>Cancel</button>
                <button type="submit" className="primary-button" data-confirm-message={`Update ${business.name}?`}>
                  Save business
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
