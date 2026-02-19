import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from 'firebase/auth';
import { collection, query, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log("Auth State Changed. User:", user?.email);
            try {
                if (user) {
                    const normalizedEmail = user.email.toLowerCase();

                    // 1. Check Firestore Whitelist
                    const whitelistRef = collection(db, 'whitelist');
                    const q = query(whitelistRef);
                    const querySnapshot = await getDocs(q);

                    let isWhitelisted = false;

                    if (querySnapshot.empty) {
                        // AUTO-SEED: If the whitelist is completely empty, 
                        // we add the current user (likely the creator) to prevent lockout.
                        console.log("Whitelist empty. Seeding with current user:", normalizedEmail);
                        await setDoc(doc(db, 'whitelist', normalizedEmail), {
                            email: normalizedEmail,
                            addedAt: new Date().toISOString(),
                            role: 'admin'
                        });
                        isWhitelisted = true;
                    } else {
                        // Regular check
                        const whitelistDoc = await getDoc(doc(db, 'whitelist', normalizedEmail));
                        isWhitelisted = whitelistDoc.exists();
                    }

                    console.log("Whitelisted check for", normalizedEmail, ":", isWhitelisted);

                    if (isWhitelisted) {
                        // Ensure user exists in 'members' collection
                        const userRef = doc(db, 'members', user.uid);
                        const userSnap = await getDoc(userRef);

                        if (!userSnap.exists()) {
                            await setDoc(userRef, {
                                email: user.email,
                                displayName: user.displayName,
                                photoURL: user.photoURL,
                                role: 'member',
                                joinedAt: new Date().toISOString(),
                                hasVoted: false,
                                votes: {}
                            });
                        }
                        setUser(user);
                    } else {
                        console.warn("User not in whitelist. Signing out.");
                        await signOut(auth);
                        setError('Access restricted to whitelisted family members.');
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error("Auth observer error:", err);
                setError(`Authentication error: ${err.message}`);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const login = async () => {
        try {
            setError(null);
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            setError(err.message);
        }
    };

    const logout = () => signOut(auth);

    return (
        <AuthContext.Provider value={{ user, loading, error, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
