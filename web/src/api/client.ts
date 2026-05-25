const BASE_URL = import.meta.env.VITE_API_URL

type FetchOptions = RequestInit & { headers?: Record<string, string> }

export async function apiFetch(path: string, options: FetchOptions = {}): Promise<Response> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
  return res
}
