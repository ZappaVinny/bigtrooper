import { apiFetch } from "./client";

// Pet tags (3D models). The server generates them through the QR service,
// stores them in R2 and hands back one download URL per variant.

export type TagVariant = "color" | "plain";
export type PetTag = { variant: TagVariant; url: string };

export class TagGenerationError extends Error {
  status?: number;
  constructor(status?: number) {
    super("Tag generation is not available right now.");
    this.name = "TagGenerationError";
    this.status = status;
  }
}

async function tagsRequest(path: string, method: string, signal?: AbortSignal): Promise<PetTag[]> {
  const req = apiFetch(path, { method });
  signal?.addEventListener("abort", () => req.abort());
  const res = await req;
  if (!res.ok) throw new TagGenerationError(res.status);
  const data: { tags: PetTag[] } = await res.json();
  return data.tags;
}

export function listTags(petId: number, signal?: AbortSignal): Promise<PetTag[]> {
  return tagsRequest(`/pets/${petId}/tags`, "GET", signal);
}

/** Generates the tags, or returns the existing ones. Takes ~15 seconds when generating. */
export function generateTags(petId: number, signal?: AbortSignal): Promise<PetTag[]> {
  return tagsRequest(`/pets/${petId}/tags`, "POST", signal);
}
