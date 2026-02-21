import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { FileText, Download, ExternalLink, Calendar, ShieldCheck, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Vault = () => {
    const [documents, setDocuments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [loading, setLoading] = useState(true);

    const categories = ['All', 'Governance', 'Financial', 'SEC', 'Historical', 'Bylaws'];

    useEffect(() => {
        const q = query(collection(db, 'vaultItems'), orderBy('uploadedAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = [];
            snapshot.forEach(doc => docs.push({ id: doc.id, ...doc.data() }));
            setDocuments(docs);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'All' || doc.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="text-center space-y-3">
                <h1 className="text-4xl font-black text-navy uppercase tracking-tighter">Transparency Vault</h1>
                <p className="text-slate-500 font-medium">Official records and governance infrastructure for the Bañez Family.</p>
                <div className="w-24 h-1.5 bg-gold mx-auto rounded-full" />
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass p-4 rounded-3xl sticky top-4 z-40 shadow-xl shadow-navy/5">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-gold/30 transition-all font-medium"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeCategory === cat
                                    ? 'bg-navy text-gold shadow-lg shadow-navy/20 scale-105'
                                    : 'bg-white text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Document Grid */}
            <div className="grid gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredDocs.map((doc, index) => (
                        <motion.div
                            key={doc.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass group p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-2xl hover:shadow-navy/10 transition-all border-l-8 border-gold"
                        >
                            <div className="flex items-start gap-5 text-left">
                                <div className="w-14 h-14 bg-navy text-gold rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <FileText size={28} />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-xl text-navy group-hover:text-gold transition-colors">{doc.title}</h3>
                                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase flex items-center gap-1.5 border border-emerald-100">
                                            <ShieldCheck size={12} /> VERIFIED
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-slate-400">
                                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded text-[10px] font-black uppercase tracking-widest text-slate-500">{doc.category}</span>
                                        <span className="text-xs italic">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <a
                                    href={doc.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-100 text-navy font-bold py-3 px-6 rounded-2xl hover:bg-slate-200 transition-all text-sm"
                                >
                                    <ExternalLink size={18} /> View
                                </a>
                                <a
                                    href={doc.fileUrl}
                                    download={doc.fileName}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-navy text-white font-bold py-3 px-6 rounded-2xl hover:bg-navy-bold transition-all text-sm shadow-lg shadow-navy/20"
                                >
                                    <Download size={18} /> Download
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {!loading && filteredDocs.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-20 text-center space-y-4 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200"
                    >
                        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-slate-400">
                            <Filter size={32} />
                        </div>
                        <p className="text-slate-500 font-bold">No documents match your search or filter.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}
                            className="text-gold font-black uppercase text-sm hover:underline"
                        >
                            Clear all filters
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Vault;
