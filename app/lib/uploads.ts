import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const imageExtensions: Record<string, string> = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function saveUploadedImage(entry: FormDataEntryValue | null, folder: string) {
  if (!(entry instanceof File) || entry.size === 0) {
    throw new Error("Please select an image to upload");
  }

  const extension = imageExtensions[entry.type];

  if (!extension) {
    throw new Error("Only JPG, PNG, GIF, and WebP images are allowed");
  }

  if (entry.size > MAX_IMAGE_SIZE) {
    throw new Error("Image must be smaller than 5 MB");
  }

  const uploadDirectory = path.join(process.cwd(), "public", "uploads", folder);
  const filename = `${Date.now()}-${randomUUID()}.${extension}`;

  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, filename), Buffer.from(await entry.arrayBuffer()));

  return `/uploads/${folder}/${filename}`;
}

export async function optionalUploadedImage(entry: FormDataEntryValue | null, folder: string) {
  if (!(entry instanceof File) || entry.size === 0) {
    return null;
  }

  return saveUploadedImage(entry, folder);
}
