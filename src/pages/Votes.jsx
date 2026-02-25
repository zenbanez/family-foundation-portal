import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, setDoc, updateDoc, increment, getDoc, where, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, ChevronRight, BarChart3, Users, Plus, Search, Filter, Star, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CreateProposal from './CreateProposal';
import ProposalDetails from './ProposalDetails';

const Votes = () => {
    const { user } = useAuth();
    const [proposals, setProposals] = useState([]);
    const [userVotes, setUserVotes] = useState({});
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list', 'create', or 'details'
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [totalWhitelisted, setTotalWhitelisted] = useState(0);

    // UI Optimization States
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [viewStatus, setViewStatus] = useState('active'); // 'active' or 'archived'
    const [expandedCategories, setExpandedCategories] = useState({}); // Track which categories are expanded

    useEffect(() => {
        // 1. Listen for proposals
        const q = query(collection(db, 'proposals'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const p = [];
            snapshot.forEach((doc) => p.push({ id: doc.id, ...doc.data() }));
            setProposals(p);
            setLoading(false);
        });

        // 1.5. Listen for total whitelisted members for participation stats
        const unsubscribeWhitelist = onSnapshot(collection(db, 'whitelist'), (snapshot) => {
            setTotalWhitelisted(snapshot.size);
        });

        // 2. Listen for user's specific votes across all proposals
        const votesRef = collection(db, 'votes');
        const qVotes = query(votesRef, where('userId', '==', user.uid));
        const unsubscribeVotes = onSnapshot(qVotes, (snapshot) => {
            const vMap = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                vMap[data.proposalId] = data.optionId || data.specialType;
            });
            setUserVotes(vMap);
        });

        return () => {
            if (unsubscribe) unsubscribe();
            if (unsubscribeWhitelist) unsubscribeWhitelist();
            if (unsubscribeVotes) unsubscribeVotes();
        };
    }, [user.uid]);

    // Handle deep linking from hash (e.g., #proposals/ID)
    useEffect(() => {
        const handleDeepLink = () => {
            const hash = window.location.hash.replace('#', '');
            if (hash.startsWith('proposals/') && proposals.length > 0) {
                const id = hash.split('/')[1];
                const found = proposals.find(p => p.id === id);
                if (found) {
                    setSelectedProposal(found);
                    setView('details');
                }
            }
        };

        handleDeepLink();
        window.addEventListener('hashchange', handleDeepLink);
        return () => window.removeEventListener('hashchange', handleDeepLink);
    }, [proposals]);

    const handleVote = async (proposalId, optionId) => {
        if (userVotes[proposalId]) return; // Already voted

        const voteRef = doc(db, 'votes', `${user.uid}_${proposalId}`);
        const proposalRef = doc(db, 'proposals', proposalId);
        const userRef = doc(db, 'members', user.uid);

        try {
            await setDoc(voteRef, {
                userId: user.uid,
                proposalId,
                optionId,
                voteType: 'standard',
                timestamp: new Date().toISOString()
            });

            // Update proposal count
            await updateDoc(proposalRef, {
                [`votes.${optionId}`]: increment(1),
                totalVotes: increment(1)
            });

            // Update user status
            await updateDoc(userRef, { hasVoted: true });
        } catch (err) {
            console.error("Voting error:", err);
        }
    };

    const categories = ['Top Priority', 'Education', 'Health', 'Environment', 'Governance', 'General'];

    const filteredProposals = proposals.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
        const matchesStatus = viewStatus === 'active' ? (p.status === 'active' || !p.status) : p.status === 'archived';
        return matchesSearch && matchesCategory && matchesStatus;
    });

    if (loading) return <div className="text-center py-20">Loading polls...</div>;

    if (view === 'create') {
        return <CreateProposal onBack={() => setView('list')} />;
    }

    if (view === 'details' && selectedProposal) {
        return (
            <ProposalDetails
                proposal={selectedProposal}
                onBack={() => {
                    window.location.hash = '#proposals';
                    setView('list');
                    setSelectedProposal(null);
                }}
                totalWhitelisted={totalWhitelisted}
            />
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="text-left space-y-2">
                    <h1 className="text-3xl font-bold text-navy uppercase tracking-tight">Proposals</h1>
                    <p className="text-slate-500 italic">Your voice shapes our collective legacy.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-1 rounded-2xl flex items-center mr-2">
                        <button
                            onClick={() => setViewStatus('active')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewStatus === 'active' ? 'bg-white text-navy shadow-sm' : 'text-slate-400 hover:text-navy'}`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setViewStatus('archived')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewStatus === 'archived' ? 'bg-white text-navy shadow-sm' : 'text-slate-400 hover:text-navy'}`}
                        >
                            Archive
                        </button>
                    </div>
                    <button
                        onClick={() => setViewStatus('active')} // Reset to active if creating
                        onMouseDown={() => setView('create')}
                        className="btn-primary flex items-center gap-2 px-6 shadow-xl shadow-navy/20"
                    >
                        <Plus size={20} /> New Proposal
                    </button>
                </div>
            </div>

            {/* Quick Selection & Search Section */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-gold transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search proposals by title or keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-gold/30 focus:ring-4 focus:ring-gold/5 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
                    {['All', ...categories].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${activeCategory === cat
                                ? 'bg-navy text-gold border-navy shadow-lg shadow-navy/20'
                                : 'bg-white text-slate-400 border-slate-100 hover:border-gold/50 hover:text-navy'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-8">
                {categories.map(cat => {
                    const categoryProposals = filteredProposals.filter(p => p.category === cat);
                    if (categoryProposals.length === 0) return null;
                    if (activeCategory !== 'All' && activeCategory !== cat) return null;

                    const isExpanded = expandedCategories[cat];
                    const displayedProposals = isExpanded ? categoryProposals : categoryProposals.slice(0, 3);

                    return (
                        <div key={cat} className="space-y-6">
                            <div className="flex items-center gap-2 text-navy border-b border-slate-200 pb-2">
                                {cat === 'Top Priority' ? <Star size={20} className="text-gold fill-gold" /> : <BarChart3 size={20} className="text-gold" />}
                                <h2 className="text-xl font-bold uppercase">{cat}</h2>
                            </div>
                            <div className="grid gap-6">
                                {displayedProposals.map(proposal => (
                                    <ProposalCard
                                        key={proposal.id}
                                        proposal={proposal}
                                        userVote={userVotes[proposal.id]}
                                        onVote={handleVote}
                                        onViewDetails={() => {
                                            window.location.hash = `#proposals/${proposal.id}`;
                                            setSelectedProposal(proposal);
                                            setView('details');
                                        }}
                                    />
                                ))}
                            </div>
                            {categoryProposals.length > 3 && !isExpanded && (
                                <motion.button
                                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(212, 175, 55, 0.05)', borderColor: '#D4AF37' }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => setExpandedCategories(prev => ({ ...prev, [cat]: true }))}
                                    className="w-full py-4 bg-white text-navy font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl transition-all border-2 border-dashed border-slate-200 flex items-center justify-center gap-2 group"
                                >
                                    View More ({categoryProposals.length - 3})
                                    <ChevronDown size={14} className="text-gold group-hover:translate-y-0.5 transition-transform" />
                                </motion.button>
                            )}
                        </div>
                    );
                })}

                {/* Legacy/Miscellaneous Catch-all */}
                {(activeCategory === 'All' || !categories.includes(activeCategory)) && filteredProposals.some(p => !categories.includes(p.category)) && (() => {
                    const miscProposals = filteredProposals.filter(p => !categories.includes(p.category));
                    const isExpanded = expandedCategories['Miscellaneous'];
                    const displayedProposals = isExpanded ? miscProposals : miscProposals.slice(0, 3);

                    return (
                        <div className="space-y-6 pt-12">
                            <div className="flex items-center gap-2 text-slate-400 border-b border-slate-200 pb-2">
                                <Filter size={20} />
                                <h2 className="text-xl font-bold uppercase">Miscellaneous / Legacy</h2>
                            </div>
                            <div className="grid gap-4">
                                {displayedProposals.map(proposal => (
                                    <ProposalCard
                                        key={proposal.id}
                                        proposal={proposal}
                                        userVote={userVotes[proposal.id]}
                                        onVote={handleVote}
                                        onViewDetails={() => {
                                            window.location.hash = `#proposals/${proposal.id}`;
                                            setSelectedProposal(proposal);
                                            setView('details');
                                        }}
                                    />
                                ))}
                            </div>
                            {miscProposals.length > 3 && !isExpanded && (
                                <motion.button
                                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(212, 175, 55, 0.05)', borderColor: '#D4AF37' }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => setExpandedCategories(prev => ({ ...prev, 'Miscellaneous': true }))}
                                    className="w-full py-4 bg-white text-navy font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl transition-all border-2 border-dashed border-slate-200 flex items-center justify-center gap-2 group"
                                >
                                    View More ({miscProposals.length - 3})
                                    <ChevronDown size={14} className="text-gold group-hover:translate-y-0.5 transition-transform" />
                                </motion.button>
                            )}
                        </div>
                    );
                })()}

                {filteredProposals.length === 0 && (
                    <div className="py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
                        <p className="text-slate-400 font-bold italic">No proposals found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const ProposalCard = ({ proposal, userVote, onVote, onViewDetails }) => {
    const totalVotes = proposal.totalVotes || 0;
    const isTopPriority = proposal.category === 'Top Priority';

    return (
        <div className={`glass p-8 rounded-[2rem] space-y-6 transition-all relative overflow-hidden group ${isTopPriority ? 'border-2 border-gold ring-4 ring-gold/5 shadow-2xl shadow-gold/10' : ''
            }`}>
            {isTopPriority && (
                <div className="absolute top-0 right-0 bg-gold text-navy px-6 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-tighter shadow-sm flex items-center gap-1.5">
                    <Star size={12} className="fill-navy" /> Featured Initiative
                </div>
            )}

            <div className="space-y-2 text-left">
                <h3 className={`text-xl font-black transition-colors ${isTopPriority ? 'text-navy' : 'text-navy'}`}>
                    {proposal.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{proposal.description}</p>
            </div>

            <div className="grid gap-3">
                {Object.entries(proposal.options || {}).map(([id, label]) => {
                    const votesForOption = proposal.votes?.[id] || 0;
                    const percentage = totalVotes > 0 ? (votesForOption / totalVotes) * 100 : 0;
                    const isSelected = userVote === id;

                    return (
                        <button
                            key={id}
                            onClick={() => onVote(proposal.id, id)}
                            disabled={!!userVote}
                            className={`relative overflow-hidden w-full text-left p-4 rounded-xl border-2 transition-all group ${isSelected
                                ? 'border-gold bg-gold/5'
                                : userVote
                                    ? 'border-slate-100 bg-slate-50 opacity-80'
                                    : 'border-slate-200 hover:border-gold/50'
                                }`}
                        >
                            <div
                                className="absolute left-0 top-0 bottom-0 bg-gold/10 transition-all duration-1000"
                                style={{ width: userVote ? `${percentage}%` : 0 }}
                            />

                            <div className="relative z-10 flex items-center justify-between">
                                <span className="font-semibold text-navy flex items-center gap-2">
                                    {isSelected && <CheckCircle2 size={18} className="text-gold" />}
                                    {label}
                                </span>
                                {userVote && (
                                    <span className="text-xs font-bold text-slate-400">
                                        {votesForOption} votes ({percentage.toFixed(0)}%)
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-tighter">
                    <Users size={14} />
                    {totalVotes} Voted
                </div>
                <button
                    onClick={onViewDetails}
                    className="flex items-center gap-1 text-gold font-bold text-xs uppercase tracking-widest hover:gap-2 transition-all"
                >
                    View Details <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
};

export default Votes;
