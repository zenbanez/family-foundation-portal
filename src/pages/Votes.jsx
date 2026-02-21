import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, setDoc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, ChevronRight, BarChart3, Users, Plus } from 'lucide-react';
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

    useEffect(() => {
        // 1. Listen for proposals
        const q = query(collection(db, 'proposals'));
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

        // 2. Fetch user's current votes
        const fetchUserVotes = async () => {
            const userRef = doc(db, 'members', user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                setUserVotes(userSnap.data().votes || {});
            }
        };
        fetchUserVotes();

        return () => {
            if (unsubscribe) unsubscribe();
            if (unsubscribeWhitelist) unsubscribeWhitelist();
        };
    }, [user.uid]);

    const handleVote = async (proposalId, optionId) => {
        if (userVotes[proposalId]) return; // Already voted

        const voteRef = doc(db, 'votes', `${user.uid}_${proposalId}`);
        const proposalRef = doc(db, 'proposals', proposalId);
        const userRef = doc(db, 'members', user.uid);

        try {
            // Logic for multi-select vs single select can be added here
            // For now, assume single select per proposal
            await setDoc(voteRef, {
                userId: user.uid,
                proposalId,
                optionId,
                timestamp: new Date().toISOString()
            });

            // Update proposal count
            await updateDoc(proposalRef, {
                [`votes.${optionId}`]: increment(1),
                totalVotes: increment(1)
            });

            // Update user state
            const newUserVotes = { ...userVotes, [proposalId]: optionId };
            await updateDoc(userRef, { votes: newUserVotes, hasVoted: true });
            setUserVotes(newUserVotes);
        } catch (err) {
            console.error("Voting error:", err);
        }
    };

    const categories = ['Foundation Name', 'Primary Focus', 'Board of Trustees'];

    if (loading) return <div className="text-center py-20">Loading polls...</div>;

    if (view === 'create') {
        return <CreateProposal onBack={() => setView('list')} />;
    }

    if (view === 'details' && selectedProposal) {
        return (
            <ProposalDetails
                proposal={selectedProposal}
                onBack={() => {
                    setView('list');
                    setSelectedProposal(null);
                }}
                totalWhitelisted={totalWhitelisted}
            />
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="text-left space-y-2">
                    <h1 className="text-3xl font-bold text-navy uppercase tracking-tight">Proposals</h1>
                    <p className="text-slate-500 italic">Your voice shapes our collective legacy.</p>
                    <div className="w-24 h-1 bg-gold" />
                </div>

                <button
                    onClick={() => setView('create')}
                    className="btn-primary flex items-center gap-2 px-6"
                >
                    <Plus size={20} /> New Proposal
                </button>
            </div>

            <div className="grid gap-8">
                {categories.map(cat => (
                    <div key={cat} className="space-y-6">
                        <div className="flex items-center gap-2 text-navy border-b border-slate-200 pb-2">
                            <BarChart3 size={20} className="text-gold" />
                            <h2 className="text-xl font-bold uppercase">{cat}</h2>
                        </div>

                        <div className="grid gap-4">
                            {proposals.filter(p => p.category === cat).map(proposal => (
                                <ProposalCard
                                    key={proposal.id}
                                    proposal={proposal}
                                    userVote={userVotes[proposal.id]}
                                    onVote={handleVote}
                                    onViewDetails={() => {
                                        setSelectedProposal(proposal);
                                        setView('details');
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ProposalCard = ({ proposal, userVote, onVote, onViewDetails }) => {
    const totalVotes = proposal.totalVotes || 0;

    return (
        <div className="glass p-6 rounded-2xl space-y-6">
            <div className="space-y-1">
                <h3 className="text-lg font-bold text-navy">{proposal.title}</h3>
                <p className="text-sm text-slate-500">{proposal.description}</p>
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
