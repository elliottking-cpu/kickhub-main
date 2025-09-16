// src/lib/security/csrf-protection.ts - CSRF Protection for Route Security
import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomBytes } from 'crypto'

export class CSRFProtection {
  private static readonly TOKEN_LENGTH = 32
  private static readonly COOKIE_NAME = 'csrf-token'
  private static readonly HEADER_NAME = 'x-csrf-token'
  private static readonly FORM_FIELD_NAME = '_csrf'

  /**
   * Generate a new CSRF token
   */
  static generateToken(): string {
    return randomBytes(this.TOKEN_LENGTH).toString('hex')
  }

  /**
   * Validate CSRF token from request
   */
  static validateToken(request: NextRequest): boolean {
    try {
      // Get token from header or form data
      const headerToken = request.headers.get(this.HEADER_NAME)
      const cookieToken = request.cookies.get(this.COOKIE_NAME)?.value

      if (!headerToken || !cookieToken) {
        return false
      }

      // Constant-time comparison to prevent timing attacks
      return this.constantTimeEquals(headerToken, cookieToken)
    } catch (error) {
      console.error('CSRF validation error:', error)
      return false
    }
  }

  /**
   * Add CSRF token to response
   */
  static addTokenToResponse(response: NextResponse, token?: string): NextResponse {
    const csrfToken = token || this.generateToken()
    
    response.cookies.set(this.COOKIE_NAME, csrfToken, {
      httpOnly: false, // Allow JavaScript access for AJAX requests
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    })

    // Also add to headers for client-side access
    response.headers.set('X-CSRF-Token', csrfToken)
    
    return response
  }

  /**
   * Check if request method requires CSRF protection
   */
  static requiresProtection(method: string): boolean {
    const protectedMethods = ['POST', 'PUT', 'PATCH', 'DELETE']
    return protectedMethods.includes(method.toUpperCase())
  }

  /**
   * Check if path should be excluded from CSRF protection
   */
  static isExcludedPath(pathname: string): boolean {
    const excludedPaths = [
      '/api/auth/', // Supabase auth endpoints
      '/api/webhooks/', // Webhook endpoints
      '/api/public/', // Public API endpoints
    ]
    
    return excludedPaths.some(path => pathname.startsWith(path))
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  private static constantTimeEquals(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false
    }

    let result = 0
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }

    return result === 0
  }

  /**
   * Create CSRF token hash for additional security
   */
  static createTokenHash(token: string, secret: string): string {
    return createHash('sha256')
      .update(token + secret)
      .digest('hex')
  }
}

/**
 * Middleware helper for CSRF protection
 */
export function withCSRFProtection(request: NextRequest, response: NextResponse): NextResponse {
  const { method, nextUrl: { pathname } } = request

  // Skip CSRF for excluded paths
  if (CSRFProtection.isExcludedPath(pathname)) {
    return response
  }

  // Generate token for GET requests (setup)
  if (method === 'GET') {
    return CSRFProtection.addTokenToResponse(response)
  }

  // Validate token for protected methods
  if (CSRFProtection.requiresProtection(method)) {
    if (!CSRFProtection.validateToken(request)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }
  }

  return response
}
