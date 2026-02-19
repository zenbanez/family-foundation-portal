import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, setDoc, updateDoc, increment, getDoc, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, ArrowUp, ArrowDown, DollarSign, Users, Info, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Funding = () => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [userCommitments, setUserCommitments] = useState({});
    const [userVotes, setUserVotes] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Listen for funding items
        const q = query(collection(db, 'fundingItems'), orderBy('priorityScore', 'desc'));
        const unsubscribeItems = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                // Auto-seed the Endowment project if empty
                const seedEndowment = async () => {
                    await setDoc(doc(db, 'fundingItems', 'endowment-seed'), {
                        title: "Bañez Family Foundation Endowment",
                        description: "The primary seed capital for our foundation's long-term sustainability. This endowment funds our education, health, and environmental initiatives.",
                        targetAmount: 1000000,
                        currentCommitted: 0,
                        priorityScore: 100,
                        status: 'active',
                        timestamp: new Date().toISOString()
                    });
                };
                seedEndowment();
            }
            const i = [];
            snapshot.forEach((doc) => i.push({ id: doc.id, ...doc.data() }));
            setItems(i);
            setLoading(false);
        });

        // 2. Fetch user's current commitments
        const fetchUserData = () => {
            const unsubscribeCommitments = onSnapshot(collection(db, 'commitments'), (snapshot) => {
                const commitments = {};
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.userId === user.uid) {
                        commitments[data.itemId] = data.amount;
                    }
                });
                setUserCommitments(commitments);
            });

            const unsubscribeVotes = onSnapshot(collection(db, 'fundingVotes'), (snapshot) => {
                const votes = {};
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.userId === user.uid) {
                        votes[data.itemId] = data.voteType;
                    }
                });
                setUserVotes(votes);
            });

            return () => {
                unsubscribeCommitments();
                unsubscribeVotes();
            };
        };

        const cleanupUserData = fetchUserData();
        return () => {
            unsubscribeItems();
            cleanupUserData();
        };
    }, [user.uid]);

    const handleVote = async (itemId, type) => {
        const voteId = `${user.uid}_${itemId}`;
        const voteRef = doc(db, 'fundingVotes', voteId);
        const itemRef = doc(db, 'fundingItems', itemId);
        const currentVote = userVotes[itemId];

        try {
            if (currentVote === type) {
                // Remove vote if clicking same button
                await setDoc(voteRef, { userId: user.uid, itemId, voteType: null });
                await updateDoc(itemRef, {
                    priorityScore: increment(type === 'up' ? -1 : 1)
                });
            } else {
                // Change or add vote
                await setDoc(voteRef, { userId: user.uid, itemId, voteType: type });
                let scoreChange = type === 'up' ? 1 : -1;
                if (currentVote) scoreChange = type === 'up' ? 2 : -2; // Switching from down to up (2) or up to down (-2)

                await updateDoc(itemRef, {
                    priorityScore: increment(scoreChange)
                });
            }
        } catch (err) {
            console.error("Voting error:", err);
        }
    };

    const handleCommit = async (itemId, amount) => {
        const commitmentId = `${user.uid}_${itemId}`;
        const commitmentRef = doc(db, 'commitments', commitmentId);
        const itemRef = doc(db, 'fundingItems', itemId);
        const previousAmount = userCommitments[itemId] || 0;

        try {
            await setDoc(commitmentRef, {
                userId: user.uid,
                itemId,
                amount: Number(amount),
                timestamp: new Date().toISOString()
            });

            await updateDoc(itemRef, {
                currentCommitted: increment(Number(amount) - previousAmount)
            });
        } catch (err) {
            console.error("Commitment error:", err);
            alert("Failed to save commitment.");
        }
    };

    if (loading) return <div className="text-center py-20">Loading funding opportunities...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-left space-y-2">
                <h1 className="text-3xl font-bold text-navy uppercase tracking-tight">Funding Portal</h1>
                <p className="text-slate-500 italic">Direct your resources toward our family's shared goals.</p>
                <div className="w-24 h-1 bg-gold" />
            </div>

            <div className="grid gap-8">
                {items.length > 0 ? (
                    items.map(item => (
                        <FundingCard
                            key={item.id}
                            item={item}
                            userCommitment={userCommitments[item.id]}
                            userVote={userVotes[item.id]}
                            onVote={handleVote}
                            onCommit={handleCommit}
                        />
                    ))
                ) : (
                    <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                        <Info className="mx-auto text-slate-300 mb-4" size={48} />
                        <p className="text-slate-400 font-medium">No funding items available at this time.</p>
                        <p className="text-slate-400 text-sm mt-1">Check back later for new foundation initiatives.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const FundingCard = ({ item, userCommitment, userVote, onVote, onCommit }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [amount, setAmount] = useState(userCommitment || '');
    const progress = Math.min((item.currentCommitted / item.targetAmount) * 100, 100);

    return (
        <div className="glass p-8 rounded-3xl flex flex-col md:flex-row gap-8 items-start relative overflow-hidden group">
            {/* Priority Sidebar */}
            <div className="flex flex-col items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <button
                    onClick={() => onVote(item.id, 'up')}
                    className={`p-2 rounded-xl transition-all ${userVote === 'up' ? 'bg-gold text-white' : 'hover:bg-gold/10 text-slate-400'}`}
                >
                    <ArrowUp size={20} />
                </button>
                <span className="font-bold text-navy">{item.priorityScore || 0}</span>
                <button
                    onClick={() => onVote(item.id, 'down')}
                    className={`p-2 rounded-xl transition-all ${userVote === 'down' ? 'bg-navy text-white' : 'hover:bg-navy/10 text-slate-400'}`}
                >
                    <ArrowDown size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-grow space-y-6">
                <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-navy">{item.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{item.description}</p>
                </div>

                {/* Progress Tracking */}
                <div className="space-y-3 bg-white/50 p-6 rounded-2xl border border-white/20">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Committed</span>
                            <div className="text-2xl font-black text-navy">
                                ₱{item.currentCommitted?.toLocaleString()}
                                <span className="text-slate-300 font-normal text-lg ml-2">/ ₱{item.targetAmount?.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-3xl font-black text-gold">{progress.toFixed(0)}%</span>
                        </div>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-navy relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gold/30 animate-pulse" />
                        </motion.div>
                    </div>
                </div>

                {/* Action Items */}
                <div className="flex flex-wrap items-center gap-4">
                    {isEditing ? (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 transition-all">
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Amount"
                                    className="pl-8 pr-4 py-2 w-32 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-gold/50"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    onCommit(item.id, amount);
                                    setIsEditing(false);
                                }}
                                className="btn-primary py-2 px-6"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-slate-400 hover:text-navy text-sm font-bold p-2"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 bg-navy text-white px-6 py-3 rounded-xl font-bold hover:bg-navy/90 transition-all shadow-lg shadow-navy/10"
                        >
                            <TrendingUp size={18} />
                            {userCommitment ? 'Update Commitment' : 'Commit Funds'}
                        </button>
                    )}

                    {userCommitment > 0 && !isEditing && (
                        <div className="flex items-center gap-2 text-gold font-bold bg-gold/5 px-4 py-2 rounded-xl border border-gold/10">
                            <Users size={16} />
                            Your Commitment: ₱{userCommitment.toLocaleString()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Funding;
