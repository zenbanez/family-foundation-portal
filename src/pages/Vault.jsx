import React from 'react';
import { FileText, Download, ExternalLink, Calendar, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Vault = () => {
    const documents = [
        {
            id: 1,
            title: 'Articles of Incorporation',
            type: 'PDF',
            date: '2026-01-15',
            status: 'Verified',
            description: 'Official registration document filed with the SEC.'
        },
        {
            id: 2,
            title: 'SEC Name Reservation',
            type: 'PDF',
            date: '2026-02-01',
            status: 'Current',
            description: 'Reservation of the placeholder foundation name.'
        },
        {
            id: 3,
            title: 'Initial By-Laws Draft',
            type: 'DOCX',
            date: '2026-02-10',
            status: 'Review',
            description: 'Draft rules governing the foundation operations.'
        }
    ];

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-navy uppercase tracking-tight">Transparency Vault</h1>
                <p className="text-slate-500">Access all official records and governance documents.</p>
                <div className="w-24 h-1 bg-gold mx-auto" />
            </div>

            <div className="grid gap-6">
                {documents.map((doc, index) => (
                    <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-lg transition-all"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-navy/5 rounded-xl flex items-center justify-center text-navy shrink-0">
                                <FileText size={24} />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-lg text-navy">{doc.title}</h3>
                                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                                        <ShieldCheck size={10} /> {doc.status}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500">{doc.description}</p>
                                <div className="flex items-center gap-4 text-xs text-slate-400">
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {doc.date}</span>
                                    <span className="uppercase font-bold text-gold">{doc.type}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <button className="flex-grow md:flex-none btn-secondary text-sm py-2 px-4">
                                <Download size={16} /> Download
                            </button>
                            <button className="flex-grow md:flex-none btn-primary text-sm py-2 px-4">
                                <ExternalLink size={16} /> View
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-gold/5 border border-gold/20 p-6 rounded-2xl text-center">
                <p className="text-slate-600 text-sm">
                    Looking for a specific document? Contact the
                    <span className="font-bold text-navy ml-1 underline cursor-pointer">Founding Member</span>.
                </p>
            </div>
        </div>
    );
};

export default Vault;
