import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const { login, error } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center bg-navy p-4 relative overflow-hidden">
            {/* Background patterns */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl -ml-48 -mb-48" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full glass bg-white p-10 rounded-3xl space-y-8 relative z-10"
            >
                <div className="text-center space-y-2">
                    <div className="w-20 h-20 bg-navy mx-auto rounded-2xl flex items-center justify-center shadow-lg mb-4">
                        <Shield className="text-gold" size={40} />
                    </div>
                    <h1 className="text-2xl font-bold text-navy tracking-tight uppercase">Family Foundation</h1>
                    <p className="text-slate-500">Secure access for founding members and family.</p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <button
                    onClick={login}
                    className="w-full flex items-center justify-between bg-navy text-white px-6 py-4 rounded-xl font-bold hover:bg-navy/90 transition-all group"
                >
                    <span className="flex items-center gap-3">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.svg" className="w-6 h-6 bg-white rounded-full p-1" alt="Google" />
                        Sign in with Google
                    </span>
                    <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-xs text-center text-slate-400">
                    This foundation is dedicated to the legacy of our ancestors and the well-being of future generations.
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
