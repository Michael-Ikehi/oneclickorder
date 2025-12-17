'use client';
import React, { useState } from 'react';
import { useForgotPasswordMutation, useResetPasswordMutation } from '@/lib/services/api'; 
import { Eye, EyeOff, Phone, Lock, Key, ArrowRight, Loader2, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';

type ForgotPasswordError = {
  data: {
    errors: {
      code: string;
      message: string;
    }[];
  };
};

type APIError = {
  data: {
    errors: { code: string; message: string }[];
  };
};

const ChangePassword: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hover, setHover] = useState(false);

  const [formData, setFormData] = useState({
    phone: '',
    reset_token: '',
    password: '',
    confirm_password: '',
  });

  const [forgotPassword, { isLoading: isSending }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();
  const [errorMessage, setErrorMessage] = useState('');
  const [resetErrorMessage, setResetErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

const handleForgotPassword = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrorMessage('');

  try {
    await forgotPassword({ phone: formData.phone }).unwrap();
    setStep(2);
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'data' in err &&
      Array.isArray((err as ForgotPasswordError).data?.errors)
    ) {
      const error = err as ForgotPasswordError;
      const apiError = error.data.errors[0]?.message;
      setErrorMessage(apiError || 'Something went wrong.');
    } else {
      setErrorMessage('Something went wrong.');
    }
  }
};

function isAPIError(error: unknown): error is APIError {
    if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: unknown }).data;
    return (
      typeof data === 'object' &&
      data !== null &&
      'errors' in data &&
      Array.isArray((data as { errors?: unknown }).errors)
    );
  }
  return false;
}

  const handleResetPassword = async (e: React.FormEvent) => {
  e.preventDefault();
  setResetErrorMessage('');

  if (formData.password !== formData.confirm_password) {
    setResetErrorMessage('Passwords do not match');
    return;
  }

    if (formData.password.length < 6) {
      setResetErrorMessage('Password must be at least 6 characters');
      return;
    }

  try {
    await resetPassword(formData).unwrap();
      setStep(3);
  } catch (err: unknown) {
  if (isAPIError(err)) {
    const apiError = err.data.errors[0]?.message;
    setResetErrorMessage(apiError || 'Something went wrong.');
  } else {
    setResetErrorMessage('Something went wrong.');
  }
}
};

  // Success State
  if (step === 3) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Password Updated!</h2>
        <p className="text-gray-500 text-center max-w-sm mb-6">
          Your password has been successfully changed. Use your new password next time you sign in.
        </p>
        <button
          onClick={() => {
            setStep(1);
            setFormData({ phone: '', reset_token: '', password: '', confirm_password: '' });
          }}
          className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Change Password</h1>
          <p className="text-sm text-gray-500">
            {step === 1 ? 'Enter your phone number to get started' : 'Enter the code and set your new password'}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-3 mb-8">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-red-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 1 ? 'bg-[#FF4D4D] text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            1
          </div>
          <span className="text-sm font-medium hidden sm:block">Verify Phone</span>
        </div>
        <div className={`flex-1 h-0.5 ${step >= 2 ? 'bg-[#FF4D4D]' : 'bg-gray-200'}`} />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-red-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 2 ? 'bg-[#FF4D4D] text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            2
          </div>
          <span className="text-sm font-medium hidden sm:block">Reset Password</span>
        </div>
      </div>

      {step === 1 ? (
        <form onSubmit={handleForgotPassword} className="space-y-5">
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
              name="phone"
              value={formData.phone}
              onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full h-12 border-2 border-gray-200 rounded-xl pl-12 pr-4 focus:border-red-500 focus:ring-0 focus:outline-none transition-colors"
                required
            />
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSending}
            className="w-full h-12 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed" style={{
              backgroundColor: hover ? '#E63939' : '#FF4D4D',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            {isSending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending code...</span>
              </>
            ) : (
              <>
                <span>Send Verification Code</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          {/* Phone (disabled) */}
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
              value={formData.phone}
                disabled
                className="w-full h-12 border-2 border-gray-200 rounded-xl pl-12 pr-4 bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            </div>
          </div>

          {/* OTP */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Verification Code
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Key className="w-5 h-5" />
              </div>
            <input
                type="text"
              name="reset_token"
              value={formData.reset_token}
              onChange={handleChange}
                placeholder="Enter the code sent to your phone"
                className="w-full h-12 border-2 border-gray-200 rounded-xl pl-12 pr-4 focus:border-red-500 focus:ring-0 focus:outline-none transition-colors"
                required
            />
            </div>
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
                  type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                  onChange={handleChange}
                placeholder="Enter new password"
                className="w-full h-12 border-2 border-gray-200 rounded-xl pl-12 pr-12 focus:border-red-500 focus:ring-0 focus:outline-none transition-colors"
                  required
                minLength={6}
                />
                <button
                  type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
            </div>
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
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Confirm new password"
                className="w-full h-12 border-2 border-gray-200 rounded-xl pl-12 pr-12 focus:border-red-500 focus:ring-0 focus:outline-none transition-colors"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {resetErrorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{resetErrorMessage}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
            >
              Back
            </button>
          <button
            type="submit"
              disabled={isResetting}
              className="flex-[2] h-12 bg-[#FF4D4D] hover:bg-[#FF4D4D] text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
              {isResetting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <span>Update Password</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
          </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ChangePassword;
