import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';

import {firebaseAuth} from '../../config/firebase';

export const authService = {
  async signUp(
    email: string,
    password: string,
  ): Promise<User> {
    const result =
      await createUserWithEmailAndPassword(
        firebaseAuth,
        email.trim(),
        password,
      );

    return result.user;
  },

  async login(
    email: string,
    password: string,
  ): Promise<User> {
    const result =
      await signInWithEmailAndPassword(
        firebaseAuth,
        email.trim(),
        password,
      );

    return result.user;
  },

  async logout(): Promise<void> {
    await signOut(firebaseAuth);
  },

  subscribe(
    callback: (user: User | null) => void,
  ) {
    return onAuthStateChanged(
      firebaseAuth,
      callback,
    );
  },

  getCurrentUser(): User | null {
    return firebaseAuth.currentUser;
  },
};