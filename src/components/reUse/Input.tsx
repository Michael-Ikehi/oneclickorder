import React from 'react';

type InputProps = {
  label?: string;
  name?: string;
  placeholder?: string;
  buttonText?: string;
  width?: string; 
  leftIcon?: React.ReactNode;
  height?: string;
  onButtonClick?: () => void;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const Input: React.FC<InputProps> = ({
  label,
  name,
  placeholder,
  buttonText,
  onButtonClick,
  leftIcon,
  height = "45px",
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={name} className="text-[#EF4444]">
          {label}
        </label>
      )}

      <div className={`relative ${className}`}>
        {/* Left icon */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-3 flex items-center text-[#574D4D]">
            {leftIcon}
          </div>
        )}

        <input
          id={name}
          name={name}
          placeholder={placeholder}
          className={`w-full bg-[#F3F3F3] text-sm rounded-sm border-4 border-[#F3F3F3] py-2 pr-12 ${
            leftIcon ? 'pl-10' : 'px-3'
          } focus:outline-none focus:ring-1 focus:ring-gray-500`}
          style={{ height }}
          {...props}
        />

        {/* Right button */}
        {buttonText && (
          <button
            type="button"
            onClick={onButtonClick}
            className="absolute inset-y-0 right-1 px-3 m-2 text-white bg-[#FF4D4D] rounded-lg text-sm hover:bg-[#FF4D4D] focus:outline-none"
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;
