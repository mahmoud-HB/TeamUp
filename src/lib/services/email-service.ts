import { isDemoMode } from '@/lib/config'

export interface EmailResult {
  ok: true
  messageId: string
}

export interface EmailError {
  ok: false
  error: string
  code: string
}

/**
 * Email service for transactional emails.
 * Integrates with Resend, SendGrid, or similar service.
 * Demo mode: logs to console.
 */

export const emailService = {
  /**
   * Send password reset email
   */
  async sendPasswordReset(
    email: string,
    resetLink: string
  ): Promise<EmailResult | EmailError> {
    if (isDemoMode()) {
      console.log('[DEMO] Password reset email to', email, resetLink)
      return { ok: true, messageId: `demo-${Date.now()}` }
    }

    try {
      // In production, call Resend API or similar
      const response = await fetch('/api/emails/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetLink })
      })

      if (!response.ok) {
        return {
          ok: false,
          error: 'Failed to send email',
          code: 'EMAIL_FAILED'
        }
      }

      const data = (await response.json()) as { id?: string }
      return {
        ok: true,
        messageId: data.id || 'sent'
      }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'EMAIL_ERROR'
      }
    }
  },

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(
    email: string,
    userName: string
  ): Promise<EmailResult | EmailError> {
    if (isDemoMode()) {
      console.log('[DEMO] Welcome email to', email, 'for', userName)
      return { ok: true, messageId: `demo-${Date.now()}` }
    }

    try {
      const response = await fetch('/api/emails/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, userName })
      })

      if (!response.ok) {
        return {
          ok: false,
          error: 'Failed to send email',
          code: 'EMAIL_FAILED'
        }
      }

      const data = (await response.json()) as { id?: string }
      return {
        ok: true,
        messageId: data.id || 'sent'
      }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'EMAIL_ERROR'
      }
    }
  },

  /**
   * Send notification email
   */
  async sendNotificationEmail(
    email: string,
    subject: string,
    content: string
  ): Promise<EmailResult | EmailError> {
    if (isDemoMode()) {
      console.log('[DEMO] Notification email to', email, subject)
      return { ok: true, messageId: `demo-${Date.now()}` }
    }

    try {
      const response = await fetch('/api/emails/notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subject, content })
      })

      if (!response.ok) {
        return {
          ok: false,
          error: 'Failed to send email',
          code: 'EMAIL_FAILED'
        }
      }

      const data = (await response.json()) as { id?: string }
      return {
        ok: true,
        messageId: data.id || 'sent'
      }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'EMAIL_ERROR'
      }
    }
  }
}
