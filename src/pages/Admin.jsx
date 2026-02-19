import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, setDoc, updateDoc, deleteDoc, orderBy, addDoc } from 'firebase/firestore';
import { RefreshCcw, Plus, Trash2, Award, UserPlus, ShieldAlert, TrendingUp, Target, Save, Vote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Admin = () => {
    const [loading, setLoading] = useState(false);
    const [whitelist, setWhitelist] = useState([]);
    const [fundingItems, setFundingItems] = useState([]);
    const [proposals, setProposals] = useState([]);

    // Form States
    const [newEmail, setNewEmail] = useState('');
    const [newFunding, setNewFunding] = useState({ title: '', description: '', targetAmount: '' });
    const [endowmentValue, setEndowmentValue] = useState(0);

    useEffect(() => {
        // 1. Listen for Whitelist
        const unsubscribeWhitelist = onSnapshot(collection(db, 'whitelist'), (snapshot) => {
            const list = [];
            snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
            setWhitelist(list);
        });

        // 2. Listen for Funding Items
        const unsubscribeFunding = onSnapshot(query(collection(db, 'fundingItems'), orderBy('timestamp', 'desc')), (snapshot) => {
            const list = [];
            snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
            setFundingItems(list);
        });

        // 3. Listen for Proposals
        const unsubscribeProposals = onSnapshot(query(collection(db, 'proposals'), orderBy('timestamp', 'desc')), (snapshot) => {
            const list = [];
            snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
            setProposals(list);
        });

        // 4. Fetch Endowment Seed
        const unsubscribeEndowment = onSnapshot(doc(db, 'fundingItems', 'endowment-seed'), (doc) => {
            if (doc.exists()) {
                setEndowmentValue(doc.data().currentCommitted);
            }
        });

        return () => {
            unsubscribeWhitelist();
            unsubscribeFunding();
            unsubscribeProposals();
            unsubscribeEndowment();
        };
    }, []);

    const handleAddWhitelist = async (e) => {
        e.preventDefault();
        if (!newEmail.includes('@')) return alert("Invalid email");
        setLoading(true);
        try {
            const email = newEmail.toLowerCase().trim();
            await setDoc(doc(db, 'whitelist', email), {
                email,
                addedAt: new Date().toISOString(),
                role: 'member'
            });
            setNewEmail('');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveWhitelist = async (email) => {
        if (!window.confirm(`Remove ${email} from whitelist?`)) return;
        try {
            await deleteDoc(doc(db, 'whitelist', email));
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateFunding = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addDoc(collection(db, 'fundingItems'), {
                ...newFunding,
                targetAmount: Number(newFunding.targetAmount),
                currentCommitted: 0,
                priorityScore: 0,
                status: 'active',
                timestamp: new Date().toISOString()
            });
            setNewFunding({ title: '', description: '', targetAmount: '' });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEndowment = async () => {
        setLoading(true);
        try {
            await updateDoc(doc(db, 'fundingItems', 'endowment-seed'), {
                currentCommitted: Number(endowmentValue)
            });
            alert("SEC Endowment updated!");
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProposal = async (id) => {
        if (!window.confirm("Delete this proposal permanently?")) return;
        try {
            await deleteDoc(doc(db, 'proposals', id));
        } catch (err) {
            console.error(err);
        }
    };

    const resetVotes = async () => {
        if (!window.confirm('Are you sure you want to reset ALL votes? This cannot be undone.')) return;
        setLoading(true);
        try {
            // 1. Delete all from 'votes' collection
            const votesSnap = await getDocs(collection(db, 'votes'));
            for (const vDoc of votesSnap.docs) {
                await deleteDoc(doc(db, 'votes', vDoc.id));
            }

            // 2. Reset proposals counts
            const proposalsSnap = await getDocs(collection(db, 'proposals'));
            for (const pDoc of proposalsSnap.docs) {
                const data = pDoc.data();
                const resetVotesMap = {};
                if (data.options) {
                    Object.keys(data.options).forEach(optId => {
                        resetVotesMap[optId] = 0;
                    });
                }
                await updateDoc(doc(db, 'proposals', pDoc.id), {
                    votes: resetVotesMap,
                    totalVotes: 0
                });
            }

            // 3. Reset member flags
            const membersSnap = await getDocs(collection(db, 'members'));
            for (const mDoc of membersSnap.docs) {
                await updateDoc(doc(db, 'members', mDoc.id), {
                    hasVoted: false,
                    votes: {}
                });
            }

            alert('All system votes have been successfully reset.');
        } catch (err) {
            console.error("Reset Error:", err);
            alert("Failed to reset votes: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                <div className="space-y-1 text-left">
                    <h1 className="text-3xl font-black text-navy uppercase tracking-tighter">Admin Console</h1>
                    <p className="text-slate-500 font-medium">Foundation Governance & Access Control</p>
                </div>
                <div className="flex items-center gap-2 text-gold font-bold bg-navy px-6 py-3 rounded-2xl text-sm border-b-4 border-navy-bold">
                    <Award size={18} /> Founding Member Access
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* 1. Whitelist Management */}
                <div className="lg:col-span-1 space-y-6">
                    <section className="glass p-8 rounded-3xl space-y-6 border-t-4 border-gold">
                        <div className="flex items-center gap-3 text-navy">
                            <UserPlus size={24} className="text-gold" />
                            <h2 className="text-xl font-bold uppercase tracking-tight">Whitelist</h2>
                        </div>

                        <form onSubmit={handleAddWhitelist} className="space-y-3">
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="Add family email..."
                                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gold/30 outline-none transition-all"
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-navy text-white rounded-xl py-3 font-bold hover:bg-navy/90 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={18} /> Add Member
                            </button>
                        </form>

                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {whitelist.map(m => (
                                <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
                                    <span className="text-sm font-medium text-navy truncate">{m.email}</span>
                                    <button
                                        onClick={() => handleRemoveWhitelist(m.email)}
                                        className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* 2. Funding & Prosposals Management */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Endowment Sync */}
                    <section className="bg-navy text-white p-8 rounded-3xl shadow-xl shadow-navy/20 relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="space-y-2 text-left">
                                <div className="flex items-center gap-2 text-gold">
                                    <Target size={20} />
                                    <span className="text-xs font-black uppercase tracking-widest">Endowment Sync</span>
                                </div>
                                <h3 className="text-2xl font-bold">Manual SEC Balance Override</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₱</span>
                                    <input
                                        type="number"
                                        value={endowmentValue}
                                        onChange={(e) => setEndowmentValue(e.target.value)}
                                        className="bg-white/10 border border-white/20 rounded-xl py-3 pl-8 pr-4 text-white font-bold outline-none focus:bg-white/20 transition-all"
                                    />
                                </div>
                                <button
                                    onClick={handleUpdateEndowment}
                                    disabled={loading}
                                    className="bg-gold text-navy p-3 rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
                                >
                                    <Save size={24} />
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Add Funding Item */}
                    <section className="glass p-8 rounded-3xl space-y-6">
                        <div className="flex items-center gap-3 text-navy">
                            <TrendingUp size={24} className="text-gold" />
                            <h2 className="text-xl font-bold uppercase tracking-tight text-left">New Funding Item</h2>
                        </div>

                        <form onSubmit={handleCreateFunding} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <input
                                    type="text"
                                    placeholder="Project Title (e.g. Healthcare Assistance Fund)"
                                    value={newFunding.title}
                                    onChange={(e) => setNewFunding({ ...newFunding, title: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gold/30 outline-none"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <textarea
                                    placeholder="Description"
                                    value={newFunding.description}
                                    onChange={(e) => setNewFunding({ ...newFunding, description: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gold/30 outline-none"
                                    rows="2"
                                    required
                                />
                            </div>
                            <div>
                                <input
                                    type="number"
                                    placeholder="Target Amount (₱)"
                                    value={newFunding.targetAmount}
                                    onChange={(e) => setNewFunding({ ...newFunding, targetAmount: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gold/30 outline-none"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-gold text-navy font-bold rounded-xl py-3 hover:bg-gold/90 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={18} /> Create Funding Project
                            </button>
                        </form>
                    </section>

                    {/* Proposals Moderation */}
                    <section className="glass p-8 rounded-3xl space-y-6">
                        <div className="flex items-center gap-3 text-navy">
                            <Vote size={24} className="text-gold" />
                            <h2 className="text-xl font-bold uppercase tracking-tight text-left">Proposal Moderation</h2>
                        </div>
                        <div className="space-y-3">
                            {proposals.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl group hover:shadow-md transition-all">
                                    <div className="text-left">
                                        <p className="font-bold text-navy">{p.title}</p>
                                        <p className="text-xs text-slate-400">By {p.creatorName || 'Anonymous'}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteProposal(p.id)}
                                        className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            {proposals.length === 0 && <p className="text-slate-400 italic text-sm py-4 text-center">No proposals found.</p>}
                        </div>
                    </section>

                    {/* System Maintenance */}
                    <section className="bg-red-50/50 border-2 border-red-100 p-8 rounded-3xl space-y-4">
                        <div className="flex items-center gap-3 text-red-600">
                            <ShieldAlert size={24} />
                            <h2 className="text-xl font-bold uppercase tracking-tight text-left">Danger Zone</h2>
                        </div>
                        <p className="text-sm text-red-500/80 font-medium text-left">Administrative actions that reset or clear system state. Use with extreme caution.</p>
                        <button
                            onClick={resetVotes}
                            disabled={loading}
                            className="bg-white text-red-600 border border-red-200 px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
                        >
                            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} /> Reset All System Votes
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Admin;
