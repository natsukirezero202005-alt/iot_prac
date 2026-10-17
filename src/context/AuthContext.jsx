import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  // Firebase restores the saved session on its own;
  // this just listens for authentication changes.
  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Admin is a server-set custom claim.
          // Firestore Security Rules provide the real protection.
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

      async login(email, password) {
        const credential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Make sure every authenticated student has a
        // users/{uid} profile document.
        const userRef = doc(db, 'users', credential.user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            name:
              credential.user.displayName ||
              credential.user.email?.split('@')[0] ||
              'Student',
            email: credential.user.email || email,
            createdAt: serverTimestamp(),
          });
        }

        return credential.user;
      },

      logout: () => signOut(auth),

      async signup(name, email, password) {
        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await updateProfile(credential.user, {
          displayName: name,
        });

        // Create the student's profile document.
        // Never contains role/admin fields.
        await setDoc(doc(db, 'users', credential.user.uid), {
          name,
          email,
          createdAt: serverTimestamp(),
        });

        setVersion((v) => v + 1);

        return credential.user;
      },
    }),
    [user, isAdmin, loading, version]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }

  return ctx;
}
