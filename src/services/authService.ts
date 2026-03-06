import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';

export interface CloudUser {
  uid: string;
  name: string;
  email: string;
  avatar?: string;
}

export const loginWithEmail = async (email: string, password: string): Promise<CloudUser> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    return {
      uid: user.uid,
      name: user.displayName || email.split('@')[0],
      email: user.email || '',
      avatar: user.photoURL || undefined,
    };
  } catch (error: unknown) {
    console.error('Error signing in:', error);
    if (error instanceof Error) {
      throw new Error(error.message || 'Failed to sign in');
    }
    throw new Error('Failed to sign in');
  }
};

export const signupWithEmail = async (email: string, password: string, name?: string): Promise<CloudUser> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    // Update profile with name if provided
    if (name) {
      await updateProfile(user, { displayName: name });
    }
    
    return {
      uid: user.uid,
      name: name || email.split('@')[0],
      email: user.email || '',
      avatar: user.photoURL || undefined,
    };
  } catch (error: unknown) {
    console.error('Error signing up:', error);
    if (error instanceof Error) {
      throw new Error(error.message || 'Failed to sign up');
    }
    throw new Error('Failed to sign up');
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: unknown) {
    console.error('Error signing out:', error);
    if (error instanceof Error) {
      throw new Error(error.message || 'Failed to sign out');
    }
    throw new Error('Failed to sign out');
  }
};

export const onAuthChange = (callback: (user: CloudUser | null) => void) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      callback({
        uid: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        avatar: user.photoURL || undefined,
      });
    } else {
      callback(null);
    }
  });
};

export const getCurrentUser = (): CloudUser | null => {
  const user = auth.currentUser;
  if (user) {
    return {
      uid: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'User',
      email: user.email || '',
      avatar: user.photoURL || undefined,
    };
  }
  return null;
};


