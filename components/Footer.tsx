
import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-white mt-12">
            <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Coloring Book Pro. An AI-powered application for creators.</p>
            </div>
        </footer>
    );
};
