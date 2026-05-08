import { supabase } from './_db.js'
import { emailIsValid, enforceOrigin, enforceRateLimit, honeypotTriggered } from './_request.js'

const CAL_URLS = {
  enterprise: process.env.CAL_ENTERPRISE_URL,
  founders: process.env.CAL_FOUNDERS_URL,
}

export default async function handler(req, res) {
  if (!enforceOrigin(req, res)) return
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!enforceRateLimit(req, res, 'booking-intent')) return

  const { email, school, role, meeting_type } = req.body ?? {}
  if (honeypotTriggered(req.body)) return res.status(200).json({ ok: true })

  if (!meeting_type || !CAL_URLS[meeting_type]) {
    return res.status(400).json({ error: 'invalid meeting_type' })
  }
  if (email && !emailIsValid(email)) {
    return res.status(400).json({ error: 'invalid email' })
  }

  // Store even if email missing — we still want partial data
  const { data: row, error } = await supabase
    .from('booking_intents')
    .insert({ email: email || null, school: school || null, role: role || null, meeting_type })
    .select('id')
    .single()

  if (error) {
    console.error('[booking-intent] supabase insert:', error)
    return res.status(500).json({ error: 'Failed to save intent' })
  }

  // Pass intent id as metadata to Cal so the webhook can link back
  const cal_url = `${CAL_URLS[meeting_type]}?metadata[intent_id]=${row.id}`

  return res.status(200).json({ ok: true, cal_url })
}
