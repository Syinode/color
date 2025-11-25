
import React from 'react';

interface ToggleProps {
    label: string;
    enabled: boolean;
    setEnabled: (enabled: boolean) => void;
}

export const Toggle: React.FC<ToggleProps> = ({ label, enabled, setEnabled }) => {
    return (
        <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-200">
            <span className="font-medium text-slate-700">{label}</span>
            <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                className={`${
                    enabled ? 'bg-indigo-600' : 'bg-slate-300'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
                <span
                    className={`${
                        enabled ? 'translate-x-5' : 'translate-x-0'
                    } inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
            </button>
        </div>
    );
};
