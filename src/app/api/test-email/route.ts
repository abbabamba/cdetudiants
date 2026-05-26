import { sendEmail } from '@/lib/email'
import { NextResponse } from 'next/server'

export async function GET() {
  const result = await sendEmail({
    to: process.env.ADMIN_EMAIL!,
    subject: 'Test Nodemailer ✓',
    html: '<h2>Nodemailer fonctionne !</h2><p>Configuration Gmail OK.</p>',
  })
  return NextResponse.json(result)
}
