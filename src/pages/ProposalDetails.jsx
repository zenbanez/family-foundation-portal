import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, addDoc, updateDoc, increment, orderBy, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, MessageSquare, Send, ThumbsUp, ThumbsDown, User, Calendar, ShieldAlert, Archive, PauseCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProposalDetails = ({ proposal, onBack, totalWhitelisted }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(false);
    const participation = totalWhitelisted > 0 ? ((proposal.totalVotes || 0) / totalWhitelisted) * 100 : 0;

    useEffect(() => {
        const commentsRef = collection(db, 'proposals', proposal.id, 'comments');
        const q = query(commentsRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const c = [];
            snapshot.forEach(doc => c.push({ id: doc.id, ...doc.data() }));
            setComments(c);
        });

        return () => unsubscribe();
    }, [proposal.id]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setLoading(true);
        try {
            await addDoc(collection(db, 'proposals', proposal.id, 'comments'), {
                text: commentText,
                userId: user.uid,
                userName: user.displayName || 'Member',
                photoURL: user.photoURL || null,
                timestamp: new Date().toISOString()
            });
            setCommentText('');
        } catch (err) {
            console.error("Comment error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePriority = async (type) => {
        const proposalRef = doc(db, 'proposals', proposal.id);
        try {
            await updateDoc(proposalRef, {
                priorityScore: increment(type === 'up' ? 1 : -1)
            });
        } catch (err) {
            console.error("Priority error:", err);
        }
    };

    const handleAdvancedVote = async (type) => {
        if (window.confirm(`Are you sure you want to cast a vote to ${type} this proposal?`)) {
            const proposalRef = doc(db, 'proposals', proposal.id);
            const userRef = doc(db, 'members', user.uid);
            const voteId = `${user.uid}_${proposal.id}`;
            const voteRef = doc(db, 'votes', voteId);

            try {
                await setDoc(voteRef, {
                    userId: user.uid,
                    proposalId: proposal.id,
                    voteType: 'special',
                    specialType: type,
                    timestamp: new Date().toISOString()
                });

                await updateDoc(proposalRef, {
                    [`advancedVotes.${type}`]: increment(1),
                    totalVotes: increment(1)
                });

                // Trigger UI update in parent if possible, but Firestore snapshot will handle it
                alert(`Vote to ${type} submitted successfully.`);
            } catch (err) {
                console.error("Advanced vote error:", err);
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-navy font-bold transition-all group"
                >
                    <div className="bg-slate-100 p-2 rounded-xl group-hover:bg-navy group-hover:text-white transition-all">
                        <ArrowLeft size={18} />
                    </div>
                    Back to Proposals
                </button>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-widest border border-slate-200">
                        <ShieldAlert size={14} className="text-gold" /> Participation: {participation.toFixed(1)}%
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="glass p-8 rounded-3xl space-y-6 text-left relative overflow-hidden">
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold bg-gold/5 px-3 py-1 rounded-full border border-gold/10">
                                    {proposal.category}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePriority('up')}
                                        className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                                        title="Raise Priority"
                                    >
                                        <ThumbsUp size={18} />
                                    </button>
                                    <span className="font-bold text-navy text-sm">{proposal.priorityScore || 0}</span>
                                    <button
                                        onClick={() => handlePriority('down')}
                                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                        title="Lower Priority"
                                    >
                                        <ThumbsDown size={18} />
                                    </button>
                                </div>
                            </div>
                            <h1 className="text-3xl font-black text-navy leading-tight">{proposal.title}</h1>
                            <p className="text-slate-500 leading-relaxed text-lg whitespace-pre-wrap">{proposal.description}</p>

                            <div className="flex items-center gap-4 pt-4 border-t border-slate-100 mt-6">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                    <Calendar size={14} /> Issued on {new Date(proposal.timestamp).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                    <User size={14} /> Created by {proposal.creatorName || 'Member'}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Comment System */}
                    <section className="space-y-6 text-left">
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                            <MessageSquare size={20} className="text-gold" />
                            <h3 className="text-xl font-black text-navy uppercase tracking-tighter">Governance Deliberation</h3>
                        </div>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            <AnimatePresence initial={false}>
                                {comments.map((comment) => (
                                    <motion.div
                                        key={comment.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm"
                                    >
                                        {comment.photoURL ? (
                                            <img src={comment.photoURL} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-sm" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                                                {comment.userName[0]}
                                            </div>
                                        )}
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-navy text-sm">{comment.userName}</span>
                                                <span className="text-[10px] text-slate-300 font-bold">
                                                    {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 text-sm leading-relaxed">{comment.text}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {comments.length === 0 && (
                                <div className="py-12 text-center text-slate-300 italic text-sm">No deliberation yet. Be the first to speak.</div>
                            )}
                        </div>

                        <form onSubmit={handleAddComment} className="relative">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add your perspective..."
                                className="w-full p-4 pl-6 pr-14 rounded-2xl border-2 border-slate-100 outline-none focus:border-gold/30 focus:ring-4 focus:ring-gold/5 transition-all text-sm font-medium shadow-inner"
                            />
                            <button
                                type="submit"
                                disabled={loading || !commentText.trim()}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-navy text-white rounded-xl hover:bg-gold hover:text-navy transition-all disabled:opacity-50"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </section>
                </div>

                {/* Sidebar: Advanced Governance */}
                <div className="space-y-8 text-left">
                    <section className="glass p-6 rounded-3xl space-y-6 border-t-4 border-navy">
                        <div className="space-y-1">
                            <h4 className="text-sm font-black text-navy uppercase tracking-widest">Special Motions</h4>
                            <p className="text-[10px] text-slate-400 font-bold leading-tight">Emergency actions for proposal status.</p>
                        </div>

                        <div className="grid gap-3">
                            <GovernanceAction
                                icon={<CheckCircle2 size={16} />}
                                label="Abstain"
                                description="Formally decline to vote"
                                color="slate"
                                onClick={() => handleAdvancedVote('abstain')}
                                count={proposal.advancedVotes?.abstain || 0}
                            />
                            <GovernanceAction
                                icon={<Archive size={16} />}
                                label="Quash"
                                description="Move to reject & archive"
                                color="red"
                                onClick={() => handleAdvancedVote('quash')}
                                count={proposal.advancedVotes?.quash || 0}
                            />
                            <GovernanceAction
                                icon={<PauseCircle size={16} />}
                                label="Defer"
                                description="Request more deliberation"
                                color="amber"
                                onClick={() => handleAdvancedVote('defer')}
                                count={proposal.advancedVotes?.defer || 0}
                            />
                        </div>
                    </section>

                    <section className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">Ballot Statistics</p>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-bold text-navy uppercase">Participation</span>
                                <span className="text-xl font-black text-gold">{participation.toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${participation}%` }}
                                    className="h-full bg-navy"
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium italic">
                                {proposal.totalVotes || 0} out of {totalWhitelisted} registered members have cast their ballots.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

const GovernanceAction = ({ icon, label, description, color, onClick, count }) => {
    const colors = {
        slate: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-600 hover:text-white',
        red: 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white',
        amber: 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-600 hover:text-white'
    };

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left group ${colors[color]}`}
        >
            <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/10">{icon}</div>
                <div className="flex flex-col">
                    <span className="text-sm font-black uppercase tracking-tight">{label}</span>
                    <span className="text-[10px] opacity-70 font-bold">{description}</span>
                </div>
            </div>
            <span className="text-sm font-black opacity-40">{count}</span>
        </button>
    );
};

export default ProposalDetails;
