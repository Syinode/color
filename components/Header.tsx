
import React from 'react';
import { BookImage } from 'lucide-react';

export const Header: React.FC = () => {
    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center">
                        <BookImage className="h-8 w-8 text-indigo-600" />
                        <span className="ml-3 text-2xl font-bold text-slate-800 font-display">Coloring Book Pro</span>
                    </div>
                    <div className="flex items-center">
                        <span className="text-sm font-medium text-slate-500 hidden md:block">Powered by Google AI</span>
                    </div>
                </div>
            </div>
        </header>
    );
};
