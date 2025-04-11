import React from 'react';

export const Button = ({ 
    children, 
    className = '', 
    disabled = false,
    type = 'button',
    onClick,
    ...props 
}) => {
    return (
        <button
            type={type}
            className={`
                px-4 py-2 rounded-md font-medium
                ${disabled 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }
                ${className}
            `}
            disabled={disabled}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
}; 