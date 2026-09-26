// =============================================================================
// !QRTAG! — TAG GENERATION BACKEND HOOK-UP
// =============================================================================
//
// Everything the "Tag" modal needs from the backend goes through
// `generateTag()` below. Right now it's a STUB: it waits 5 seconds (to mimic a
// slow request) and then always fails, so the UI shows its error state.
//
// To implement:
//   1. Add an endpoint, e.g. POST /api/pets/:id/tag, that takes
//        { "size": "small" | "medium" | "large",
//          "include_name": boolean,
//          "format": "stl" | "3mf" }
//      and responds with the 3D model file (Content-Type
//      application/octet-stream / model/stl / model/3mf). The QR code on the
//      tag should encode the pet's public URL, built from `pets.code`.
//   2. Replace the stub body with a real request, keeping the `signal` so the
//      user can cancel, e.g.:
//
//        const res = await apiFetch(`/pets/${petId}/tag`, {
//          method: "POST",
//          body: JSON.stringify({
//            size: options.size,
//            include_name: options.includeName,
//            format: options.format,
//          }),
//          signal,
//        });
//        if (!res.ok) throw new TagGenerationError(res.status);
//        return await res.blob();
//
//      Note: apiFetch creates its own AbortController, so either let it accept
//      a caller signal or wire `signal` to its `.abort()`.
//   3. Generation can take several seconds. The modal already shows a clear
//      "Generating…" state for as long as this promise is pending, supports
//      cancel, and downloads the returned Blob on success, so no UI changes
//      should be needed.
//   4. Sample renders for each size live in TAG_SIZES in
//      src/components/TagModal.tsx (search !QRTAG! there too).
// =============================================================================

export type TagSize = "small" | "medium" | "large";
export type TagFormat = "stl" | "3mf";

export type TagOptions = {
  size: TagSize;
  includeName: boolean;
  format: TagFormat;
};

export class TagGenerationError extends Error {
  status?: number;
  constructor(status?: number) {
    super("Tag generation is not available right now.");
    this.name = "TagGenerationError";
    this.status = status;
  }
}

/** Resolves with the generated 3D model file. See !QRTAG! above. */
export async function generateTag(
  petId: number,
  options: TagOptions,
  signal?: AbortSignal,
): Promise<Blob> {
  // !QRTAG! STUB: replace with the real request (see the comment at the top).
  void petId;
  void options;
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, 5000);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
  throw new TagGenerationError(503);
}
