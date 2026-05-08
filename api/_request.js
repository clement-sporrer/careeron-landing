const WINDOW_MS = 60_000
const MAX_REQUESTS_PER_WINDOW = 8
const rateLimitStore = new Map()

function getClientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.headers['x-real-ip']
    || req.socket?.remoteAddress
    || 'unknown'
}

function getAllowedOrigins(req) {
  const configured = process.env.ALLOWED_ORIGINS
    ?.split(',')
    .map(value => value.trim())
    .filter(Boolean)

  if (configured?.length) return configured

  const host = req.headers.host
  if (!host) return []
  const protocol = host.includes('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https'
  return [`${protocol}://${host}`]
}

export function enforceOrigin(req, res) {
  const origin = req.headers.origin
  if (!origin) return true
  const allowedOrigins = getAllowedOrigins(req)
  if (!allowedOrigins.includes(origin)) {
    res.status(403).json({ error: 'Origin not allowed' })
    return false
  }
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Vary', 'Origin')
  return true
}

export function enforceRateLimit(req, res, scope) {
  const now = Date.now()
  const key = `${scope}:${getClientIp(req)}`
  const entry = rateLimitStore.get(key)

  if (!entry || now - entry.startedAt > WINDOW_MS) {
    rateLimitStore.set(key, { count: 1, startedAt: now })
    return true
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    res.status(429).json({ error: 'Too many requests. Try again shortly.' })
    return false
  }

  entry.count += 1
  return true
}

export function emailIsValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function honeypotTriggered(payload) {
  return Boolean(payload?.website)
}
