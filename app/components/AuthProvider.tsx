'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, onAuthStateChanged, User } from '../lib/firebase';
import { getUserProfile, createUserProfile, UserProfile } from '../lib/db';

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    refreshProfile: async () => { }
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshProfile = async () => {
        if (user) {
            const userProfile = await getUserProfile(user.uid);
            setProfile(userProfile);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Check if user profile exists
                let userProfile = await getUserProfile(firebaseUser.uid);

                if (!userProfile) {
                    // Create new profile
                    userProfile = await createUserProfile(
                        firebaseUser.uid,
                        firebaseUser.email || '',
                        firebaseUser.displayName || '',
                        firebaseUser.photoURL || ''
                    );
                }

                setProfile(userProfile);
            } else {
                setProfile(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}
