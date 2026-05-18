import { User } from 'firebase/auth';
import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    auth.authStateReady().then(() => setLoading(false));

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const ensureUserDoc = async () => {
      const userRef = doc(db, 'users', user.uid);
      try {
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (e) {
        console.error('Error syncing user doc:', e);
      }
    };

    ensureUserDoc();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
