const BASE_URL = import.meta.env.VITE_API_URL;

type FetchOptions = Omit<RequestInit, "headers"> & { headers?: Record<string, string> };
type AbortableResponse = Promise<Response> & { abort: () => void };

export function apiFetch(path: string, options: FetchOptions = {}): AbortableResponse {
  const controller = new AbortController();
  const promise = fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
    signal: controller.signal,
  }) as AbortableResponse;
  promise.abort = () => controller.abort();
  return promise;
}
