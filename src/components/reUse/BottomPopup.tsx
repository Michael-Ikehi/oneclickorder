'use client';
import React from 'react';
import { IoClose } from 'react-icons/io5';

interface BottomPopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const BottomPopup: React.FC<BottomPopupProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-[999] overflow-hidden flex flex-col justify-end no-scrollbar">
      <div className="bg-white w-full rounded-t-2xl max-h-[80vh] min-h-[50vh] flex flex-col animate-slideUp">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-700 text-xl z-10"
          onClick={onClose}
          aria-label="Close"
        >
          <IoClose />
        </button>

        {/* Scrollable content */}
        <div className="pt-10 p-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

export default BottomPopup;
