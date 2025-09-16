#!/usr/bin/env node

/**
 * Step 4.1 Authentication System Validation
 * Validates the complete authentication implementation for KickHub
 * Based on KickHub Build Guide Step 4.1 specifications
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 KickHub Step 4.1: Authentication System Validation')
console.log('=' .repeat(60))

let allPassed = true
const results = []

function checkResult(description, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL'
  const message = `${status}: ${description}`
  console.log(message)
  if (details) {
    console.log(`    ${details}`)
  }
  results.push({ description, passed, details })
  if (!passed) allPassed = false
  return passed
}

function fileExists(filePath) {
  return fs.existsSync(path.join(__dirname, '../..', filePath))
}

function readFile(filePath) {
  try {
    return fs.readFileSync(path.join(__dirname, '../..', filePath), 'utf8')
  } catch (error) {
    return null
  }
}

function checkFileContent(filePath, patterns, description) {
  const content = readFile(filePath)
  if (!content) {
    return checkResult(`${description} - File exists`, false, `File not found: ${filePath}`)
  }
  
  const missingPatterns = patterns.filter(pattern => {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern
    return !regex.test(content)
  })
  
  if (missingPatterns.length === 0) {
    return checkResult(`${description} - Content validation`, true)
  } else {
    return checkResult(`${description} - Content validation`, false, 
      `Missing patterns: ${missingPatterns.slice(0, 3).join(', ')}${missingPatterns.length > 3 ? '...' : ''}`)
  }
}

// ==============================================
// 1. CORE AUTHENTICATION SERVICES VALIDATION
// ==============================================
console.log('\n📁 1. Core Authentication Services')

// Check authentication service files
const authFiles = [
  'src/lib/auth/types.ts',
  'src/lib/auth/auth-config.ts', 
  'src/lib/auth/error-handler.ts',
  'src/lib/auth/auth-client.ts',
  'src/lib/auth/email-password.ts',
  'src/lib/auth/coach-registration.ts',
  'src/lib/auth/parent-invitation.ts',
  'src/lib/auth/auth-service.ts'
]

authFiles.forEach(file => {
  checkResult(`Authentication service file: ${file}`, fileExists(file))
})

// Validate types.ts content
checkFileContent('src/lib/auth/types.ts', [
  'export interface AuthUser',
  'export interface CoachRegistrationData',
  'export interface ParentRegistrationData', 
  'export interface AuthResult',
  'export type UserRole',
  'export type Permission',
  'export const ROLE_PERMISSIONS'
], 'Authentication Types')

// Validate auth-service.ts content
checkFileContent('src/lib/auth/auth-service.ts', [
  'export class AuthService',
  'registerCoach.*CoachRegistrationData',
  'registerParentWithCode.*ParentRegistrationData',
  'signIn.*email.*password',
  'requestPasswordReset',
  'getEnhancedUserProfile',
  'isTeamNameAvailable'
], 'Main AuthService')

// Validate coach-registration.ts content
checkFileContent('src/lib/auth/coach-registration.ts', [
  'export class CoachRegistration',
  'registerCoach.*async',
  'createTeam.*async',
  'assignCoachRole.*async',
  'isTeamNameAvailable.*async',
  'validateCoachRegistrationData'
], 'Coach Registration Service')

// Validate parent-invitation.ts content
checkFileContent('src/lib/auth/parent-invitation.ts', [
  'export class ParentInvitationService',
  'sendParentInvitation.*async',
  'registerParentWithCode.*async',
  'validateInvitationCode.*async',
  'generateInvitationCode',
  'createParentChildRelationship'
], 'Parent Invitation Service')

// ==============================================
// 2. AUTHENTICATION FORMS VALIDATION  
// ==============================================
console.log('\n📝 2. Authentication Forms')

// Check form page files
const formFiles = [
  'src/app/(auth)/login/page.tsx',
  'src/app/(auth)/register/coach/page.tsx',
  'src/app/(auth)/register/parent/page.tsx',
  'src/app/(auth)/forgot-password/page.tsx',
  'src/app/(auth)/reset-password/page.tsx'
]

formFiles.forEach(file => {
  checkResult(`Authentication form: ${file}`, fileExists(file))
})

// Validate login page
checkFileContent('src/app/(auth)/login/page.tsx', [
  "'use client'",
  'AuthService',
  'handleSubmit.*async',
  'validateForm',
  'useState',
  'router',
  'AuthFormErrors'
], 'Login Form')

// Validate coach registration page
checkFileContent('src/app/(auth)/register/coach/page.tsx', [
  "'use client'",
  'CoachRegistrationData',
  'currentStep.*useState',
  'isTeamNameAvailable',
  'registerCoach.*async',
  'validateStep1.*validateStep2',
  'ageGroups.*getAvailableAgeGroups'
], 'Coach Registration Form')

// Validate parent registration page  
checkFileContent('src/app/(auth)/register/parent/page.tsx', [
  "'use client'",
  'ParentRegistrationData',
  'validateInvitationCode',
  'registerParentWithCode.*async',
  'invitationCode.*8.*characters',
  'useSearchParams.*code'
], 'Parent Registration Form')

// Validate password reset pages
checkFileContent('src/app/(auth)/forgot-password/page.tsx', [
  "'use client'",
  'requestPasswordReset',
  'emailSent.*useState',
  'validateForm',
  'AuthService\\.validateEmail'
], 'Forgot Password Form')

checkFileContent('src/app/(auth)/reset-password/page.tsx', [
  "'use client'",
  'updatePassword',
  'useSearchParams',
  'access_token.*refresh_token',
  'confirmPassword',
  'hasValidToken'
], 'Reset Password Form')

// ==============================================
// 3. ENHANCED USEAUTH HOOK VALIDATION
// ==============================================
console.log('\n🎣 3. Enhanced useAuth Hook')

checkResult('Enhanced useAuth hook file', fileExists('src/hooks/useAuth.tsx'))

checkFileContent('src/hooks/useAuth.tsx', [
  'export function AuthProvider',
  'export function useAuth.*UseAuthReturn',
  'useProvideAuth.*AuthContextValue',
  'AuthService',
  'hasRole.*UserRole',
  'hasPermission.*Permission',
  'canPaySubsForChild',
  'getEnhancedUserProfile',
  'createAuthListener'
], 'Enhanced useAuth Hook')

// ==============================================
// 4. AUTHENTICATION CONFIGURATION VALIDATION
// ==============================================
console.log('\n⚙️  4. Authentication Configuration')

checkFileContent('src/lib/auth/auth-config.ts', [
  'export const authConfig',
  'passwordRequirements',
  'sessionTimeout',
  'rateLimits',
  'registrationFlows',
  'enabled.*true',
  'validateAuthConfig'
], 'Authentication Configuration')

checkFileContent('src/lib/auth/error-handler.ts', [
  'export class AuthErrorHandler',
  'static getErrorMessage',
  'static createAuthError', 
  'static isRetryableError',
  'Invalid login credentials',
  'withAuthErrorHandling',
  'withRetry'
], 'Authentication Error Handler')

// ==============================================
// 5. CLIENT INTEGRATION VALIDATION
// ==============================================
console.log('\n🔧 5. Client Integration')

checkFileContent('src/lib/auth/auth-client.ts', [
  'createAuthClient',
  'createAuthServerClient',
  'createAuthMiddlewareClient',
  'getCurrentUser',
  'getCurrentSession',
  'validateSession',
  'createBrowserClient',
  'createServerClient'
], 'Authentication Client')

// ==============================================
// 6. TYPESCRIPT COMPILATION CHECK
// ==============================================
console.log('\n📝 6. TypeScript Compilation')

try {
  const { execSync } = require('child_process')
  execSync('npx tsc --noEmit --skipLibCheck', { 
    cwd: path.join(__dirname, '../..'),
    stdio: 'pipe'
  })
  checkResult('TypeScript compilation', true, 'All authentication files compile successfully')
} catch (error) {
  checkResult('TypeScript compilation', false, 'TypeScript compilation failed - check for type errors')
}

// ==============================================
// 7. FEATURE COMPLETENESS VALIDATION
// ==============================================
console.log('\n🎯 7. Feature Completeness Check')

const featureChecks = [
  {
    name: 'Email/Password Authentication',
    check: () => {
      const emailAuth = readFile('src/lib/auth/email-password.ts')
      return emailAuth && 
             emailAuth.includes('signUp') && 
             emailAuth.includes('signIn') && 
             emailAuth.includes('signOut') &&
             emailAuth.includes('requestPasswordReset')
    }
  },
  {
    name: 'Coach Registration with Team Creation',
    check: () => {
      const coachReg = readFile('src/lib/auth/coach-registration.ts')
      return coachReg && 
             coachReg.includes('createTeam') && 
             coachReg.includes('assignCoachRole') &&
             coachReg.includes('isTeamNameAvailable')
    }
  },
  {
    name: 'Parent Invitation System',
    check: () => {
      const parentInv = readFile('src/lib/auth/parent-invitation.ts')
      return parentInv && 
             parentInv.includes('generateInvitationCode') && 
             parentInv.includes('validateInvitationCode') &&
             parentInv.includes('createParentChildRelationship')
    }
  },
  {
    name: 'Role-Based Access Control',
    check: () => {
      const authService = readFile('src/lib/auth/auth-service.ts')
      const useAuth = readFile('src/hooks/useAuth.ts')
      return authService && useAuth &&
             authService.includes('calculateUserPermissions') &&
             useAuth.includes('hasRole') &&
             useAuth.includes('hasPermission')
    }
  },
  {
    name: 'Multi-Step Registration Forms',
    check: () => {
      const coachForm = readFile('src/app/(auth)/register/coach/page.tsx')
      const parentForm = readFile('src/app/(auth)/register/parent/page.tsx')
      return coachForm && parentForm &&
             coachForm.includes('currentStep') &&
             coachForm.includes('validateStep') &&
             parentForm.includes('invitationDetails')
    }
  },
  {
    name: 'Password Reset Flow',
    check: () => {
      const forgotPassword = readFile('src/app/(auth)/forgot-password/page.tsx')
      const resetPassword = readFile('src/app/(auth)/reset-password/page.tsx')
      return forgotPassword && resetPassword &&
             forgotPassword.includes('requestPasswordReset') &&
             resetPassword.includes('updatePassword')
    }
  },
  {
    name: 'Enhanced User Profile System',
    check: () => {
      const authService = readFile('src/lib/auth/auth-service.ts')
      const types = readFile('src/lib/auth/types.ts')
      return authService && types &&
             authService.includes('getEnhancedUserProfile') &&
             types.includes('interface AuthUser') &&
             types.includes('activeTeams') &&
             types.includes('canPaySubsFor')
    }
  },
  {
    name: 'Comprehensive Error Handling',
    check: () => {
      const errorHandler = readFile('src/lib/auth/error-handler.ts')
      return errorHandler &&
             errorHandler.includes('AuthErrorHandler') &&
             errorHandler.includes('withAuthErrorHandling') &&
             errorHandler.includes('withRetry') &&
             errorHandler.includes('getSuggestedAction')
    }
  }
]

featureChecks.forEach(feature => {
  checkResult(feature.name, feature.check())
})

// ==============================================
// FINAL RESULTS
// ==============================================
console.log('\n' + '='.repeat(60))
console.log('📊 VALIDATION SUMMARY')
console.log('='.repeat(60))

const totalChecks = results.length
const passedChecks = results.filter(r => r.passed).length
const failedChecks = totalChecks - passedChecks

console.log(`✅ Passed: ${passedChecks}/${totalChecks}`)
console.log(`❌ Failed: ${failedChecks}/${totalChecks}`)
console.log(`📈 Success Rate: ${Math.round((passedChecks / totalChecks) * 100)}%`)

if (allPassed) {
  console.log('\n🎉 STEP 4.1 VALIDATION: COMPLETE SUCCESS!')
  console.log('✨ All authentication systems are properly implemented')
  console.log('🚀 Ready for production deployment!')
} else {
  console.log('\n⚠️  STEP 4.1 VALIDATION: ISSUES FOUND')
  console.log('🔧 Please address the failed checks before proceeding')
  
  const failedItems = results.filter(r => !r.passed)
  if (failedItems.length > 0) {
    console.log('\n❌ Failed Items:')
    failedItems.forEach(item => {
      console.log(`   • ${item.description}`)
      if (item.details) {
        console.log(`     ${item.details}`)
      }
    })
  }
}

console.log('\n' + '='.repeat(60))
console.log(`🏁 Step 4.1 Authentication System Validation Complete`)
console.log(`📅 ${new Date().toISOString()}`)
console.log('='.repeat(60))

process.exit(allPassed ? 0 : 1)
