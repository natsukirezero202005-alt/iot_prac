import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0); // forces a refresh after the display name changes

  // Firebase restores the saved session on its own; this just listens for it.
  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          // Admin is a server-set custom claim. The UI uses it only to show/hide pages;
          // the real protection lives in the Firestore Security Rules.
          const token = await firebaseUser.getIdTokenResult();
          setIsAdmin(token.claims.admin === true);
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAdmin,
      loading,
      displayName: user?.displayName || user?.email || '',
      login: (email, password) => signInWithEmailAndPassword(auth, email, password),
      logout: () => signOut(auth),
      async signup(name, email, password) {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName: name });
        // Profile document: users/{uid}. Never contains role/admin fields.
        await setDoc(doc(db, 'users', credential.user.uid), {
          name,
          email,
          createdAt: serverTimestamp(),
        });
        setVersion((v) => v + 1);
        return credential.user;
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, isAdmin, loading, version],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
