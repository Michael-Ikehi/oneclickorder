'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSignUpMutation } from '@/lib/services/api'
import { setCredentials } from '@/lib/services/authSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/lib/store/store'
import { setLoading } from '@/lib/store/loadingSlice'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { Eye, EyeOff, User, Mail, Lock, Gift, ArrowRight, Loader2, AlertCircle, CheckCircle, Utensils } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'

const SignUp = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [signUpError, setSignUpError] = useState<string>('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  const { city, area, storeName } = useSelector((state: RootState) => state.storeParams)
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const redirect = searchParams?.get('redirect')

  const [formData, setFormData] = useState({
    f_name: '',
    l_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    ref_code: '',
    activity_type: 'checkout',
    ref_store: storeName ?? '',
  })
  const [signUp, { isLoading }] = useSignUpMutation()

  useEffect(() => {
    dispatch(setLoading(false))
  }, [dispatch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSignUpError('')
      
      if (!agreeToTerms) {
        setSignUpError('Please agree to the Terms of Service and Privacy Policy.')
        return
      }
      
      if (formData.password !== formData.confirmPassword) {
        setSignUpError('Passwords do not match.')
        return
      }

      if (formData.password.length < 6) {
        setSignUpError('Password must be at least 6 characters.')
        return
      }

      const response = await signUp(formData).unwrap()
      dispatch(setCredentials({ token: response.token }))
      router.push(redirect || `/takeaway/${city}/${area}/${storeName}`)
    } catch (err: any) {
      const message =
        err?.data?.errors?.[0]?.message ||
        err?.data?.error?.message ||
        err?.data?.message ||
        'Sign Up failed'
      setSignUpError(message)
    }
  }

  const passwordStrength = () => {
    const pwd = formData.password
    if (!pwd) return { strength: 0, label: '', color: '' }
    let score = 0
    if (pwd.length >= 6) score++
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    
    if (score <= 2) return { strength: 33, label: 'Weak', color: 'bg-[#FF4D4D]' }
    if (score <= 3) return { strength: 66, label: 'Medium', color: 'bg-yellow-500' }
    return { strength: 100, label: 'Strong', color: 'bg-green-500' }
  }

  const pwdStrength = passwordStrength()

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-300 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="mb-8">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Utensils className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-center">Join FoodHutz!</h1>
          <p className="text-xl text-white/90 text-center max-w-md">
            Create an account and start ordering your favorite food today
          </p>
          <div className="mt-12 flex flex-col gap-4 text-white/80">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span>Earn rewards on every order</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span>Exclusive member-only deals</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span>Save addresses for faster checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Utensils className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-500">Fill in your details to get started</p>
          </div>

        {/* Google Sign-Up */}
          <button className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-xl py-3 px-4 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm">
            <FcGoogle size={22} />
            <span className="font-medium text-gray-700">Continue with Google</span>
        </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400 font-medium">or sign up with email</span>
            <div className="flex-1 h-px bg-gray-200" />
        </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                First Name
              </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
              <input
                    type="text"
                name="f_name"
                    value={formData.f_name}
                    onChange={handleInputChange}
                    placeholder="John"
                    className="w-full h-11 border-2 border-gray-200 rounded-xl pl-10 pr-4 text-base focus:border-teal-500 focus:ring-0 focus:outline-none transition-colors bg-white"
                required
              />
            </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Last Name
              </label>
              <input
                  type="text"
                name="l_name"
                  value={formData.l_name}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  className="w-full h-11 border-2 border-gray-200 rounded-xl px-4 text-base focus:border-teal-500 focus:ring-0 focus:outline-none transition-colors bg-white"
                required
              />
            </div>
          </div>

          {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Email Address
            </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
            <input
                  type="email"
              name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  className="w-full h-11 border-2 border-gray-200 rounded-xl pl-10 pr-4 text-base focus:border-teal-500 focus:ring-0 focus:outline-none transition-colors bg-white"
              required
            />
              </div>
          </div>

          {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Phone Number
            </label>
            <PhoneInput
                country={'gb'}
              value={formData.phone}
              onChange={(value) => setFormData((prev) => ({ ...prev, phone: `+${value}` }))}
                inputClass="!w-full !h-11 !border-2 !border-gray-200 !rounded-xl !pl-14 !pr-4 !text-base focus:!border-teal-500 focus:!ring-0 !bg-white"
                buttonClass="!border-2 !border-gray-200 !border-r-0 !rounded-l-xl !bg-white !h-11"
              containerClass="!w-full"
              inputProps={{
                name: 'phone',
                required: true,
                  placeholder: 'Enter your phone number'
              }}
            />
          </div>

            {/* Password Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
              <input
                    type={showPassword ? 'text' : 'password'}
                name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full h-11 border-2 border-gray-200 rounded-xl pl-10 pr-10 text-base focus:border-teal-500 focus:ring-0 focus:outline-none transition-colors bg-white"
                required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Confirm
              </label>
                <div className="relative">
              <input
                    type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full h-11 border-2 border-gray-200 rounded-xl px-4 pr-10 text-base focus:border-teal-500 focus:ring-0 focus:outline-none transition-colors bg-white"
                required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Strength */}
            {formData.password && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Password strength</span>
                  <span className={`font-medium ${
                    pwdStrength.label === 'Weak' ? 'text-red-500' :
                    pwdStrength.label === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {pwdStrength.label}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${pwdStrength.color}`}
                    style={{ width: `${pwdStrength.strength}%` }}
                  />
            </div>
          </div>
            )}

          {/* Referral Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Referral Code <span className="font-normal text-gray-400">(optional)</span>
            </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Gift className="w-5 h-5" />
                </div>
            <input
                  type="text"
              name="ref_code"
                  value={formData.ref_code}
                  onChange={handleInputChange}
                  placeholder="Enter code for bonus"
                  className="w-full h-11 border-2 border-gray-200 rounded-xl pl-10 pr-4 text-base focus:border-teal-500 focus:ring-0 focus:outline-none transition-colors bg-white"
            />
          </div>
        </div>

            {/* Terms Agreement */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
              />
              <span className="text-sm text-gray-600 leading-relaxed">
                I agree to FoodHutz{' '}
                <Link href="/terms" className="text-teal-600 hover:underline font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-teal-600 hover:underline font-medium">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {/* Error Message */}
            {signUpError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{signUpError}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
        </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                href={`/takeaway/${city}/${area}/${storeName}/login`}
                className="font-semibold text-red-600 hover:text-red-700 transition-colors"
              >
                Sign in
              </Link>
          </p>
          </div>

          {/* Back to Store */}
          <div className="mt-4 text-center">
            <Link
              href={`/takeaway/${city}/${area}/${storeName}`}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back to store
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp
