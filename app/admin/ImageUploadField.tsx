"use client";

import { ChangeEvent, useEffect, useState } from "react";

const MAX_IMAGE_SIZE = 3 * 1024 * 1024;

export default function ImageUploadField({
  label,
  name = "image",
  required = true,
  currentImageUrl = "",
  deleteName,
}: {
  label: string;
  name?: string;
  required?: boolean;
  currentImageUrl?: string;
  deleteName?: string;
}) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [failedCurrentImageUrl, setFailedCurrentImageUrl] = useState<string | null>(null);
  const currentImageFailed = Boolean(currentImageUrl && failedCurrentImageUrl === currentImageUrl);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file && file.size > MAX_IMAGE_SIZE) {
      event.target.value = "";
      setError("Image size is too large. Maximum allowed size is 3 MB.");
      setPreviewUrl((currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl);
        }

        return "";
      });
      return;
    }

    setError("");

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
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        required={required}
        onChange={handleChange}
      />
      <small className="admin-field-help">JPG, PNG, GIF, or WebP. Maximum 3 MB.</small>
      {error ? <small className="form-error image-upload-error">{error}</small> : null}
      {previewUrl ? (
        <span className="admin-image-preview">
          <img src={previewUrl} alt="Selected image preview" />
        </span>
      ) : currentImageUrl ? (
        <>
          {currentImageFailed ? (
            <span className="admin-image-missing">Saved image file is missing. Upload a new image or delete this saved image.</span>
          ) : (
            <span className="admin-image-preview">
              <img src={currentImageUrl} alt="Current image" onError={() => setFailedCurrentImageUrl(currentImageUrl)} />
            </span>
          )}
          {deleteName ? (
            <span className="image-delete-option">
              <input type="checkbox" name={deleteName} value="true" />
              Delete current image
            </span>
          ) : null}
        </>
      ) : null}
    </label>
  );
}
