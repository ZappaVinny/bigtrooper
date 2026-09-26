// =============================================================================
// !FOUNDPET! — FOUND-PET (QR SCAN) PAGE BACKEND HOOK-UP
// =============================================================================
//
// The public page at /found/:code (what a pet's QR tag links to) uses the two
// functions below. Both are STUBS right now:
//   - In dev (`npm run dev`) they return sample data / pretend to succeed so
//     the page can be built and tried.
//   - In a production build they FAIL, so a finder is never told the owner
//     was notified when nothing was actually sent.
//
// To implement (both endpoints are public, no login):
//
//   1. GET /api/found/:code
//      Look the pet up with the existing sqlc query `GetPetByCode`. Return 404
//      if there's no match OR the pet is not `active` (a paused tag should
//      read as "not active" to the finder). Respond with ONLY what a finder
//      should see, never owner details:
//        { "name": "Trooper", "type": "Dog", "age": 4,
//          "description": "...", "image_url": null }
//
//   2. POST /api/found/:code/report
//      Body:
//        { "email": "finder@example.com" | null,
//          "phone_number": "+15555550123" | null,
//          "location": { "lat": 39.74, "lng": -104.99 } | null }
//      At least one of email / phone_number is present (the page enforces
//      this). Location is already rounded to ~1 km on the client and is only
//      sent if the finder opted in. Store the report and notify the owner
//      according to their preferences (email / sms). Respond 201.
//      Consider rate-limiting by IP + code, since this endpoint is public.
//
//   Then replace each stub body with a real apiFetch call (examples inline).
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
  phone_number: string | null;
  location: { lat: number; lng: number } | null;
};

export class FoundPetNotFoundError extends Error {
  constructor() {
    super("No active pet for this tag.");
    this.name = "FoundPetNotFoundError";
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Loads the public profile for a tag code. Throws FoundPetNotFoundError on 404. */
export async function getFoundPet(code: string): Promise<FoundPet> {
  // !FOUNDPET! STUB. Replace with:
  //   const res = await apiFetch(`/found/${encodeURIComponent(code)}`);
  //   if (res.status === 404) throw new FoundPetNotFoundError();
  //   if (!res.ok) throw new Error(`HTTP ${res.status}`);
  //   return res.json();
  void apiFetch;
  await wait(400);
  if (!import.meta.env.DEV || !code) throw new FoundPetNotFoundError();
  return {
    name: "Trooper",
    type: "Dog",
    age: 4,
    description:
      "Curious nose, amber eyes. Friendly but a little shy with strangers. Offer him a treat and he's yours forever.",
    image_url: null,
  };
}

/** Sends the finder's report to the owner. */
export async function reportFound(code: string, report: FoundReport): Promise<void> {
  // !FOUNDPET! STUB. Replace with:
  //   const res = await apiFetch(`/found/${encodeURIComponent(code)}/report`, {
  //     method: "POST",
  //     body: JSON.stringify(report),
  //   });
  //   if (!res.ok) throw new Error(`HTTP ${res.status}`);
  void code;
  void report;
  await wait(1500);
  if (!import.meta.env.DEV) throw new Error("Found-pet reports are not implemented yet.");
}
