import { useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, User } from '@firebase/auth';
import { InAuthUser } from '@/models/in_auth_user';
import FirebaseClient from '@/models/firebase_client';

export default function useFirebaseAuth() {
  const [authUser, setAuthUser] = useState<InAuthUser | null>(null);
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(FirebaseClient.getInstance().Auth, provider);
      if (result.user) {
        const res = await fetch('/api/members.add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.user),
        });
        console.log(res);
        console.info(result.user);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const clear = () => {
    setAuthUser(null);
    setLoading(true);
  };
  const signOut = () => FirebaseClient.getInstance().Auth.signOut().then(clear);

  const authStateChanged = (authState: User | null) => {
    if (!authState) {
      setAuthUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setAuthUser({
      uid: authState.uid,
      email: authState?.email,
      photoURL: authState.photoURL,
      displayName: authState.displayName,
    });
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = FirebaseClient.getInstance().Auth.onAuthStateChanged(authStateChanged);
    return () => unsubscribe();
  }, []);

  return {
    authUser,
    loading,
    signInWithGoogle,
    signOut,
  };
}
