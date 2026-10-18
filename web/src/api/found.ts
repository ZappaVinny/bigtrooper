// =============================================================================
// !FOUNDPET! — FOUND-PET (QR SCAN) PAGE
// =============================================================================
//
// The public page at /found/:code (what a pet's QR tag links to) calls the
// API routes in api/internal/handlers/found.go. Both are public and
// rate-limited per IP.
//
//   GET  /api/found/:code         IMPLEMENTED. Finder-safe profile
//                                 { name, type, age, description, image_url }.
//                                 404 when the code is unknown or the tag is paused.
//
//   POST /api/found/:code         IMPLEMENTED. Stores the finder's report and
//                                 notifies the owner per their preferences.
//                                 200 { message: "report received" }. 404 when the
//                                 tag is unknown or paused, 400 on a bad body,
//                                 429 when rate-limited.
// =============================================================================

import { apiFetch } from "./client";

export type FoundPet = {
  name: string;
  type: string;
  age: number;
  description: string;
  image_url?: string | null;
};

export type FoundReport = {
  email: string | null;
  phone: string | null;
  location: { lat: number; lng: number } | null;
};

export class FoundPetNotFoundError extends Error {
  constructor() {
    super("No active pet for this tag.");
    this.name = "FoundPetNotFoundError";
  }
}

/** Loads the public profile for a tag code. Throws FoundPetNotFoundError on 404. */
export async function getFoundPet(code: string): Promise<FoundPet> {
  const res = await apiFetch(`/found/${encodeURIComponent(code)}`);
  if (res.status === 404) throw new FoundPetNotFoundError();
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export class ReportFoundError extends Error {
  status: number;
  constructor(status: number) {
    super(`HTTP ${status}`);
    this.name = "ReportFoundError";
    this.status = status;
  }
}

/** Sends the finder's report to the owner. Throws ReportFoundError on a non-2xx. */
export async function reportFound(code: string, report: FoundReport): Promise<void> {
  const res = await apiFetch(`/found/${encodeURIComponent(code)}`, {
    method: "POST",
    body: JSON.stringify(report),
  });
  if (!res.ok) throw new ReportFoundError(res.status);
}
