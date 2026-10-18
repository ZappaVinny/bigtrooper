import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// `npm run dev:https` serves the app over HTTPS on your LAN (self-signed cert)
// so phones can test browser features that need a secure page, like location.
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === 'https' ? [basicSsl()] : [])],
  envDir: '../',
  server: {
    // With VITE_API_URL=/api, API calls go through the dev server, so the page
    // and API share one origin on any device (no CORS, no mixed content).
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        // Requests arrive same-origin; drop Origin so the API's CORS check
        // doesn't reject LAN or HTTPS dev origins it doesn't list.
        configure: (proxy) => {
          proxy.on('proxyReq', (req) => req.removeHeader('origin'))
        },
      },
    },
  },
}))
