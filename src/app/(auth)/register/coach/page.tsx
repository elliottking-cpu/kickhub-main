'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthService } from '@/lib/auth/auth-service'
import { AuthFormErrors, CoachRegistrationData } from '@/lib/auth/types'

export default function CoachRegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<CoachRegistrationData>({
    email: '',
    password: '',
    fullName: '',
    teamName: '',
    ageGroup: '',
    clubName: '',
    phone: ''
  })
  const [errors, setErrors] = useState<AuthFormErrors>({})
  const [loading, setLoading] = useState(false)
  const [teamNameAvailable, setTeamNameAvailable] = useState<boolean | null>(null)
  const [checkingTeamName, setCheckingTeamName] = useState(false)
  
  const router = useRouter()
  const authService = new AuthService()

  const ageGroups = authService.getAvailableAgeGroups()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name as keyof AuthFormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }

    // Check team name availability when both team name and age group are set
    if (name === 'teamName' || name === 'ageGroup') {
      setTeamNameAvailable(null)
    }
  }

  // Check team name availability
  useEffect(() => {
    const checkTeamAvailability = async () => {
      if (formData.teamName.length >= 2 && formData.ageGroup) {
        setCheckingTeamName(true)
        try {
          const available = await authService.isTeamNameAvailable(formData.teamName, formData.ageGroup)
          setTeamNameAvailable(available)
        } catch (error) {
          console.error('Error checking team name availability:', error)
        } finally {
          setCheckingTeamName(false)
        }
      }
    }

    const debounceTimer = setTimeout(checkTeamAvailability, 500)
    return () => clearTimeout(debounceTimer)
  }, [formData.teamName, formData.ageGroup])

  const validateStep1 = (): boolean => {
    const newErrors: AuthFormErrors = {}

    // Email validation
    const emailValidation = AuthService.validateEmail(formData.email)
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long'
    }

    // Full name validation
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters long'
    }

    // Phone validation (optional)
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = (): boolean => {
    const newErrors: AuthFormErrors = {}

    // Team name validation
    const teamValidation = authService.validateTeamName(formData.teamName)
    if (!teamValidation.isValid) {
      newErrors.teamName = teamValidation.error
    }

    // Age group validation
    if (!formData.ageGroup) {
      newErrors.ageGroup = 'Please select an age group'
    }

    // Team name availability
    if (teamNameAvailable === false) {
      newErrors.teamName = 'A team with this name already exists in this age group'
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
      const result = await authService.registerCoach(formData)
      
      if (result.success) {
        // Registration successful - redirect to coach dashboard
        router.push('/coach/dashboard?welcome=true')
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
            Create Coach Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Start managing your team on KickHub
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-12 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <div className={`w-12 h-1 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              3
            </div>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 text-center">Personal Information</h3>
              
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
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.fullName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
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
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
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
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Team Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 text-center">Team Information</h3>
              
              <div>
                <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
                  Team Name *
                </label>
                <input
                  id="teamName"
                  name="teamName"
                  type="text"
                  required
                  value={formData.teamName}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.teamName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your team name"
                />
                {checkingTeamName && (
                  <p className="mt-1 text-sm text-gray-500">Checking availability...</p>
                )}
                {teamNameAvailable === true && (
                  <p className="mt-1 text-sm text-green-600">✓ Team name is available</p>
                )}
                {teamNameAvailable === false && (
                  <p className="mt-1 text-sm text-red-600">✗ Team name is already taken</p>
                )}
                {errors.teamName && (
                  <p className="mt-1 text-sm text-red-600">{errors.teamName}</p>
                )}
              </div>

              <div>
                <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700">
                  Age Group *
                </label>
                <select
                  id="ageGroup"
                  name="ageGroup"
                  required
                  value={formData.ageGroup}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.ageGroup ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select age group</option>
                  {ageGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
                {errors.ageGroup && (
                  <p className="mt-1 text-sm text-red-600">{errors.ageGroup}</p>
                )}
              </div>

              <div>
                <label htmlFor="clubName" className="block text-sm font-medium text-gray-700">
                  Club Name (optional)
                </label>
                <input
                  id="clubName"
                  name="clubName"
                  type="text"
                  value={formData.clubName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter club name (if part of a club)"
                />
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 text-center">Review & Confirm</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="text-sm text-gray-900">{formData.fullName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{formData.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Team Name</dt>
                    <dd className="text-sm text-gray-900">{formData.teamName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Age Group</dt>
                    <dd className="text-sm text-gray-900">{formData.ageGroup}</dd>
                  </div>
                  {formData.clubName && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Club</dt>
                      <dd className="text-sm text-gray-900">{formData.clubName}</dd>
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
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Previous
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="ml-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className={`ml-auto px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Creating Account...' : 'Create Account & Team'}
              </button>
            )}
          </div>

          <div className="text-center">
            <Link 
              href="/login" 
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}