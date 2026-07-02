"use client";

import { ReactNode, useState } from "react";

export default function SafeImage({
  src,
  alt,
  className,
  fallback = null,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  fallback?: ReactNode;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = Boolean(src && failedSrc === src);

  if (!src || failed) {
    return fallback;
  }

  return <img className={className} src={src} alt={alt} onError={() => setFailedSrc(src)} />;
}
