
import React from 'react';

interface OptionButtonProps {
    label: string;
    isSelected: boolean;
    onClick: () => void;
    icon?: React.ReactNode;
}

export const OptionButton: React.FC<OptionButtonProps> = ({ label, isSelected, onClick, icon }) => {
    const baseClasses = "w-full text-center p-3 rounded-lg border-2 transition-all duration-200 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2";
    const selectedClasses = "bg-indigo-600 text-white border-indigo-600 shadow-md";
    const unselectedClasses = "bg-white text-slate-700 border-slate-300 hover:border-indigo-400 hover:bg-indigo-50";

    return (
        <button onClick={onClick} className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}>
           <div className="flex items-center justify-center">
              {icon && <span className="w-5 h-5 mr-2">{icon}</span>}
              <span>{label}</span>
           </div>
        </button>
    );
};
