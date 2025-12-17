'use client';
import React from 'react';
import { LogOut, X } from 'lucide-react';

interface SignOutProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const SignOut: React.FC<SignOutProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative p-6 pb-4">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <LogOut className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sign Out</h2>
            <p className="text-gray-500">
              Are you sure you want to sign out of your account?
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-2 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-[#FF4D4D] text-white font-semibold rounded-xl hover:bg-[#FF4D4D] transition-colors shadow-lg shadow-red-500/20"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignOut;
