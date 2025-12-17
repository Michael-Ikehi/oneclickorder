'use client';
import React from 'react';

interface PopupProps {
  width?: string;
  height?: string;
  content: React.ReactNode;
  onClose: () => void;
  mobileFullscreen?: boolean;
}

const Popup: React.FC<PopupProps> = ({
  width = '400px',
  height = '70vh',
  content,
  onClose,
  mobileFullscreen = false,
}) => {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 no-scrollbar">
      <div
        className={`
          bg-white shadow-lg relative overflow-hidden flex flex-col
          ${mobileFullscreen ? 'w-full h-full md:rounded-lg md:w-[40vw] md:h-[80vh]' : 'rounded-lg'}
        `}
        style={{
          width: mobileFullscreen ? undefined : width,
          height: mobileFullscreen ? undefined : height,
          maxHeight: !mobileFullscreen ? height : '100vh',
        }}
      >
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-black bg-white hover:bg-gray-300 text-2xl w-8 h-8 rounded-full flex items-center justify-center z-50"
          onClick={onClose}
        >
          ×
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto h-full">{content}</div>
      </div>
    </div>
  );
};

export default Popup;
