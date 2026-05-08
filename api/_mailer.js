import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM
const TO = process.env.RESEND_NOTIFY_TO?.split(',').map(e => e.trim()) ?? []

function escapeHtml(value) {
  return String(value ?? '—')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export async function notifyTeam({ subject, data }) {
  const rows = Object.entries(data)
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666;font-size:13px">${escapeHtml(k)}</td><td style="padding:4px 0;font-size:13px">${escapeHtml(v)}</td></tr>`)
    .join('')

  await resend.emails.send({
    from: FROM,
    to: TO,
    subject,
    html: `<table style="font-family:sans-serif">${rows}</table>`,
  })
}
