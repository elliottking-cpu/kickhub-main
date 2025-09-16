'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthService } from '@/lib/auth/auth-service'
import { AuthFormErrors, ParentRegistrationData } from '@/lib/auth/types'

export default function ParentRegisterPage() {
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<ParentRegistrationData>({
    invitationCode: searchParams.get('code') || '',
    password: '',
    fullName: '',
    phone: ''
  })
  const [errors, setErrors] = useState<AuthFormErrors>({})
  const [loading, setLoading] = useState(false)
  const [validatingCode, setValidatingCode] = useState(false)
  const [invitationDetails, setInvitationDetails] = useState<any>(null)
  
  const router = useRouter()
  const authService = new AuthService()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name as keyof AuthFormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }

    // Reset invitation details if code changes
    if (name === 'invitationCode' && invitationDetails) {
      setInvitationDetails(null)
    }
  }

  // Validate invitation code when it changes
  useEffect(() => {
    const validateCode = async () => {
      if (formData.invitationCode.length === 8) {
        setValidatingCode(true)
        setErrors(prev => ({ ...prev, invitationCode: undefined }))
        
        try {
          const result = await authService.validateInvitationCode(formData.invitationCode)
          
          if (result.success && result.data) {
            setInvitationDetails(result.data)
          } else {
            setErrors(prev => ({ 
              ...prev, 
              invitationCode: result.error?.message || 'Invalid invitation code' 
            }))
            setInvitationDetails(null)
          }
        } catch (error) {
          setErrors(prev => ({ 
            ...prev, 
            invitationCode: 'Failed to validate invitation code' 
          }))
          setInvitationDetails(null)
        } finally {
          setValidatingCode(false)
        }
      } else if (formData.invitationCode.length > 0 && formData.invitationCode.length !== 8) {
        setErrors(prev => ({ 
          ...prev, 
          invitationCode: 'Invitation code must be 8 characters long' 
        }))
        setInvitationDetails(null)
      } else {
        setInvitationDetails(null)
      }
    }

    const debounceTimer = setTimeout(validateCode, 300)
    return () => clearTimeout(debounceTimer)
  }, [formData.invitationCode])

  const validateStep1 = (): boolean => {
    const newErrors: AuthFormErrors = {}

    // Invitation code validation
    if (!formData.invitationCode) {
      newErrors.invitationCode = 'Invitation code is required'
    } else if (formData.invitationCode.length !== 8) {
      newErrors.invitationCode = 'Invitation code must be 8 characters long'
    } else if (!invitationDetails) {
      newErrors.invitationCode = 'Please enter a valid invitation code'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = (): boolean => {
    const newErrors: AuthFormErrors = {}

    // Full name validation
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters long'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long'
    }

    // Phone validation (optional)
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep1() || !validateStep2()) return

    setLoading(true)
    setErrors({})

    try {
      const result = await authService.registerParentWithCode(formData)
      
      if (result.success) {
        // Registration successful - redirect to parent dashboard
        router.push('/parent/dashboard?welcome=true')
      } else {
        setErrors({ general: result.error?.message || 'Registration failed' })
        setCurrentStep(1) // Go back to first step to show error
      }
    } catch (error: any) {
      setErrors({ general: AuthService.getErrorMessage(error) })
      setCurrentStep(1) // Go back to first step to show error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join as Parent
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Use your invitation code from your child's coach
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 1 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-12 h-1 ${currentStep >= 2 ? 'bg-green-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <div className={`w-12 h-1 ${currentStep >= 3 ? 'bg-green-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 3 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              3
            </div>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Step 1: Invitation Code */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 text-center">Enter Invitation Code</h3>
              
              <div>
                <label htmlFor="invitationCode" className="block text-sm font-medium text-gray-700">
                  Invitation Code *
                </label>
                <input
                  id="invitationCode"
                  name="invitationCode"
                  type="text"
                  required
                  maxLength={8}
                  value={formData.invitationCode}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-center text-lg font-mono uppercase ${
                    errors.invitationCode ? 'border-red-300' : invitationDetails ? 'border-green-300' : 'border-gray-300'
                  }`}
                  placeholder="XXXXXXXX"
                  style={{ letterSpacing: '0.2em' }}
                />
                
                {validatingCode && (
                  <p className="mt-1 text-sm text-gray-500 text-center">Validating code...</p>
                )}
                
                {invitationDetails && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-700 font-medium">✓ Valid invitation found!</p>
                    <div className="mt-1 text-sm text-green-600">
                      <p>Child: {invitationDetails.children?.full_name || 'Unknown'}</p>
                      <p>Team: {invitationDetails.teams?.name || 'Unknown'}</p>
                      <p>Email: {invitationDetails.email}</p>
                    </div>
                  </div>
                )}
                
                {errors.invitationCode && (
                  <p className="mt-1 text-sm text-red-600 text-center">{errors.invitationCode}</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      How to get your invitation code
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Your child's coach should have sent you an 8-character invitation code via email. If you don't have it, please contact your coach.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 text-center">Your Information</h3>
              
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                    errors.fullName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Create a password (min 8 characters)"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number (optional)
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {invitationDetails && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600">
                    <strong>Email:</strong> {invitationDetails.email}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    This email will be used for your account login.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 text-center">Review & Confirm</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="text-sm text-gray-900">{formData.fullName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{invitationDetails?.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Child</dt>
                    <dd className="text-sm text-gray-900">{invitationDetails?.children?.full_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Team</dt>
                    <dd className="text-sm text-gray-900">{invitationDetails?.teams?.name}</dd>
                  </div>
                  {formData.phone && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="text-sm text-gray-900">{formData.phone}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="text-sm text-gray-600">
                <p>By creating an account, you agree to our Terms of Service and Privacy Policy.</p>
              </div>
            </div>
          )}

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Previous
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 1 && !invitationDetails}
                className={`ml-auto px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                  (currentStep === 1 && !invitationDetails)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className={`ml-auto px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {loading ? 'Creating Account...' : 'Create Parent Account'}
              </button>
            )}
          </div>

          <div className="text-center">
            <Link 
              href="/login" 
              className="text-sm text-green-600 hover:text-green-500"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
