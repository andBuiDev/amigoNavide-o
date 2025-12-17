import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'gold';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded-xl font-bold transition-all duration-300 transform active:scale-95 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-red-600 hover:bg-red-700 text-white shadow-red-900/20 focus:ring-red-500",
    secondary: "bg-green-700 hover:bg-green-800 text-white shadow-green-900/20 focus:ring-green-500",
    danger: "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400",
    gold: "bg-yellow-400 hover:bg-yellow-500 text-red-900 shadow-yellow-500/30 focus:ring-yellow-400 border border-yellow-200"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
