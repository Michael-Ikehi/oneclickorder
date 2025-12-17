'use client'
import { useForgotPasswordMutation, useResetPasswordMutation } from '@/lib/services/api'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Phone, Lock, Key, ArrowRight, Loader2, AlertCircle, CheckCircle, ArrowLeft, ShieldCheck } from 'lucide-react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

type ResetPasswordFormValues = {
  phone: string
  token: string
  password: string
  confirmPassword: string
}

type APIError = {
  status: number
  data: {
    errors: {
      code: string
      message: string
    }[]
  }
}

interface ForgotPasswordProps {
  onClose?: () => void
}

export default function ForgotPassword({ onClose }: ForgotPasswordProps) {
  const [step, setStep] = useState<'phone' | 'reset' | 'success'>('phone')
  const [savedPhone, setSavedPhone] = useState('')
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    defaultValues: {
      phone: '',
      token: '',
      password: '',
      confirmPassword: '',
    },
  })

  const [forgotPassword, { isLoading: isSendingPhone }] = useForgotPasswordMutation()
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation()

  const handlePhoneSubmit = async (data: { phone: string }) => {
    setApiError(null)
    try {
      await forgotPassword({ phone: data.phone }).unwrap()
      setSavedPhone(data.phone)
      setStep('reset')
    } catch (err) {
      const error = err as APIError
      const message = error?.data?.errors?.[0]?.message || 'An unexpected error occurred.'
      setApiError(message)
    }
  }

  const handleResetSubmit = async (data: ResetPasswordFormValues) => {
    setApiError(null)

    if (data.password !== data.confirmPassword) {
      setApiError('Passwords do not match.')
      return
    }

    if (data.password.length < 6) {
      setApiError('Password must be at least 6 characters.')
      return
    }

    try {
      await resetPassword({
        phone: savedPhone,
        reset_token: data.token,
        password: data.password,
        confirm_password: data.confirmPassword,
      }).unwrap()

      setStep('success')
    } catch (err) {
      const error = err as APIError
      const message = error?.data?.errors?.[0]?.message || 'An unexpected error occurred.'
      setApiError(message)
    }
  }

  // Success State
  if (step === 'success') {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h2>
        <p className="text-gray-500 mb-6">
          Your password has been successfully reset. You can now log in with your new password.
        </p>
        <button
          onClick={onClose}
          className="w-full h-12 bg-[#FF4D4D] hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
        >
          <span>Back to Login</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
        <p className="text-gray-500">
          {step === 'phone'
            ? "Enter your phone number and we'll send you a reset code"
            : 'Enter the code sent to your phone and create a new password'}
        </p>
      </div>

      {/* Phone Step */}
      {step === 'phone' && (
        <form onSubmit={handleSubmit(handlePhoneSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <PhoneInput
              country={'gb'}
              value={watch('phone')}
              onChange={(value) => setValue('phone', `+${value}`)}
              inputClass="!w-full !h-12 !border-2 !border-gray-200 !rounded-xl !pl-14 !pr-4 !text-base focus:!border-red-500 focus:!ring-0 !bg-white"
              buttonClass="!border-2 !border-gray-200 !border-r-0 !rounded-l-xl !bg-white !h-12"
              containerClass="!w-full"
              inputProps={{
                name: 'phone',
                required: true,
                placeholder: 'Enter your phone number'
              }}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* Error Message */}
          {apiError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSendingPhone}
            className="w-full h-12 bg-[#FF4D4D] hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-red-500/25"
          >
            {isSendingPhone ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending code...</span>
              </>
            ) : (
              <>
                <span>Send Reset Code</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Reset Step */}
      {step === 'reset' && (
        <form onSubmit={handleSubmit(handleResetSubmit)} className="space-y-4">
          {/* Phone Display */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Phone className="w-5 h-5" />
              </div>
            <input
              type="tel"
                value={savedPhone}
              disabled
                className="w-full h-12 border-2 border-gray-200 rounded-xl pl-12 pr-4 text-base bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            </div>
          </div>

          {/* Reset Token */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reset Code
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Key className="w-5 h-5" />
              </div>
            <input
              type="text"
                {...register('token', { required: 'Reset code is required' })}
                placeholder="Enter the code sent to your phone"
                className="w-full h-12 border-2 border-gray-200 rounded-xl pl-12 pr-4 text-base focus:border-red-500 focus:ring-0 focus:outline-none transition-colors bg-white"
            />
            </div>
            {errors.token && (
              <p className="text-red-500 text-sm mt-1">{errors.token.message}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="w-5 h-5" />
              </div>
            <input
              type="password"
                {...register('password', { 
                  required: 'Password is required', 
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                placeholder="Create a new password"
                className="w-full h-12 border-2 border-gray-200 rounded-xl pl-12 pr-4 text-base focus:border-red-500 focus:ring-0 focus:outline-none transition-colors bg-white"
            />
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="w-5 h-5" />
              </div>
            <input
              type="password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === watch('password') || 'Passwords do not match',
              })}
                placeholder="Confirm your new password"
                className="w-full h-12 border-2 border-gray-200 rounded-xl pl-12 pr-4 text-base focus:border-red-500 focus:ring-0 focus:outline-none transition-colors bg-white"
            />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Error Message */}
          {apiError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setStep('phone')
                setApiError(null)
              }}
              className="flex-1 h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          <button
            type="submit"
            disabled={isResetting}
              className="flex-[2] h-12 bg-[#FF4D4D] hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-red-500/25"
          >
              {isResetting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Resetting...</span>
                </>
              ) : (
                <>
                  <span>Reset Password</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
          </button>
          </div>
        </form>
      )}
    </div>
  )
}
