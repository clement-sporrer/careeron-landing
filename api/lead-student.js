import { supabase } from './_db.js'
import { notifyTeam } from './_mailer.js'
import { emailIsValid, enforceOrigin, enforceRateLimit, honeypotTriggered } from './_request.js'

export default async function handler(req, res) {
  if (!enforceOrigin(req, res)) return
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!enforceRateLimit(req, res, 'lead-student')) return

  const { email, ...rest } = req.body ?? {}
  if (honeypotTriggered(req.body)) return res.status(200).json({ ok: true })
  if (!email) return res.status(400).json({ error: 'email required' })
  if (!emailIsValid(email)) return res.status(400).json({ error: 'invalid email' })

  const { error } = await supabase
    .from('student_leads')
    .insert({ email, data: rest, source: req.headers.referer ?? 'landing' })

  if (error) {
    console.error('[lead-student] supabase insert:', error)
    return res.status(500).json({ error: 'Failed to save lead' })
  }

  await notifyTeam({
    subject: `[CareerON] New student lead — ${email}`,
    data: { email, ...rest },
  }).catch(err => console.error('[lead-student] resend:', err))

  return res.status(200).json({ ok: true })
}
