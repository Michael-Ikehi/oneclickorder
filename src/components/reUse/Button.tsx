'use client';
import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  children?: React.ReactNode;
  name?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  width?: string;
  height?: string;
  bgColor?: string;
  rounded?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  icon?: React.ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-700 shadow-sm',
  secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200',
  outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary-50',
  ghost: 'bg-transparent text-secondary-700 hover:bg-secondary-100',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'text-sm px-3 py-1.5 h-8',
  md: 'text-sm px-4 py-2.5 h-10',
  lg: 'text-base px-6 py-3 h-12',
};

const Button: React.FC<ButtonProps> = ({
  children,
  name,
  variant = 'primary',
  size = 'md',
  width,
  bgColor,
  onClick,
  type = 'button',
  height,
  disabled = false,
  loading = false,
  rounded = 'rounded-lg',
  className = '',
  icon,
}) => {
  // Support legacy props
  const customStyles = bgColor ? `${bgColor} text-white` : variants[variant];
  const customSize = height ? height : sizes[size];
  const widthClass = width || '';

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        font-medium transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-[0.98]
        ${customStyles}
        ${customSize}
        ${widthClass}
        ${rounded}
        ${className}
      `}
      onClick={onClick}
      type={type}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        icon
      ) : null}
      {children || name}
    </button>
  );
};

export default Button;
