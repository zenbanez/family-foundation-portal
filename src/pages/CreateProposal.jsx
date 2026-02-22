import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, MinusCircle, Send, ArrowLeft, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CreateProposal = ({ onBack }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Top Priority');
    const [description, setDescription] = useState('');
    const [options, setOptions] = useState(['', '']);

    const categories = ['Top Priority', 'Education', 'Health', 'Environment', 'Governance', 'General'];

    const handleAddOption = () => {
        setOptions([...options, '']);
    };

    const handleRemoveOption = (index) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!title.trim() || !description.trim()) return alert("Please fill in all basic fields.");
        if (options.some(opt => !opt.trim())) return alert("Please fill in all options.");

        setLoading(true);
        console.log("Submitting proposal...", { title, category, options });
        try {
            // Transform options array into an object { "opt1": "Label 1", ... }
            const optionsMap = {};
            const votesMap = {};
            options.forEach((opt, idx) => {
                const id = `opt${idx + 1}`;
                optionsMap[id] = opt;
                votesMap[id] = 0;
            });

            console.log("Saving to Firestore collection 'proposals'...");
            const docRef = await addDoc(collection(db, 'proposals'), {
                title,
                category,
                description,
                options: optionsMap,
                votes: votesMap,
                totalVotes: 0,
                createdBy: user.uid,
                creatorName: user.displayName,
                timestamp: new Date().toISOString()
            });
            console.log("Proposal saved successfully with ID:", docRef.id);

            onBack(); // Return to list view
        } catch (err) {
            console.error("Error adding proposal:", err);
            alert("Failed to save proposal: " + (err.code || err.message));
        } finally {
            console.log("Submission process finished.");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-500 hover:text-navy transition-colors group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back to Proposals
            </button>

            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-navy flex items-center gap-3">
                    <Lightbulb className="text-gold" size={32} />
                    Submit New Proposal
                </h1>
                <p className="text-slate-500">Share your vision for the foundation's next steps.</p>
            </div>

            <form onSubmit={handleSubmit} className="glass p-8 rounded-3xl space-y-6">
                <div className="space-y-4">
                    <label className="block">
                        <span className="text-sm font-bold text-navy uppercase tracking-wider">Category</span>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 p-3 focus:ring-2 focus:ring-gold/50 outline-none"
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </label>

                    <label className="block">
                        <span className="text-sm font-bold text-navy uppercase tracking-wider">Proposal Title</span>
                        <input
                            type="text"
                            placeholder="e.g. Environmental Awareness Program"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 p-3 focus:ring-2 focus:ring-gold/50 outline-none"
                            required
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm font-bold text-navy uppercase tracking-wider">Description</span>
                        <textarea
                            rows="3"
                            placeholder="Provide context and why this is important for our family's legacy..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 p-3 focus:ring-2 focus:ring-gold/50 outline-none"
                            required
                        />
                    </label>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-navy uppercase tracking-wider">Voting Options</span>
                        <button
                            type="button"
                            onClick={handleAddOption}
                            className="text-gold hover:text-navy flex items-center gap-1 text-sm font-bold transition-colors"
                        >
                            <PlusCircle size={16} /> Add Option
                        </button>
                    </div>

                    <div className="space-y-3">
                        <AnimatePresence initial={false}>
                            {options.map((opt, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-center gap-2"
                                >
                                    <div className="flex-grow relative">
                                        <input
                                            type="text"
                                            placeholder={`Option ${index + 1}`}
                                            value={opt}
                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                            className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 pr-10 focus:ring-2 focus:ring-gold/50 outline-none"
                                            required
                                        />
                                    </div>
                                    {options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveOption(index)}
                                            className="text-red-300 hover:text-red-500 transition-colors p-2"
                                        >
                                            <MinusCircle size={20} />
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-navy text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-navy/90 transition-all disabled:opacity-50 shadow-lg shadow-navy/20"
                >
                    {loading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Send size={20} /> Submit Proposal
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default CreateProposal;
