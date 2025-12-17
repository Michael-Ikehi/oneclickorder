'use client'
import { useEffect, useState } from 'react'
import { useLoginMutation } from '@/lib/services/api'
import { setCredentials } from '@/lib/services/authSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import Popup from '@/components/reUse/PopUp'
import ForgotPassword from '../forgot-password/ForgotPassword'
import { RootState } from '@/lib/store/store'
import { setLoading } from '@/lib/store/loadingSlice'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { Eye, EyeOff, Lock, ArrowRight, Loader2, AlertCircle, Utensils } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import Link from 'next/link'

const Login = () => {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const { city, area, storeName } = useSelector((state: RootState) => state.storeParams)
  const [login, { isLoading, error }] = useLoginMutation()

  const dispatch = useDispatch()
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const redirect = searchParams?.get('redirect')

  useEffect(() => {
    dispatch(setLoading(false))
  }, [dispatch])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await login({ phone, password }).unwrap()
      dispatch(setCredentials({ token: response.token }))
      
      // Redirect to the original page or default to store page
      if (redirect) {
        router.push(decodeURIComponent(redirect))
      } else if (city && area && storeName) {
        router.push(`/takeaway/${city}/${area}/${storeName}`)
      } else if (storeName) {
        router.push(`/${storeName}`)
      } else {
        router.push('/')
      }
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  const handleSignUpClick = () => {
    dispatch(setLoading(true))
    const signUpUrl = city && area && storeName 
      ? `/takeaway/${city}/${area}/${storeName}/sign-up`
      : '/takeaway'
    // Preserve redirect param
    const signUpRedirect = redirect ? `${signUpUrl}?redirect=${redirect}` : signUpUrl
    router.push(signUpRedirect)
  }
  
  // Back to store URL
  const backToStoreUrl = redirect 
    ? decodeURIComponent(redirect) 
    : city && area && storeName 
      ? `/takeaway/${city}/${area}/${storeName}`
      : storeName 
        ? `/${storeName}`
        : '/'

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-600 via-red-500 to-orange-500 relative overflow-hidden">
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
          <h1 className="text-4xl font-bold mb-4 text-center">Welcome Back!</h1>
          <p className="text-xl text-white/90 text-center max-w-md">
            Sign in to continue your delicious journey with FoodHutz
          </p>
          <div className="mt-12 flex flex-col gap-4 text-white/80">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <ArrowRight className="w-4 h-4" />
              </div>
              <span>Quick and easy ordering</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <ArrowRight className="w-4 h-4" />
              </div>
              <span>Track your orders in real-time</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <ArrowRight className="w-4 h-4" />
              </div>
              <span>Exclusive deals and rewards</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-16 h-16 bg-[#FF4D4D] rounded-2xl flex items-center justify-center shadow-lg">
              <Utensils className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-500">Enter your credentials to continue</p>
          </div>

        {/* Google Sign-In */}
          <button className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-xl py-3.5 px-4 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm">
            <FcGoogle size={22} />
            <span className="font-medium text-gray-700">Continue with Google</span>
        </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400 font-medium">or sign in with phone</span>
            <div className="flex-1 h-px bg-gray-200" />
        </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Phone Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
            </label>
              <div className="relative">
            <PhoneInput
              country={'gb'}
              value={phone}
              onChange={(value) => setPhone(`+${value}`)}
                  inputClass="!w-full !h-12 !border-2 !border-gray-200 !rounded-xl !pl-14 !pr-4 !text-base focus:!border-red-500 focus:!ring-0 !bg-white"
                  buttonClass="!border-2 !border-gray-200 !border-r-0 !rounded-l-xl !bg-white !h-12"
              containerClass="!w-full"
              inputProps={{
                name: 'phone',
                required: true,
                    placeholder: 'Enter your phone number'
              }}
            />
              </div>
          </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
            <input
              type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
                  className="w-full h-12 border-2 border-gray-200 rounded-xl pl-12 pr-12 text-base focus:border-red-500 focus:ring-0 focus:outline-none transition-colors bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
            Remember me
                </span>
          </label>
          <button
                type="button"
                onClick={() => setIsPopupOpen(true)}
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            Forgot password?
          </button>
        </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">Login failed. Please check your credentials.</p>
              </div>
            )}

            {/* Submit Button */}
        <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#FF4D4D] hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
        >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
        </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
            Don&apos;t have an account?{' '}
              <button
                onClick={handleSignUpClick}
                className="font-semibold text-teal-600 hover:text-teal-700 transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>

          {/* Back to Store */}
          <div className="mt-4 text-center">
            <Link
              href={backToStoreUrl}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back to store
            </Link>
            </div>
        </div>
      </div>

      {/* Forgot Password Popup */}
      {isPopupOpen && (
        <Popup
          width="480px"
          height="auto"
          content={<ForgotPassword onClose={() => setIsPopupOpen(false)} />}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
    </div>
  )
}

export default Login
