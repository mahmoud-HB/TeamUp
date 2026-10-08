import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, subject, content } = await request.json()

    if (!email || !subject || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log(`[EMAIL] Notification sent to ${email}: ${subject}`)

    return NextResponse.json({ id: `email-${Date.now()}`, status: 'sent' })
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
