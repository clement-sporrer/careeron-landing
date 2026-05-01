import { supabase } from './_db.js'
import { notifyTeam } from './_mailer.js'

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, ...rest } = req.body ?? {}
  if (!email) return res.status(400).json({ error: 'email required' })

  const { error } = await supabase
    .from('enterprise_leads')
    .insert({ email, data: rest, source: req.headers.referer ?? 'landing' })

  if (error) {
    console.error('[lead-enterprise] supabase insert:', error)
    return res.status(500).json({ error: 'Failed to save lead' })
  }

  await notifyTeam({
    subject: `[CareerON] New enterprise lead — ${email}`,
    data: { email, ...rest },
  }).catch(err => console.error('[lead-enterprise] resend:', err))

  return res.status(200).json({ ok: true, cal_url: process.env.CAL_ENTERPRISE_URL })
}
