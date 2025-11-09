import { ButtonProps } from '@/lib/type';
import clsx from 'clsx';

const variants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
};

const sizes = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
};

export const Button = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  onClick,
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={clsx(
        'rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};