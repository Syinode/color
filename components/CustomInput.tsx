
import React from 'react';

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const CustomInput: React.FC<CustomInputProps> = ({ label, className, ...props }) => {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-slate-600 mb-2">{label}</label>}
            <input
                {...props}
                className={`w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ${className}`}
            />
        </div>
    );
};
