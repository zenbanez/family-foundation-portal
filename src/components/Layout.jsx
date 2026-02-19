import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {children}
            </main>
            <footer className="bg-navy text-white/50 py-6 border-t border-white/5 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center text-xs">
                    <p>&copy; {new Date().getFullYear()} Philippine Family Foundation. All Rights Reserved.</p>
                    <p className="mt-1 text-gold/30 italic">Commitment to Education, Health, and Environment.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
