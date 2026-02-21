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
                        <div className="bg-white p-2 rounded-lg flex items-center justify-center shadow-sm">
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                        </div>
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
