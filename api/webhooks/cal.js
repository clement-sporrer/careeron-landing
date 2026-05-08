import { createHmac } from 'crypto'
import { supabase } from '../_db.js'

function verifySignature(rawBody, signature) {
  const secret = process.env.CAL_WEBHOOK_SECRET
  if (!secret) return false
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  return signature === expected
}

export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!process.env.CAL_WEBHOOK_SECRET) {
    console.error('[cal-webhook] missing CAL_WEBHOOK_SECRET')
    return res.status(500).json({ error: 'Webhook secret not configured' })
  }

  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const rawBody = Buffer.concat(chunks).toString()

  const signature = req.headers['x-cal-signature-256'] ?? ''
  if (!verifySignature(rawBody, signature)) {
    return res.status(401).json({ error: 'Invalid signature' })
  }

  let payload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  const { triggerEvent, payload: event } = payload

  if (triggerEvent === 'BOOKING_CREATED') {
    const intentId = event?.metadata?.intent_id
    if (intentId) {
      await supabase
        .from('booking_intents')
        .update({
          cal_booking_uid: event.uid,
          status: 'booked',
          completed_at: new Date().toISOString(),
        })
        .eq('id', intentId)
    }
  }

  if (triggerEvent === 'BOOKING_CANCELLED') {
    const { uid } = event ?? {}
    if (uid) {
      await supabase
        .from('booking_intents')
        .update({ status: 'cancelled' })
        .eq('cal_booking_uid', uid)
    }
  }

  return res.status(200).json({ ok: true })
}
