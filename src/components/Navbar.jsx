import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Vote, Shield, Archive, Settings, TrendingUp, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    if (!user) return null;

    const navItems = [
        { icon: <Home size={18} />, label: "Dashboard", href: "#dashboard" },
        { icon: <TrendingUp size={18} />, label: "Funding", href: "#funding" },
        { icon: <Vote size={18} />, label: "Proposals", href: "#proposals" },
        { icon: <Archive size={18} />, label: "Vault", href: "#vault" },
        { icon: <Settings size={18} />, label: "Admin", href: "#admin" },
    ];

    return (
        <nav className="bg-navy text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 -ml-2 text-gold hover:bg-white/10 rounded-lg transition-colors"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>

                        <Shield className="text-gold w-8 h-8" />
                        <span className="font-bold text-lg tracking-tight uppercase">Family Foundation</span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:block">
                        <div className="flex items-baseline space-x-2">
                            {navItems.map((item) => (
                                <NavLink key={item.label} icon={item.icon} label={item.label} href={item.href} />
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-medium leading-none">{user.displayName}</p>
                            <p className="text-[10px] font-black text-gold uppercase tracking-widest mt-1 opacity-80">
                                {user.role || 'Member'}
                            </p>
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

            {/* Mobile Sidebar (Drawer) */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-navy/80 backdrop-blur-sm z-40 md:hidden"
                        />

                        {/* Sidebar */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-3/4 max-w-sm bg-navy border-r border-white/10 z-50 md:hidden flex flex-col p-6 pt-16"
                        >
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="absolute top-4 right-4 p-2 text-gold hover:bg-white/10 rounded-lg"
                            >
                                <X size={24} />
                            </button>

                            <div className="space-y-2 mt-4">
                                {navItems.map((item) => (
                                    <a
                                        key={item.label}
                                        href={item.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-4 px-4 py-3 rounded-xl text-white/70 hover:text-gold hover:bg-white/5 transition-all text-lg font-bold uppercase tracking-wide"
                                    >
                                        <span className="text-gold">{item.icon}</span>
                                        {item.label}
                                    </a>
                                ))}
                            </div>

                            <div className="mt-auto pt-8 border-t border-white/10">
                                <p className="text-xs font-black text-white/50 uppercase tracking-[0.2em] mb-4">Current User</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">
                                        {user.displayName?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{user.displayName}</p>
                                        <p className="text-[10px] font-black text-gold uppercase tracking-widest leading-none mt-1">
                                            {user.role || 'Member'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
};

const NavLink = ({ icon, label, href }) => (
    <a href={href} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:text-gold hover:bg-white/5 transition-all">
        {icon} <span>{label}</span>
    </a>
);

export default Navbar;
