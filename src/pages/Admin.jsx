import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, setDoc, updateDoc, deleteDoc, orderBy, addDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { RefreshCcw, Plus, Trash2, Award, UserPlus, ShieldAlert, TrendingUp, Target, Save, Vote, FileText, Upload, HardDrive, Shield } from 'lucide-react';
import { storage, db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';

const Admin = () => {
    const [loading, setLoading] = useState(false);
    const [whitelist, setWhitelist] = useState([]);
    const [members, setMembers] = useState([]);
    const [fundingItems, setFundingItems] = useState([]);
    const [proposals, setProposals] = useState([]);
    const [vaultItems, setVaultItems] = useState([]);
    const [commitments, setCommitments] = useState([]);

    // Form States
    const [newEmail, setNewEmail] = useState('');
    const [newFunding, setNewFunding] = useState({ title: '', description: '', targetAmount: '' });

    // Vault States
    const [vaultFile, setVaultFile] = useState(null);
    const [vaultMeta, setVaultMeta] = useState({ title: '', category: 'Governance' });

    useEffect(() => {
        // 1. Listen for Whitelist
        const unsubscribeWhitelist = onSnapshot(collection(db, 'whitelist'), (snapshot) => {
            const list = [];
            snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
            setWhitelist(list);
        });

        // 1.5. Listen for Members
        const unsubscribeMembers = onSnapshot(collection(db, 'members'), (snapshot) => {
            const list = [];
            snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
            setMembers(list);
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

        // 4. Listen for All Commitments
        const unsubscribeCommitments = onSnapshot(collection(db, 'commitments'), (snapshot) => {
            const list = [];
            snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
            setCommitments(list);
        });

        // 5. Listen for Vault Items
        const unsubscribeVault = onSnapshot(query(collection(db, 'vaultItems'), orderBy('uploadedAt', 'desc')), (snapshot) => {
            const list = [];
            snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
            setVaultItems(list);
        });

        return () => {
            unsubscribeWhitelist();
            unsubscribeMembers();
            unsubscribeFunding();
            unsubscribeProposals();
            unsubscribeCommitments();
            unsubscribeVault();
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

    const handleUpdateRole = async (email, newRole) => {
        setLoading(true);
        try {
            // 1. Update Whitelist
            await updateDoc(doc(db, 'whitelist', email), { role: newRole });

            // 2. Find and Update Member Doc if it exists
            const memberMatch = members.find(m => m.email.toLowerCase() === email.toLowerCase());
            if (memberMatch) {
                await updateDoc(doc(db, 'members', memberMatch.id), { role: newRole });
            }
            alert(`Role updated to ${newRole} for ${email}`);
        } catch (err) {
            console.error(err);
            alert("Update failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveWhitelist = async (email) => {
        if (!window.confirm(`Remove ${email} from whitelist?`)) return;
        setLoading(true);
        try {
            await deleteDoc(doc(db, 'whitelist', email));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
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

    const handleUploadVault = async (e) => {
        e.preventDefault();
        if (!vaultFile || !vaultMeta.title) return alert("Please select a file and enter a title.");

        setLoading(true);
        try {
            const storagePath = `vault/${Date.now()}_${vaultFile.name}`;
            const fileRef = ref(storage, storagePath);

            // 1. Upload to Storage
            await uploadBytes(fileRef, vaultFile);
            const url = await getDownloadURL(fileRef);

            // 2. Save Metadata to Firestore
            await addDoc(collection(db, 'vaultItems'), {
                ...vaultMeta,
                fileName: vaultFile.name,
                fileUrl: url,
                storagePath: storagePath,
                fileSize: vaultFile.size,
                uploadedAt: new Date().toISOString()
            });

            setVaultFile(null);
            setVaultMeta({ title: '', category: 'Governance' });
            alert("Document uploaded to the Vault!");
        } catch (err) {
            console.error(err);
            alert("Upload failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteVault = async (item) => {
        if (!window.confirm("Permanently delete this document?")) return;
        setLoading(true);
        try {
            // 1. Delete from Storage
            const fileRef = ref(storage, item.storagePath);
            await deleteObject(fileRef);

            // 2. Delete from Firestore
            await deleteDoc(doc(db, 'vaultItems', item.id));
        } catch (err) {
            console.error(err);
            alert("Delete failed: " + err.message);
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

            <div className="space-y-12">
                {/* Member Management Section */}
                <section className="glass p-8 rounded-3xl space-y-6 border-t-4 border-gold">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-navy">
                            <UserPlus size={28} className="text-gold" />
                            <div className="text-left">
                                <h2 className="text-2xl font-bold uppercase tracking-tight leading-none">Access Control</h2>
                                <p className="text-xs text-slate-400 font-medium mt-1">Manage family membership and system roles</p>
                            </div>
                        </div>

                        <form onSubmit={handleAddWhitelist} className="flex gap-2">
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="Add family email..."
                                className="flex-1 md:w-64 p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gold/30 outline-none transition-all shadow-inner"
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-navy text-white rounded-xl px-6 py-3 font-bold hover:bg-navy/90 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={18} /> Add
                            </button>
                        </form>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm bg-white">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/50">
                                    <th className="py-4 pl-6">Legitimate Member</th>
                                    <th className="py-4 px-4">Role</th>
                                    <th className="py-4 px-4 text-center">Identity</th>
                                    <th className="py-4 px-4">Last Activity</th>
                                    <th className="py-4 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {whitelist.map(item => {
                                    const memberData = members.find(m => m.email.toLowerCase() === item.email.toLowerCase());
                                    return (
                                        <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                                            <td className="py-5 pl-6">
                                                <div className="flex items-center gap-4">
                                                    {memberData?.photoURL ? (
                                                        <img src={memberData.photoURL} alt="" className="w-12 h-12 rounded-2xl shadow-sm border-2 border-white ring-1 ring-slate-100" />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-bold border-2 border-dashed border-slate-200">
                                                            {item.email[0].toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col text-left">
                                                        <span className="font-bold text-navy truncate max-w-[200px]">{memberData?.displayName || 'Pending Integration'}</span>
                                                        <span className="text-xs text-slate-400 font-medium">{item.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <select
                                                    value={item.role || 'member'}
                                                    onChange={(e) => handleUpdateRole(item.email, e.target.value)}
                                                    className={`text-[10px] font-black uppercase tracking-wider rounded-lg px-3 py-1.5 border-none outline-none focus:ring-2 focus:ring-gold/30 appearance-none cursor-pointer transition-all ${item.role === 'admin'
                                                        ? 'bg-navy text-gold'
                                                        : 'bg-slate-100 text-slate-600'
                                                        }`}
                                                >
                                                    <option value="member">Member</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="py-5 px-4 text-center">
                                                {memberData ? (
                                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black border border-emerald-100">
                                                        <Shield size={10} /> IDENTITY SYNCED
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[10px] font-black">
                                                        MISSING DATA
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-5 px-4">
                                                <div className="flex flex-col text-left">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Last Seen</span>
                                                    <span className="text-xs font-bold text-navy">
                                                        {memberData?.lastLogin
                                                            ? new Date(memberData.lastLogin).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                            : 'Never Connected'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-5 pr-6 text-right">
                                                <button
                                                    onClick={() => handleRemoveWhitelist(item.email)}
                                                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {whitelist.length === 0 && (
                            <div className="py-12 text-center text-slate-400 italic">No whitelisted members found.</div>
                        )}
                    </div>
                </section>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column: Proposals & Endowment */}
                    <div className="space-y-8 text-left">
                        {/* Commitment Ledger */}
                        <section className="bg-navy text-white p-8 rounded-3xl shadow-xl shadow-navy/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-gold/10 transition-all" />
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-gold">
                                            <Target size={20} />
                                            <span className="text-xs font-black uppercase tracking-widest">Commitment Ledger</span>
                                        </div>
                                        <h3 className="text-2xl font-bold">Foundation Pledges</h3>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Pledged</span>
                                        <div className="text-3xl font-black text-gold">
                                            ₱{commitments.reduce((sum, c) => sum + (Number(c.amount) || 0), 0).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[10px] font-black text-white/30 uppercase tracking-widest border-b border-white/5 bg-white/5">
                                                <th className="py-3 pl-4">Member</th>
                                                <th className="py-3 px-4 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {members.map(member => {
                                                const memberTotal = commitments
                                                    .filter(c => c.userId === member.id)
                                                    .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

                                                if (memberTotal === 0) return null;

                                                return (
                                                    <tr key={member.id} className="hover:bg-white/5 transition-colors">
                                                        <td className="py-3 pl-4">
                                                            <div className="flex items-center gap-3">
                                                                {member.photoURL ? (
                                                                    <img src={member.photoURL} alt="" className="w-8 h-8 rounded-lg shadow-sm border border-white/10" />
                                                                ) : (
                                                                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-[10px] font-bold">
                                                                        {member.displayName?.[0] || member.email[0].toUpperCase()}
                                                                    </div>
                                                                )}
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-bold truncate max-w-[120px]">{member.displayName || 'Unknown'}</span>
                                                                    <span className="text-[10px] text-white/40 leading-none">{member.email}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <span className="text-sm font-black text-gold">₱{memberTotal.toLocaleString()}</span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {commitments.length === 0 && (
                                                <tr>
                                                    <td colSpan="2" className="py-8 text-center text-white/20 italic text-xs">No commitments logged yet.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>

                        {/* Add Funding Item */}
                        <section className="glass p-8 rounded-3xl space-y-6">
                            <div className="flex items-center gap-3 text-navy">
                                <TrendingUp size={24} className="text-gold" />
                                <h2 className="text-xl font-bold uppercase tracking-tight">New Funding Item</h2>
                            </div>

                            <form onSubmit={handleCreateFunding} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Project Title (e.g. Healthcare Assistance Fund)"
                                    value={newFunding.title}
                                    onChange={(e) => setNewFunding({ ...newFunding, title: e.target.value })}
                                    className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gold/30 outline-none bg-slate-50/50"
                                    required
                                />
                                <textarea
                                    placeholder="Mission description and impact details..."
                                    value={newFunding.description}
                                    onChange={(e) => setNewFunding({ ...newFunding, description: e.target.value })}
                                    className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gold/30 outline-none bg-slate-50/50"
                                    rows="3"
                                    required
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₱</span>
                                        <input
                                            type="number"
                                            placeholder="Target (₱)"
                                            value={newFunding.targetAmount}
                                            onChange={(e) => setNewFunding({ ...newFunding, targetAmount: e.target.value })}
                                            className="w-full p-4 pl-8 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gold/30 outline-none bg-slate-50/50 text-sm font-bold"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-gold text-navy font-black uppercase text-xs tracking-widest rounded-xl py-4 hover:shadow-xl hover:shadow-gold/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus size={16} /> Deploy Project
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>

                    {/* Right Column: Vault & System */}
                    <div className="space-y-8 text-left">
                        {/* Vault Management */}
                        <section className="glass p-8 rounded-3xl space-y-6 border-b-8 border-gold/10">
                            <div className="flex items-center gap-3 text-navy">
                                <HardDrive size={24} className="text-gold" />
                                <h2 className="text-xl font-bold uppercase tracking-tight">Vault Management</h2>
                            </div>

                            <form onSubmit={handleUploadVault} className="bg-slate-50 p-6 rounded-2xl space-y-4 border border-slate-100">
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Document Name (e.g. SEC Filing 2024)"
                                        value={vaultMeta.title}
                                        onChange={(e) => setVaultMeta({ ...vaultMeta, title: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-gold/30 bg-white"
                                        required
                                    />
                                    <select
                                        value={vaultMeta.category}
                                        onChange={(e) => setVaultMeta({ ...vaultMeta, category: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-gold/30 bg-white"
                                    >
                                        <option>Governance</option>
                                        <option>Financial</option>
                                        <option>SEC</option>
                                        <option>Historical</option>
                                        <option>Bylaws</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="cursor-pointer group">
                                        <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-slate-200 group-hover:border-gold/50 group-hover:bg-gold/5 transition-all text-sm font-medium text-slate-500">
                                            <Upload size={18} className="text-slate-400 group-hover:text-gold" />
                                            <span className="truncate">{vaultFile ? vaultFile.name : "Choose File..."}</span>
                                        </div>
                                        <input type="file" className="hidden" onChange={(e) => setVaultFile(e.target.files[0])} />
                                    </label>
                                    <button
                                        type="submit"
                                        disabled={loading || !vaultFile}
                                        className="w-full bg-navy text-white py-3 rounded-xl font-bold hover:bg-navy/90 transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? <RefreshCcw size={18} className="animate-spin" /> : <Plus size={18} />}
                                        Store in Vault
                                    </button>
                                </div>
                            </form>

                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {vaultItems.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-slate-50 p-2 rounded-lg text-gold group-hover:bg-gold group-hover:text-white transition-colors">
                                                <FileText size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-navy truncate max-w-[140px]">{item.title}</span>
                                                <span className="text-[10px] text-slate-400">{item.category}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteVault(item)} className="text-slate-300 hover:text-red-500 p-1">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* System Danger Zone */}
                        <section className="bg-red-50/50 border-2 border-red-100 p-8 rounded-3xl space-y-4">
                            <div className="flex items-center gap-3 text-red-600">
                                <ShieldAlert size={24} />
                                <h2 className="text-xl font-bold uppercase tracking-tight">Danger Zone</h2>
                            </div>
                            <p className="text-xs text-red-500/80 font-medium leading-relaxed">System-wide reset button for voting cycles. Use only at the start of new governance sessions.</p>
                            <button
                                onClick={resetVotes}
                                disabled={loading}
                                className="w-full bg-white text-red-600 border border-red-200 py-3 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} /> Reset All System Votes
                            </button>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
