import React from 'react';

interface AppLayoutProps {
    children: React.ReactNode;
}

import { ScrollNavigation } from './ScrollNavigation';

import { Navbar } from './Navbar';

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen font-sans">
            {/* Header */}
            <Navbar />

            {/* Main Content */}
            <ScrollNavigation />
            <main className="pt-28 pb-12 px-4 md:px-8 max-w-7xl mx-auto relative z-10 pl-4 xl:pl-28">
                {children}
            </main>

            <footer className="bg-white border-t border-slate-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 py-6 text-center text-slate-500 text-sm">
                    &copy; 2025 Premier League Analytics. Data provided for educational purposes.
                </div>
            </footer>
        </div>
    );
};
