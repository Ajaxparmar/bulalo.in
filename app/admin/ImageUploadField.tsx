"use client";

import { ChangeEvent, useEffect, useState } from "react";

export default function ImageUploadField({ label }: { label: string }) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setPreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }

      return file ? URL.createObjectURL(file) : "";
    });
  }

  return (
    <label>
      {label}
      <input
        name="image"
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        required
        onChange={handleChange}
      />
      <small className="admin-field-help">JPG, PNG, GIF, or WebP. Maximum 5 MB.</small>
      {previewUrl ? (
        <span className="admin-image-preview">
          <img src={previewUrl} alt="Selected image preview" />
        </span>
      ) : null}
    </label>
  );
}
