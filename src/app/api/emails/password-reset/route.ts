import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, resetLink } = await request.json()

    if (!email || !resetLink) {
      return NextResponse.json(
        { error: 'Missing email or resetLink' },
        { status: 400 }
      )
    }

    console.log(`[EMAIL] Password reset sent to ${email}`)

    return NextResponse.json({ id: `email-${Date.now()}`, status: 'sent' })
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
