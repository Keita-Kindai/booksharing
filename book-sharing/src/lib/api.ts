export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

export function apiUrl(path: string, params?: Record<string, string>): string {
    if (!API_BASE_URL) {
        throw new Error('VITE_API_URL is not set')
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    const url = new URL(`${API_BASE_URL}${normalizedPath}`)

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.set(key, value)
        })
    }

    return url.toString()
}
