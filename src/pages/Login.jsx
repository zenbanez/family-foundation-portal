import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    Shield, 
    ChevronRight, 
    GraduationCap, 
    HeartPulse, 
    Sprout, 
    Award, 
    Sparkles, 
    X, 
    Menu, 
    LockKeyhole, 
    ShieldAlert,
    Calendar,
    Users,
    ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
    const { login, error } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Scroll to section helper
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setIsMobileMenuOpen(false);
    };

    const pillars = [
        {
            icon: <GraduationCap className="text-gold" size={32} />,
            title: "Educational Grants",
            tagline: "Academic Empowerment",
            description: "Providing tertiary scholarships, direct school support, and academic resource distribution for promising students, unlocking multi-generational opportunities.",
            stats: "15+ Annual Scholars"
        },
        {
            icon: <HeartPulse className="text-gold" size={32} />,
            title: "Healthcare Aid",
            tagline: "Community Wellness",
            description: "Funding critical medical assistance, hospital emergency support, wellness awareness, and basic clinical access for marginalized sectors.",
            stats: "₱250k+ Emergency Funds"
        },
        {
            icon: <Sprout className="text-gold" size={32} />,
            title: "Ecological Stewardship",
            tagline: "Sustainability & Care",
            description: "Promoting local environmental resilience through community reforestation projects, solid waste programs, and conservation actions.",
            stats: "1,200+ Trees Planted"
        }
    ];

    const values = [
        { title: "Stewardship", sub: "Preserving resources with care", detail: "We treat our resources as a trust to be nurtured, ensuring every contribution achieves maximum sustainable impact." },
        { title: "Unity", sub: "Working as one unified body", detail: "Fostering collaboration across family branches to make combined decisions that build collective strength." },
        { title: "Transparency", sub: "Openness in every decision", detail: "Real-time records, active tallies, and visible financial allocations guarantee full accountability." },
        { title: "Service", sub: "Putting our community first", detail: "Focusing initiatives where the community need is highest, providing direct and respectful assistance." },
        { title: "Legacy", sub: "Thinking of future generations", detail: "Building structural governance today that ensures future generations continue our tradition of impact." }
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-navy font-sans relative overflow-x-hidden selection:bg-gold/20 selection:text-navy">
            {/* Header / Sticky Glass Navbar */}
            <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-slate-200/50 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-navy text-gold rounded-xl flex items-center justify-center shadow-md">
                            <Shield size={22} />
                        </div>
                        <div>
                            <span className="font-black text-lg tracking-tight uppercase text-navy leading-none block">BAÑEZ</span>
                            <span className="text-[9px] font-black text-gold uppercase tracking-[0.2em] leading-none">FAMILY FOUNDATION</span>
                        </div>
                    </div>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-8">
                        <button onClick={() => scrollToSection('about')} className="text-xs font-black uppercase tracking-widest text-navy/70 hover:text-gold transition-colors cursor-pointer">About Us</button>
                        <button onClick={() => scrollToSection('pillars')} className="text-xs font-black uppercase tracking-widest text-navy/70 hover:text-gold transition-colors cursor-pointer">Our Pillars</button>
                        <button onClick={() => scrollToSection('values')} className="text-xs font-black uppercase tracking-widest text-navy/70 hover:text-gold transition-colors cursor-pointer">Core Values</button>
                        <button 
                            onClick={() => setIsLoginModalOpen(true)}
                            className="bg-navy text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl border border-navy hover:bg-transparent hover:text-navy transition-all shadow-md shadow-navy/10 cursor-pointer"
                        >
                            Enter Family Portal
                        </button>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="md:hidden p-2 text-navy hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </header>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 md:hidden"
                        />
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-3/4 max-w-sm bg-white border-l border-slate-200 z-50 p-8 flex flex-col md:hidden"
                        >
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                                <span className="font-bold text-navy uppercase tracking-tight">Navigation</span>
                                <button 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-slate-400 hover:text-navy rounded-lg cursor-pointer"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4 flex-grow">
                                <button onClick={() => scrollToSection('about')} className="w-full text-left py-3 px-4 rounded-xl text-navy font-bold uppercase tracking-wider text-sm hover:bg-slate-50 transition-all block cursor-pointer">About Us</button>
                                <button onClick={() => scrollToSection('pillars')} className="w-full text-left py-3 px-4 rounded-xl text-navy font-bold uppercase tracking-wider text-sm hover:bg-slate-50 transition-all block cursor-pointer">Our Pillars</button>
                                <button onClick={() => scrollToSection('values')} className="w-full text-left py-3 px-4 rounded-xl text-navy font-bold uppercase tracking-wider text-sm hover:bg-slate-50 transition-all block cursor-pointer">Core Values</button>
                            </div>

                            <div className="pt-8 border-t border-slate-100 mt-auto">
                                <button 
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        setIsLoginModalOpen(true);
                                    }}
                                    className="w-full py-4 bg-navy text-white text-xs font-black uppercase tracking-widest rounded-xl text-center shadow-lg shadow-navy/10 hover:bg-navy/90 transition-all cursor-pointer"
                                >
                                    Enter Family Portal
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Cinematic Hero Section with Custom generated Background */}
            <section className="relative py-24 md:py-40 px-6 bg-navy text-white overflow-hidden text-center">
                {/* Background Image representing the five pillars */}
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-70 scale-105"
                    style={{ backgroundImage: "url('/ethics_hero_bg.jpg')" }}
                />
                
                {/* Visual Overlays for contrast */}
                <div className="absolute inset-0 bg-gradient-to-b from-navy/30 via-navy/65 to-navy" />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent opacity-10" />

                <div className="max-w-4xl mx-auto relative z-10 space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-gold/15 border border-gold/30 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest text-gold shadow-lg shadow-gold/5"
                    >
                        <Sparkles size={14} className="animate-pulse" /> Fostering Legacy, Fulfilling Trust
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-7xl font-black uppercase tracking-tight leading-[1.05] text-white"
                    >
                        Empowering Communities. <br />
                        <span className="text-gold">Preserving Legacy.</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-300 font-medium text-lg md:text-xl leading-relaxed max-w-3xl mx-auto"
                    >
                        The official governance portal of the <strong className="text-white font-bold">Bañez Family Foundation</strong>. Consolidated under five core values—Stewardship, Unity, Transparency, Service, and Legacy—to coordinate our charitable giving and ensure transparent action.
                    </motion.p>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
                    >
                        <button 
                            onClick={() => setIsLoginModalOpen(true)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gold text-navy px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-white hover:text-navy transition-all shadow-xl shadow-gold/10 cursor-pointer"
                        >
                            Enter Family Portal <ChevronRight size={16} className="text-navy" />
                        </button>
                        <button 
                            onClick={() => scrollToSection('about')}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/20 hover:border-gold hover:text-gold px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all cursor-pointer"
                        >
                            Explore Our Mission <ArrowDown size={16} />
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-24 px-6 bg-navy text-white relative border-t border-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(212,175,87,0.08),transparent)] -z-10" />
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <span className="text-[10px] font-black text-gold uppercase tracking-[0.25em] block">OUR CHARTER FOUNDATION</span>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">"To whom much is given, <br />much is required."</h2>
                    <div className="w-24 h-1 bg-gold mx-auto rounded-full" />
                    <p className="text-slate-300 font-medium text-lg leading-relaxed max-w-3xl mx-auto">
                        Structured governance ensures our charitable giving is not randomized. The <strong className="text-white font-bold">Bañez Family Foundation</strong> establishes an infrastructure of transparent consensus. Registered family members can vote on priorities, coordinate pledges, and download structural governance records securely.
                    </p>
                    <div className="pt-6">
                        <button 
                            onClick={() => setIsLoginModalOpen(true)}
                            className="inline-flex items-center gap-2 border-2 border-gold text-gold hover:bg-gold hover:text-navy px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-gold/5 cursor-pointer"
                        >
                            Sign In to Access Vault <LockKeyhole size={14} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Pillars Section */}
            <section id="pillars" className="py-24 px-6 relative">
                <div className="max-w-7xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <span className="text-[10px] font-black text-gold uppercase tracking-[0.2em] block">AREAS OF SERVICE</span>
                        <h2 className="text-3xl md:text-4xl font-black text-navy uppercase tracking-tight">Spheres of Active Impact</h2>
                        <p className="text-slate-500 font-medium max-w-xl mx-auto">The foundation allocates strategic capital across three core focus areas aligned with our long-term values.</p>
                        <div className="w-20 h-1 bg-navy mx-auto rounded-full" />
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {pillars.map((pillar, idx) => (
                            <motion.div 
                                key={idx}
                                whileHover={{ y: -8 }}
                                className="glass bg-white p-8 rounded-[2rem] border border-slate-100 flex flex-col justify-between hover:shadow-2xl hover:border-gold/30 transition-all text-left"
                            >
                                <div className="space-y-6">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner">
                                        {pillar.icon}
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-[9px] font-black text-gold uppercase tracking-wider block">{pillar.tagline}</span>
                                        <h3 className="font-bold text-xl text-navy uppercase">{pillar.title}</h3>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{pillar.description}</p>
                                    </div>
                                </div>
                                <div className="mt-8 pt-4 border-t border-slate-50 flex justify-between items-center text-xs font-black uppercase tracking-wider text-navy">
                                    <span>Core Impact</span>
                                    <span className="text-gold">{pillar.stats}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section id="values" className="py-24 px-6 bg-slate-100/50 border-t border-b border-slate-200/50 relative">
                <div className="max-w-5xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <span className="text-[10px] font-black text-gold uppercase tracking-[0.2em] block">OUR ETHICS CODE</span>
                        <h2 className="text-3xl md:text-4xl font-black text-navy uppercase tracking-tight">Our Five Governance Values</h2>
                        <div className="w-20 h-1 bg-navy mx-auto rounded-full" />
                    </div>

                    <div className="grid gap-4 max-w-3xl mx-auto">
                        {values.map((v, idx) => (
                            <div 
                                key={idx} 
                                className="glass bg-white p-6 rounded-3xl border border-slate-100 flex flex-col md:flex-row md:items-center gap-4 text-left group hover:border-gold/30 hover:shadow-xl transition-all"
                            >
                                <div className="flex items-center gap-3 shrink-0 md:w-48">
                                    <div className="w-8 h-8 rounded-lg bg-navy/5 flex items-center justify-center font-bold text-navy text-sm font-sans">{idx + 1}</div>
                                    <span className="font-black text-navy uppercase tracking-tight text-base">{v.title}</span>
                                </div>
                                <div className="space-y-1 flex-grow">
                                    <span className="text-[10px] font-black text-gold uppercase tracking-wider block">{v.sub}</span>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{v.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Whitelisted Disclaimer / Secure Notice */}
            <section className="py-20 px-6 max-w-5xl mx-auto">
                <div className="glass bg-gradient-to-br from-white to-slate-50 p-8 md:p-12 rounded-[2.5rem] border border-slate-200/60 shadow-xl flex flex-col md:flex-row items-center gap-8 text-left">
                    <div className="w-16 h-16 bg-navy/5 text-navy rounded-3xl flex items-center justify-center shrink-0 shadow-inner">
                        <LockKeyhole size={28} className="text-gold" />
                    </div>
                    <div className="space-y-2 flex-grow">
                        <h4 className="font-bold text-lg text-navy uppercase">Secure Whitelisted System</h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            Access to standard operations (financial commitments, community proposal creation, priority tallies, and file downloads) is restricted to pre-authorized emails on our secure whitelist. Unregistered family members can coordinate whitelisting via the board admins.
                        </p>
                    </div>
                    <a 
                        href="mailto:zen@banezglobal.com?subject=Bañez%20Family%20Foundation%20-%20Access%20Request"
                        className="w-full md:w-auto shrink-0 bg-navy text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-navy/90 transition-all shadow-md text-center cursor-pointer block"
                    >
                        Request Access
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-navy text-white/50 py-12 border-t border-white/5 text-center text-xs relative">
                <div className="max-w-7xl mx-auto px-6 space-y-6">
                    <div className="flex items-center justify-center gap-2 text-gold">
                        <Shield size={20} />
                        <span className="font-black uppercase tracking-[0.2em]">BAÑEZ FAMILY FOUNDATION</span>
                    </div>
                    <div className="w-12 h-0.5 bg-gold/20 mx-auto" />
                    <div className="space-y-1">
                        <p>&copy; {new Date().getFullYear()} Bañez Family Foundation. All Rights Reserved.</p>
                        <p className="text-[10px] text-white/30 tracking-wide font-medium">From Tacloban City, Philippines to the World</p>
                    </div>
                    <p className="text-gold/30 italic text-[11px]">Commitment to Education, Healthcare, and Ecological Preservation.</p>
                </div>
            </footer>

            {/* Google Authentication Overlay Modal */}
            <AnimatePresence>
                {isLoginModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsLoginModalOpen(false)}
                            className="fixed inset-0 bg-navy/80 backdrop-blur-sm"
                        />

                        {/* Modal Box */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="max-w-md w-full glass bg-white p-8 md:p-10 rounded-[2.5rem] space-y-8 relative z-10 shadow-2xl border-t-4 border-gold"
                        >
                            {/* Close Button */}
                            <button 
                                onClick={() => setIsLoginModalOpen(false)}
                                className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-navy hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>

                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 bg-navy text-gold mx-auto rounded-2xl flex items-center justify-center shadow-lg mb-4">
                                    <Shield size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-navy uppercase tracking-tight leading-none">Authorized Entry</h3>
                                <p className="text-xs text-slate-400 font-semibold tracking-wide">BAÑEZ FAMILY PORTAL</p>
                            </div>

                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-xs font-medium text-left flex items-start gap-2 rounded-r-xl">
                                    <ShieldAlert className="shrink-0 text-red-500" size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button 
                                onClick={login}
                                className="w-full flex items-center justify-between bg-navy text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-navy/95 hover:shadow-xl hover:shadow-navy/10 transition-all group cursor-pointer"
                            >
                                <span className="flex items-center gap-3">
                                    <div className="bg-white p-2 rounded-xl flex items-center justify-center shadow-sm">
                                        <svg width="18" height="18" viewBox="0 0 24 24">
                                            <path
                                                fill="#4285F4"
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            />
                                            <path
                                                fill="#34A853"
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            />
                                            <path
                                                fill="#FBBC05"
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                            />
                                            <path
                                                fill="#EA4335"
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            />
                                        </svg>
                                    </div>
                                    Sign In with Google
                                </span>
                                <ChevronRight className="group-hover:translate-x-1 transition-transform text-gold" size={16} />
                            </button>

                            <p className="text-[10px] text-center text-slate-400 leading-relaxed">
                                Access restricted to pre-registered founding members and family. Credentials and login attempts are monitored under internal security bylaws.
                            </p>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Login;
