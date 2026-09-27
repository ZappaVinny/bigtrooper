import { apiFetch } from "./client";

// Pet photo uploads. The server authorizes each upload by handing back a
// short-lived presigned URL for Cloudflare R2; the file then goes straight
// from the browser to R2.

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

type UploadInstructions = {
  method: string;
  upload_url: string;
  headers: Record<string, string>;
  key: string;
  expires_in: number;
};

async function errorMessage(res: Response, fallback: string) {
  const data = await res.json().catch(() => ({}));
  return typeof data.error === "string" ? data.error : fallback;
}

/**
 * Resizes and re-encodes a photo as JPEG. Re-encoding drops all EXIF data,
 * including the GPS location phones embed (often the owner's home), which
 * matters because pet photos are shown on the public found-pet page.
 */
export async function prepareImage(file: File): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("That file isn't a supported image. Try a JPG or PNG.");
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser couldn't process this image.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
  );
  if (!blob) throw new Error("Your browser couldn't process this image.");
  if (blob.size > MAX_UPLOAD_BYTES) throw new Error("That photo is too large. Try a smaller one.");
  return blob;
}

/** Uploads a photo for a pet and returns its public URL. */
export async function uploadPetImage(petId: number, file: File): Promise<string> {
  const blob = await prepareImage(file);

  // 1. Ask our server how and where to upload.
  const startRes = await apiFetch(`/pets/${petId}/image/upload-url`, {
    method: "POST",
    body: JSON.stringify({ content_type: blob.type, size: blob.size }),
  });
  if (!startRes.ok) throw new Error(await errorMessage(startRes, "Couldn't start the photo upload."));
  const upload: UploadInstructions = await startRes.json();

  // 2. Send the file straight to R2 using exactly what the server signed.
  const putRes = await fetch(upload.upload_url, {
    method: upload.method,
    headers: upload.headers,
    body: blob,
  });
  if (!putRes.ok) throw new Error("The photo upload failed. Please try again.");

  // 3. Tell our server the upload finished so it can verify and save it.
  const confirmRes = await apiFetch(`/pets/${petId}/image`, {
    method: "PUT",
    body: JSON.stringify({ key: upload.key }),
  });
  if (!confirmRes.ok) throw new Error(await errorMessage(confirmRes, "Couldn't save the photo."));
  const { image_url } = await confirmRes.json();
  return image_url;
}
