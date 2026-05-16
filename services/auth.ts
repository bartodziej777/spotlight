import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";

export const authService = {
  register: (email: string, pass: string) =>
    createUserWithEmailAndPassword(auth, email, pass),

  login: (email: string, pass: string) =>
    signInWithEmailAndPassword(auth, email, pass),

  logout: () => signOut(auth),
};
