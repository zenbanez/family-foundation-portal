import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Target, TrendingUp, Handshake, Sprout, HeartPulse, GraduationCap, Vote, ArrowRight, ShieldCheck, ScrollText, Award, Heart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';

const Dashboard = () => {
    const { user } = useAuth();
    const [recentProposals, setRecentProposals] = useState([]);
    const [loadingProposals, setLoadingProposals] = useState(true);
    const [endowmentData, setEndowmentData] = useState({ currentCommitted: 450000, targetAmount: 1000000 });

    useEffect(() => {
        // Fetch Endowment status
        const unsubscribeEndowment = onSnapshot(doc(db, 'fundingItems', 'endowment-seed'), (doc) => {
            if (doc.exists()) {
                setEndowmentData(doc.data());
            }
        });

        // Fetch more proposals to ensure we capture Top Priority items, then sort
        const q = query(
            collection(db, 'proposals'),
            orderBy('timestamp', 'desc'),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const proposals = [];
            snapshot.forEach((doc) => {
                proposals.push({ id: doc.id, ...doc.data() });
            });

            // Filter for active only (handle cases where status might be missing)
            const activeOnly = proposals.filter(p => p.status === 'active' || !p.status);

            // Sort: Top Priority first, then by timestamp (desc)
            const sorted = activeOnly.sort((a, b) => {
                const aPri = a.category === 'Top Priority';
                const bPri = b.category === 'Top Priority';
                if (aPri && !bPri) return -1;
                if (!aPri && bPri) return 1;
                return 0; // Preserve timestamp order from query
            });

            setRecentProposals(sorted.slice(0, 3));
            setLoadingProposals(false);
        }, (error) => {
            console.error("Error fetching dashboard proposals:", error);
            setLoadingProposals(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="space-y-8 pb-12">
            {/* Top Section: Hero & Impact Summary */}
            <section className="grid lg:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 glass p-10 rounded-[2.5rem] text-left relative overflow-hidden flex flex-col justify-center bg-gradient-to-br from-navy to-navy-light shadow-2xl shadow-navy/20"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="relative z-10 space-y-4">
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                            For the future of the <br />
                            <span className="text-gold uppercase">BAÑEZ FAMILY</span>
                        </h1>
                        <p className="text-slate-300 text-lg max-w-xl font-medium leading-relaxed">
                            Building a legacy through collective action in education, health, and environmental stewardship.
                        </p>
                    </div>
                </motion.div>

                {/* Compact Endowment Tracker */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass p-8 rounded-[2.5rem] flex flex-col justify-between border-t-4 border-gold shadow-xl shadow-gold/5 bg-white"
                >
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gold">
                            <Target size={20} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Endowment Goal</span>
                        </div>
                        <h2 className="text-2xl font-black text-navy leading-none">₱{endowmentData.targetAmount?.toLocaleString()}</h2>
                    </div>

                    <div className="space-y-4 py-6">
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Committed</span>
                                <span className="text-xl font-black text-navy">₱{endowmentData.currentCommitted?.toLocaleString()}</span>
                            </div>
                            <span className="text-2xl font-black text-gold">
                                {((endowmentData.currentCommitted / (endowmentData.targetAmount || 1)) * 100).toFixed(0)}%
                            </span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(endowmentData.currentCommitted / (endowmentData.targetAmount || 1)) * 100}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="h-full bg-navy relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gold/20" />
                            </motion.div>
                        </div>
                    </div>

                </motion.div>
            </section>

            {/* Main Bento Grid */}
            <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Charter Tile */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="lg:col-span-1 glass p-8 rounded-[2rem] text-left space-y-6 flex flex-col justify-between group hover:border-gold/30 transition-all bg-white"
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-gold">
                            <Award size={20} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Our Purpose</span>
                        </div>
                        <p className="text-xl font-bold text-navy leading-snug">
                            "To steward our family’s blessings in service of others, creating meaningful impact across generations."
                        </p>
                    </div>
                    <div className="pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-2 text-navy mb-2">
                            <ScrollText size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Our Mission</span>
                        </div>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed">
                            Structured, collaborative giving aligned with our family values.
                        </p>
                    </div>
                </motion.div>

                {/* Core Values Tile */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="glass p-8 rounded-[2rem] text-left space-y-4 bg-white"
                >
                    <div className="flex items-center gap-2 text-navy mb-2">
                        <Heart size={20} className="text-red-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Core Values</span>
                    </div>
                    <div className="grid gap-2">
                        {[
                            { title: "Stewardship", sub: "over ownership" },
                            { title: "Unity", sub: "over division" },
                            { title: "Transparency", sub: "over suspicion" },
                            { title: "Service", sub: "over recognition" },
                            { title: "Legacy", sub: "over ego" }
                        ].map((value, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100/50 group hover:border-gold/30 hover:bg-white transition-all">
                                <span className="text-xs font-bold text-navy">{value.title}</span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-gold transition-colors">{value.sub}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Proposals Tile */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-1 glass p-8 rounded-[2rem] flex flex-col bg-white"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-navy">
                            <Vote size={20} className="text-gold" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Active Proposals</span>
                        </div>
                        <a href="#proposals" className="text-[10px] font-black text-navy hover:text-gold uppercase tracking-widest transition-colors flex items-center gap-1">
                            All <ArrowRight size={12} />
                        </a>
                    </div>

                    <div className="flex-1 space-y-3">
                        {loadingProposals ? (
                            <div className="flex justify-center py-10">
                                <div className="w-6 h-6 border-2 border-gold border-t-navy rounded-full animate-spin" />
                            </div>
                        ) : recentProposals.map((proposal) => {
                            const isPriority = proposal.category === 'Top Priority';
                            return (
                                <a
                                    key={proposal.id}
                                    href={`#proposals/${proposal.id}`}
                                    className={`block p-3 rounded-xl border transition-all text-left group relative overflow-hidden ${isPriority
                                        ? 'border-gold bg-gold/5 shadow-md shadow-gold/5'
                                        : 'border-slate-50 hover:border-gold/20 hover:bg-gold/5'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1 relative z-10">
                                        <span className={`text-xs font-bold truncate pr-2 ${isPriority ? 'text-navy' : 'text-navy'}`}>
                                            {proposal.title}
                                        </span>
                                        <span className={`text-[8px] font-black uppercase px-1.5 rounded-sm shrink-0 ${isPriority ? 'bg-navy text-gold' : 'bg-gold/10 text-gold'
                                            }`}>
                                            {proposal.category}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold relative z-10">
                                        <span>By {proposal.creatorName?.split(' ')[0]}</span>
                                        <span>•</span>
                                        <span>{proposal.totalVotes || 0} Votes</span>
                                    </div>
                                    {isPriority && (
                                        <div className="absolute right-0 bottom-0 opacity-10 -mr-2 -mb-2">
                                            <Star size={40} className="fill-gold text-gold" />
                                        </div>
                                    )}
                                </a>
                            );
                        })}
                        {recentProposals.length === 0 && !loadingProposals && (
                            <div className="py-10 text-center text-slate-300 text-xs italic">No active proposals.</div>
                        )}
                    </div>
                </motion.div>
            </section>

            {/* Pillars & Commitment Strip */}
            <section className="grid lg:grid-cols-4 gap-6">
                {/* Pillars (Span 3) */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DensePillar
                        icon={<GraduationCap size={20} />}
                        title="Education"
                        desc="Scholarships & resources."
                        href="#pillar/education"
                    />
                    <DensePillar
                        icon={<HeartPulse size={20} />}
                        title="Health"
                        desc="Medical & wellness."
                        href="#pillar/health"
                    />
                    <DensePillar
                        icon={<Sprout size={20} />}
                        title="Environment"
                        desc="Sustainability goals."
                        href="#pillar/environment"
                    />
                </div>

                {/* Commitments Summary (Span 1) */}
                <div className="bg-navy p-6 rounded-[2rem] flex flex-col justify-center space-y-4 shadow-xl shadow-navy/10 border-b-4 border-navy-bold">
                    <div className="flex items-center gap-2 text-gold">
                        <ShieldCheck size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Principles</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {["Voluntary", "Transparent", "Respectful", "Structured"].map((tag, idx) => (
                            <span key={idx} className="text-[9px] font-black text-white/50 border border-white/10 px-2 py-1 rounded-full bg-white/5">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

const DensePillar = ({ icon, title, desc, href }) => (
    <a href={href} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center gap-4 group hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all text-left">
        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-navy group-hover:bg-gold group-hover:text-navy transition-all shrink-0">
            {icon}
        </div>
        <div>
            <h4 className="text-sm font-black text-navy uppercase tracking-tight">{title}</h4>
            <p className="text-[11px] text-slate-400 font-medium leading-tight">{desc}</p>
        </div>
    </a>
);
const ProposalPreviewCard = ({ proposal }) => (
    <motion.a
        href="#proposals"
        whileHover={{ y: -5 }}
        className="block bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group"
    >
        <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold bg-gold/5 px-2 py-1 rounded">
                {proposal.category}
            </span>
            <div className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                <Vote size={14} className="text-navy/20" />
                {proposal.totalVotes || 0} Votes
            </div>
        </div>
        <h4 className="text-lg font-bold text-navy mb-2 line-clamp-1 group-hover:text-gold transition-colors">
            {proposal.title}
        </h4>
        <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-4">
            {proposal.description}
        </p>
        <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-navy font-bold text-xs uppercase tracking-tighter">
            <span>By {proposal.creatorName?.split(' ')[0]}</span>
            <span className="flex items-center gap-1 text-gold">Vote Now <ArrowRight size={14} /></span>
        </div>
    </motion.a>
);

export default Dashboard;
