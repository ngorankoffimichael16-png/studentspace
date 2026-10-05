const configuredApiUrl = import.meta.env.VITE_API_URL
const apiBaseUrl = (
  configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:3000' : '')
).replace(/\/$/, '')

if (!apiBaseUrl) {
  throw new Error('VITE_API_URL doit être définie pour contacter le backend.')
}

export function apiUrl(path) {
  return `${apiBaseUrl}${path}`
}
