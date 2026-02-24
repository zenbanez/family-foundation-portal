import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, addDoc, updateDoc, increment, orderBy, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, MessageSquare, Send, ThumbsUp, ThumbsDown, User, Calendar, ShieldAlert, Archive, PauseCircle, CheckCircle2, Settings, Edit, Trash2, X, Check, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { deleteDoc } from 'firebase/firestore';

const ProposalDetails = ({ proposal, onBack, totalWhitelisted }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(false);

    // Edit Mode States
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        title: proposal.title,
        description: proposal.description,
        category: proposal.category,
        options: Object.entries(proposal.options || {}).map(([id, label]) => ({ id, label }))
    });

    const [userVote, setUserVote] = useState(null);

    const participation = totalWhitelisted > 0 ? ((proposal.totalVotes || 0) / totalWhitelisted) * 100 : 0;
    const canManage = user.role === 'admin' || user.uid === proposal.createdBy;
    const categories = ['Top Priority', 'Education', 'Health', 'Environment', 'Governance', 'General'];

    useEffect(() => {
        // Listen for comments
        const commentsRef = collection(db, 'proposals', proposal.id, 'comments');
        const q = query(commentsRef, orderBy('timestamp', 'asc'));

        const unsubscribeComments = onSnapshot(q, (snapshot) => {
            const c = [];
            snapshot.forEach(doc => c.push({ id: doc.id, ...doc.data() }));
            setComments(c);
        });

        // Listen for user's specific vote on this proposal
        const voteRef = doc(db, 'votes', `${user.uid}_${proposal.id}`);
        const unsubscribeVote = onSnapshot(voteRef, (doc) => {
            if (doc.exists()) {
                setUserVote(doc.data());
            }
        });

        return () => {
            unsubscribeComments();
            unsubscribeVote();
        };
    }, [proposal.id, user.uid]);

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

    const handleVote = async (optionId) => {
        if (userVote || loading) return;

        const voteRef = doc(db, 'votes', `${user.uid}_${proposal.id}`);
        const proposalRef = doc(db, 'proposals', proposal.id);
        const userRef = doc(db, 'members', user.uid);

        setLoading(true);
        try {
            await setDoc(voteRef, {
                userId: user.uid,
                proposalId: proposal.id,
                optionId,
                voteType: 'standard',
                timestamp: new Date().toISOString()
            });

            await updateDoc(proposalRef, {
                [`votes.${optionId}`]: increment(1),
                totalVotes: increment(1)
            });

            await updateDoc(userRef, { hasVoted: true });
        } catch (err) {
            console.error("Voting error:", err);
            alert("Failed to cast vote.");
        } finally {
            setLoading(false);
        }
    };

    const handleAdvancedVote = async (type) => {
        if (userVote || loading) return;

        if (window.confirm(`Are you sure you want to cast a vote to ${type} this proposal? This counts as your final ballot for this initiative.`)) {
            const proposalRef = doc(db, 'proposals', proposal.id);
            const userRef = doc(db, 'members', user.uid);
            const voteRef = doc(db, 'votes', `${user.uid}_${proposal.id}`);

            setLoading(true);
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

                await updateDoc(userRef, { hasVoted: true });
            } catch (err) {
                console.error("Advanced vote error:", err);
                alert("Failed to cast special motion.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleArchive = async () => {
        if (window.confirm("Are you sure you want to archive this proposal? It will be moved to the past proposals section.")) {
            setLoading(true);
            try {
                await updateDoc(doc(db, 'proposals', proposal.id), {
                    status: 'archived'
                });
                onBack(); // Go back after archiving
            } catch (err) {
                console.error("Archive error:", err);
                alert("Failed to archive proposal.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDelete = async () => {
        if (proposal.status !== 'archived') {
            alert("Only archived proposals can be deleted. Please archive this proposal first.");
            return;
        }

        if (window.confirm("Are you sure you want to PERMANENTLY delete this proposal? This action cannot be undone.")) {
            setLoading(true);
            try {
                await deleteDoc(doc(db, 'proposals', proposal.id));
                onBack();
            } catch (err) {
                console.error("Delete error:", err);
                alert("Failed to delete proposal.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleUpdate = async () => {
        const proposalRef = doc(db, 'proposals', proposal.id);
        setLoading(true);
        try {
            const optionsMap = {};
            const votesMap = proposal.votes || {};

            editForm.options.forEach(opt => {
                optionsMap[opt.id] = opt.label;
                if (votesMap[opt.id] === undefined) {
                    votesMap[opt.id] = 0;
                }
            });

            await updateDoc(proposalRef, {
                title: editForm.title,
                description: editForm.description,
                category: editForm.category,
                options: optionsMap,
                votes: votesMap
            });
            setIsEditing(false);
        } catch (err) {
            console.error("Update error:", err);
            alert("Failed to update proposal.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 text-left">
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
                <div className="flex items-center gap-4 text-left">
                    <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-widest border border-slate-200">
                        <ShieldAlert size={14} className="text-gold" /> Participation: {participation.toFixed(1)}%
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 text-left">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8 text-left">
                    <section className="glass p-8 rounded-3xl space-y-6 text-left relative overflow-hidden">
                        {/* Admin/Creator Toolbar */}
                        {canManage && (
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-2">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-navy">
                                    <Settings size={14} className="text-gold" /> Management Portal
                                </div>
                                <div className="flex items-center gap-2">
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all border border-slate-100"
                                            >
                                                <X size={14} /> Cancel
                                            </button>
                                            <button
                                                onClick={handleUpdate}
                                                disabled={loading}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20"
                                            >
                                                <Check size={14} /> Save Changes
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-gold hover:bg-gold/5 transition-all border border-gold/10"
                                            >
                                                <Edit size={14} /> Edit
                                            </button>
                                            {proposal.status !== 'archived' ? (
                                                <button
                                                    onClick={handleArchive}
                                                    disabled={loading}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-amber-500 hover:bg-amber-50 transition-all border border-amber-100"
                                                >
                                                    <Archive size={14} /> Archive
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleDelete}
                                                    disabled={loading}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-50 transition-all border border-red-100"
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="relative z-10 space-y-4 text-left">
                            <div className="flex items-center justify-between text-left">
                                {isEditing ? (
                                    <select
                                        value={editForm.category}
                                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                        className="text-[10px] font-black uppercase tracking-[0.2em] text-gold bg-gold/5 px-3 py-1 rounded-full border border-gold/40 outline-none"
                                    >
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                ) : (
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold bg-gold/5 px-3 py-1 rounded-full border border-gold/10">
                                        {proposal.category}
                                    </span>
                                )}
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

                            {isEditing ? (
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={editForm.title}
                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                        className="text-3xl font-black text-navy leading-tight w-full bg-slate-50 border-b-2 border-gold/30 p-2 outline-none focus:border-gold transition-all"
                                    />
                                    <textarea
                                        rows="4"
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        className="text-slate-500 leading-relaxed text-lg w-full bg-slate-50 border-b-2 border-slate-200 p-2 outline-none focus:border-gold transition-all resize-none"
                                    />

                                    <div className="pt-6 space-y-4">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                            <h4 className="text-xs font-black text-navy uppercase tracking-widest">Manage Ballot</h4>
                                            <button
                                                onClick={() => setEditForm({
                                                    ...editForm,
                                                    options: [...editForm.options, { id: `opt_${Date.now()}`, label: '' }]
                                                })}
                                                className="text-gold hover:text-navy text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors"
                                            >
                                                <Plus size={14} /> Add Option
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {editForm.options.map((opt, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={opt.label}
                                                        placeholder={`Option ${idx + 1}`}
                                                        onChange={(e) => {
                                                            const newOpts = [...editForm.options];
                                                            newOpts[idx].label = e.target.value;
                                                            setEditForm({ ...editForm, options: newOpts });
                                                        }}
                                                        className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-sm focus:border-gold outline-none transition-all"
                                                    />
                                                    {editForm.options.length > 2 && (
                                                        <button
                                                            onClick={() => {
                                                                if (proposal.votes?.[opt.id] > 0) {
                                                                    if (!window.confirm("This option already has votes. Removing it will delete those votes. Proceed?")) return;
                                                                }
                                                                setEditForm({
                                                                    ...editForm,
                                                                    options: editForm.options.filter((_, i) => i !== idx)
                                                                });
                                                            }}
                                                            className="p-3 text-red-300 hover:text-red-500 transition-colors"
                                                        >
                                                            <Minus size={20} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-3xl font-black text-navy leading-tight text-left">{proposal.title}</h1>
                                    <p className="text-slate-500 leading-relaxed text-lg whitespace-pre-wrap text-left">{proposal.description}</p>

                                    <div className="pt-8 space-y-4 text-left">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-xs font-black text-navy uppercase tracking-[0.2em]">The Ballot</h4>
                                            {userVote && (
                                                <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                                    <CheckCircle2 size={12} /> Ballot Cast
                                                </span>
                                            )}
                                        </div>
                                        <div className="grid gap-3">
                                            {Object.entries(proposal.options || {}).map(([id, label]) => {
                                                const voteCount = proposal.votes?.[id] || 0;
                                                const percentage = proposal.totalVotes > 0 ? (voteCount / proposal.totalVotes) * 100 : 0;
                                                const isMyVote = userVote?.optionId === id;

                                                return (
                                                    <button
                                                        key={id}
                                                        onClick={() => handleVote(id)}
                                                        disabled={!!userVote || loading}
                                                        className={`relative rounded-2xl p-4 border text-left transition-all group overflow-hidden ${isMyVote
                                                            ? 'border-gold bg-gold/5 ring-2 ring-gold/20'
                                                            : userVote
                                                                ? 'border-slate-100 bg-slate-50/50 opacity-80'
                                                                : 'border-slate-100 bg-slate-50 hover:border-gold/30'
                                                            }`}
                                                    >
                                                        <div
                                                            className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ${isMyVote ? 'bg-gold/20' : 'bg-gold/5'
                                                                }`}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                        <div className="relative z-10 flex items-center justify-between">
                                                            <span className={`font-bold text-sm flex items-center gap-2 ${isMyVote ? 'text-navy' : 'text-navy/80'}`}>
                                                                {isMyVote && <CheckCircle2 size={16} className="text-gold" />}
                                                                {label}
                                                            </span>
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                                {voteCount} Votes ({percentage.toFixed(0)}%)
                                                            </span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {userVote?.voteType === 'special' && (
                                            <div className="p-4 bg-navy/5 rounded-2xl border border-navy/10 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <ShieldAlert size={16} className="text-gold" />
                                                    <span className="text-xs font-bold text-navy uppercase tracking-widest">You have cast a Special Motion:</span>
                                                </div>
                                                <span className="text-xs font-black text-gold uppercase underline decoration-2 underline-offset-4">{userVote.specialType}</span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            <div className="flex items-center gap-4 pt-4 border-t border-slate-100 mt-6 text-left">
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
                    <section className="glass p-6 rounded-3xl space-y-6 border-t-4 border-navy text-left">
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
                                active={userVote?.specialType === 'abstain'}
                                disabled={!!userVote || loading}
                            />
                            <GovernanceAction
                                icon={<Archive size={16} />}
                                label="Quash"
                                description="Move to reject & archive"
                                color="red"
                                onClick={() => handleAdvancedVote('quash')}
                                count={proposal.advancedVotes?.quash || 0}
                                active={userVote?.specialType === 'quash'}
                                disabled={!!userVote || loading}
                            />
                            <GovernanceAction
                                icon={<PauseCircle size={16} />}
                                label="Defer"
                                description="Request more deliberation"
                                color="amber"
                                onClick={() => handleAdvancedVote('defer')}
                                count={proposal.advancedVotes?.defer || 0}
                                active={userVote?.specialType === 'defer'}
                                disabled={!!userVote || loading}
                            />
                        </div>
                    </section>

                    <section className="bg-slate-50 p-6 rounded-3xl border border-slate-200 text-left">
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

const GovernanceAction = ({ icon, label, description, color, onClick, count, active, disabled }) => {
    const colors = {
        slate: active ? 'bg-slate-600 text-white border-slate-600' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-600 hover:text-white',
        red: active ? 'bg-red-600 text-white border-red-600' : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white',
        amber: active ? 'bg-amber-600 text-white border-amber-600' : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-600 hover:text-white'
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left group ${colors[color]} ${disabled && !active ? 'opacity-30 grayscale cursor-not-allowed' : ''
                }`}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${active ? 'bg-white/20' : 'bg-white/20 group-hover:bg-white/10'}`}>{icon}</div>
                <div className="flex flex-col">
                    <span className="text-sm font-black uppercase tracking-tight">{label}</span>
                    <span className="text-[10px] opacity-70 font-bold">{description}</span>
                </div>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-sm font-black opacity-40">{count}</span>
                {active && <span className="text-[8px] font-black uppercase tracking-tighter mt-1 bg-white/20 px-1.5 py-0.5 rounded">Your Vote</span>}
            </div>
        </button>
    );
};

export default ProposalDetails;
