import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, context, timestamp, url, userAgent } = await request.json()

    console.error(`[ERROR] ${message}`, {
      context,
      timestamp,
      url,
      userAgent
    })

    return NextResponse.json({ id: `error-${Date.now()}` })
  } catch (error) {
    console.error('Error tracking failed:', error)
    return NextResponse.json(
      { error: 'Failed to track error' },
      { status: 500 }
    )
  }
}
