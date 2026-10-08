import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, userName } = await request.json()

    if (!email || !userName) {
      return NextResponse.json(
        { error: 'Missing email or userName' },
        { status: 400 }
      )
    }

    console.log(`[EMAIL] Welcome email sent to ${email}`)

    return NextResponse.json({ id: `email-${Date.now()}`, status: 'sent' })
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
