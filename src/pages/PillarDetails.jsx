import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, HeartPulse, Sprout, ArrowLeft, Target, TrendingUp, Vote, Calendar, User, ChevronRight } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

const PILLAR_DATA = {
    education: {
        title: "Education",
        icon: <GraduationCap size={48} />,
        color: "text-navy",
        bg: "bg-navy/5",
        border: "border-navy/20",
        tagline: "Empowering the next generation through scholarships and training.",
        description: "We believe that education is the ultimate multiplier. By investing in the academic and professional development of our family members and community partners, we secure a prosperous future for generations to come.",
        goal: "Establish System to Identify and Support Future Scholars"
    },
    health: {
        title: "Health",
        icon: <HeartPulse size={48} />,
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-100",
        tagline: "Ensuring wellness and emergency medical support for all.",
        description: "A healthy family is a resilient family. Our health pillar focuses on proactive wellness programs, medical subsidies, and a rapid-response fund for emergency healthcare needs within our network.",
        goal: "Establish Support System for Health Programs, and a Future Medical Emergency Fund"
    },
    environment: {
        title: "Environment",
        icon: <Sprout size={48} />,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        tagline: "Caring for creation and wisely managing resources entrusted to us",
        description: "The Bañez family legacy is tied to the land. We are committed to sustainable practices, nature preservation, and supporting local environmental stewardship programs in the communities we serve.",
        goal: "Establish Support System for Environmental Stewardship Programs"
    }
};

const PillarDetails = ({ pillarId }) => {
    const pillar = PILLAR_DATA[pillarId] || PILLAR_DATA.education;
    const [proposals, setProposals] = useState([]);
    const [fundingItems, setFundingItems] = useState([]);
    const [loading, setLoading] = useState({ proposals: true, funding: true });

    useEffect(() => {
        setLoading({ proposals: true, funding: true });
        const categoryLabel = pillar.title; // Matches "Education", "Health", "Environment"

        // Fetch Proposals for this pillar
        const qProposals = query(
            collection(db, 'proposals'),
            where('category', '==', categoryLabel),
            orderBy('timestamp', 'desc')
        );

        const unsubscribeProposals = onSnapshot(qProposals, (snapshot) => {
            const list = [];
            snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
            setProposals(list);
            setLoading(prev => ({ ...prev, proposals: false }));
        }, (err) => {
            console.error("Error fetching pillar proposals:", err);
            setLoading(prev => ({ ...prev, proposals: false }));
        });

        // Fetch Funding Items (Endowment parts) for this pillar
        const qFunding = query(
            collection(db, 'fundingItems'),
            where('category', '==', categoryLabel),
            orderBy('timestamp', 'desc')
        );

        const unsubscribeFunding = onSnapshot(qFunding, (snapshot) => {
            const list = [];
            snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
            setFundingItems(list);
            setLoading(prev => ({ ...prev, funding: false }));
        }, (err) => {
            console.error("Error fetching pillar funding:", err);
            setLoading(prev => ({ ...prev, funding: false }));
        });

        return () => {
            unsubscribeProposals();
            unsubscribeFunding();
        };
    }, [pillarId, pillar.title]);

    const isInitialLoading = loading.proposals || loading.funding;

    const goBack = () => {
        window.location.hash = 'dashboard';
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header / Hero */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative overflow-hidden rounded-[3rem] p-12 lg:p-16 border ${pillar.border} ${pillar.bg}`}
            >
                <button
                    onClick={goBack}
                    className="flex items-center gap-2 text-slate-500 hover:text-navy font-bold uppercase tracking-widest text-xs mb-10 transition-colors"
                >
                    <ArrowLeft size={16} /> Dashboard
                </button>

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 relative z-10">
                    <div className="space-y-6 max-w-2xl">
                        <div className={`p-4 rounded-3xl bg-white shadow-xl shadow-navy/5 inline-flex ${pillar.color}`}>
                            {pillar.icon}
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black text-navy tracking-tight">{pillar.title}</h1>
                        <p className="text-xl font-bold text-navy/80 leading-relaxed italic border-l-4 border-gold pl-6">
                            "{pillar.tagline}"
                        </p>
                        <p className="text-lg text-slate-600 leading-relaxed font-medium">
                            {pillar.description}
                        </p>
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-navy/5 border border-slate-100 flex-shrink-0 lg:w-96">
                        <div className="flex items-center gap-2 text-gold mb-4">
                            <Target size={20} />
                            <span className="text-xs font-black uppercase tracking-widest">Key Objective</span>
                        </div>
                        <h3 className="text-2xl font-black text-navy leading-tight mb-6">{pillar.goal}</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span>Pillar Activity</span>
                                <span>{proposals.length + fundingItems.length} Total</span>
                            </div>
                            <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                                <div className="h-full bg-navy w-full" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl -mr-48 -mt-48" />
            </motion.section>

            {/* Content Grid */}
            <div className="grid lg:grid-cols-3 gap-10">
                {/* Active Initiatives */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <h2 className="text-2xl font-black text-navy uppercase tracking-tight flex items-center gap-3">
                            <Vote className="text-gold" /> Active Proposals
                        </h2>
                        <span className="text-xs font-medium text-slate-400">{proposals.length} Items</span>
                    </div>

                    {isInitialLoading ? (
                        <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-gold border-t-navy rounded-full animate-spin" /></div>
                    ) : proposals.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-6">
                            {proposals.map(p => (
                                <InitiativeCard key={p.id} item={p} type="proposal" />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-12 rounded-3xl text-center text-slate-400 font-medium">
                            No active proposals for this category yet.
                        </div>
                    )}
                </div>

                {/* Specific Funding Needs */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <h2 className="text-2xl font-black text-navy uppercase tracking-tight flex items-center gap-3">
                            <Target className="text-gold" /> Funding Focus
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {fundingItems.length > 0 ? fundingItems.map(f => (
                            <InitiativeCard key={f.id} item={f} type="funding" />
                        )) : (
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center text-slate-400 text-sm">
                                All current funding is pooled into the general endowment.
                            </div>
                        )}

                        <div className="glass p-8 rounded-[2rem] bg-navy text-white space-y-4">
                            <h4 className="font-black text-lg">Propose a project?</h4>
                            <p className="text-xs text-white/70 leading-relaxed font-medium">
                                Have an initiative in {pillar.title} that we should consider? Submit a proposal for family deliberation.
                            </p>
                            <a href="#proposals" className="block w-full py-3 bg-gold text-navy rounded-xl text-center text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">
                                Create Proposal
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InitiativeCard = ({ item, type }) => {
    const formatDate = (ts) => {
        if (!ts) return 'Recent';
        try {
            if (typeof ts.toDate === 'function') return ts.toDate().toLocaleDateString();
            return new Date(ts).toLocaleDateString();
        } catch (e) {
            return 'Recent';
        }
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-gold/30 transition-all group flex flex-col justify-between">
            <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-sm ${type === 'proposal' ? 'bg-gold/10 text-gold' : 'bg-navy/10 text-navy'}`}>
                        {type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <Calendar size={12} /> {formatDate(item.timestamp)}
                    </span>
                </div>
                <h4 className="text-lg font-black text-navy group-hover:text-gold transition-colors leading-tight">
                    {item.title}
                </h4>
                <p className="text-sm text-slate-500 font-medium line-clamp-3 leading-relaxed">
                    {item.description}
                </p>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-navy font-black text-[10px]">
                        {item.creatorName?.charAt(0) || 'B'}
                    </div>
                    <span className="text-[10px] font-black text-navy truncate max-w-[80px]">By {item.creatorName?.split(' ')[0] || 'Member'}</span>
                </div>
                {type === 'proposal' ? (
                    <div className="flex items-center gap-1 text-[10px] font-black text-gold">
                        {item.totalVotes || 0} Votes <ChevronRight size={14} />
                    </div>
                ) : (
                    <div className="flex items-center gap-1 text-[10px] font-black text-navy">
                        ₱{item.targetAmount?.toLocaleString()} <ChevronRight size={14} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PillarDetails;
