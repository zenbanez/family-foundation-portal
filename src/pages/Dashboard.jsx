import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Target, TrendingUp, Handshake, Sprout, HeartPulse, GraduationCap, Vote, ArrowRight } from 'lucide-react';
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

        // Fetch 3 most recent proposals
        const q = query(
            collection(db, 'proposals'),
            orderBy('timestamp', 'desc'),
            limit(3)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const proposals = [];
            snapshot.forEach((doc) => {
                proposals.push({ id: doc.id, ...doc.data() });
            });
            setRecentProposals(proposals);
            setLoadingProposals(false);
        }, (error) => {
            console.error("Error fetching dashboard proposals:", error);
            setLoadingProposals(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <section className="text-center space-y-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold text-navy tracking-tight">
                        For the future of the <span className="text-gold uppercase">BAÑEZ FAMILY</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto mt-4">
                        Building a legacy for the family through collective action in education, health, and environmental stewardship.
                    </p>
                </motion.div>
            </section>

            {/* Endowment Progress */}
            <section className="glass p-8 rounded-2xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gold">
                            <Target size={24} />
                            <span className="font-bold uppercase tracking-wider">Initial Goal</span>
                        </div>
                        <h2 className="text-3xl font-bold text-navy">₱{endowmentData.targetAmount?.toLocaleString()} SEC Endowment</h2>
                        <p className="text-slate-500">The foundation's seed capital for long-term sustainability.</p>
                    </div>

                    <div className="w-full md:w-1/2 space-y-4">
                        <div className="flex justify-between text-sm font-bold">
                            <span className="text-navy">₱{endowmentData.currentCommitted?.toLocaleString()} Raised</span>
                            <span className="text-gold">{((endowmentData.currentCommitted / (endowmentData.targetAmount || 1)) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
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
                </div>
            </section>

            {/* Ongoing Proposals Section */}
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-navy uppercase tracking-widest">Active Proposals</h3>
                        <div className="w-20 h-1 bg-gold mt-2" />
                    </div>
                    <a
                        href="#proposals"
                        className="text-navy font-bold flex items-center gap-2 hover:text-gold transition-colors text-sm uppercase tracking-wider"
                    >
                        View All <ArrowRight size={18} />
                    </a>
                </div>

                {loadingProposals ? (
                    <div className="flex justify-center p-12">
                        <div className="w-8 h-8 border-4 border-gold border-t-navy rounded-full animate-spin" />
                    </div>
                ) : recentProposals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {recentProposals.map((proposal) => (
                            <ProposalPreviewCard key={proposal.id} proposal={proposal} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                        <p className="text-slate-400">No active proposals at the moment.</p>
                        <a href="#proposals" className="text-gold font-bold mt-2 inline-block hover:underline">
                            Submit the first one →
                        </a>
                    </div>
                )}
            </section>

            {/* Foundational Pillars */}
            <section className="space-y-8">
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-navy uppercase tracking-widest">Foundational Pillars</h3>
                    <div className="w-20 h-1 bg-gold mx-auto mt-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <PillarCard
                        icon={<GraduationCap className="text-navy" size={32} />}
                        title="Education"
                        description="Empowering the next generation through scholarships and educational resources."
                    />
                    <PillarCard
                        icon={<HeartPulse className="text-navy" size={32} />}
                        title="Health"
                        description="Providing medical assistance and promoting wellness within our communities."
                    />
                    <PillarCard
                        icon={<Sprout className="text-navy" size={32} />}
                        title="Environment"
                        description="Committing to sustainability and protecting our natural heritage."
                    />
                </div>
            </section>
        </div>
    );
};

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

const PillarCard = ({ icon, title, description }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="pillar-card group"
    >
        <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-gold/10 transition-colors">
            {icon}
        </div>
        <h4 className="text-xl font-bold text-navy mb-2">{title}</h4>
        <p className="text-slate-500 leading-relaxed text-sm">
            {description}
        </p>
    </motion.div>
);

export default Dashboard;
