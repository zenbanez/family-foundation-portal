import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Vote, Shield, Archive, Settings, TrendingUp } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <nav className="bg-navy text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <Shield className="text-gold w-8 h-8" />
                        <span className="font-bold text-lg tracking-tight uppercase">Family Foundation</span>
                    </div>

                    <div className="hidden md:block">
                        <div className="flex items-baseline space-x-4">
                            <NavLink icon={<Home size={18} />} label="Dashboard" href="#dashboard" />
                            <NavLink icon={<TrendingUp size={18} />} label="Funding" href="#funding" />
                            <NavLink icon={<Vote size={18} />} label="Proposals" href="#proposals" />
                            <NavLink icon={<Archive size={18} />} label="Vault" href="#vault" />
                            <NavLink icon={<Settings size={18} />} label="Admin" href="#admin" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-medium leading-none">{user.displayName}</p>
                            <p className="text-xs text-gold/80">Member</p>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors text-gold"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            <div className="md:hidden flex justify-around py-3 bg-navy/95 border-t border-white/10">
                <MobileNavLink icon={<Home size={20} />} href="#dashboard" />
                <MobileNavLink icon={<TrendingUp size={20} />} href="#funding" />
                <MobileNavLink icon={<Vote size={20} />} href="#proposals" />
                <MobileNavLink icon={<Archive size={20} />} href="#vault" />
                <MobileNavLink icon={<Settings size={20} />} href="#admin" />
            </div>
        </nav>
    );
};

const NavLink = ({ icon, label, href }) => (
    <a href={href} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:text-gold hover:bg-white/5 transition-all">
        {icon} <span>{label}</span>
    </a>
);

const MobileNavLink = ({ icon, href }) => (
    <a href={href} className="p-2 text-white/70 hover:text-gold transition-colors">
        {icon}
    </a>
);

export default Navbar;
