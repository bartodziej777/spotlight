import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";

export const authService = {
  // Rejestracja
  register: (email: string, pass: string) =>
    createUserWithEmailAndPassword(auth, email, pass),

  // Logowanie
  login: (email: string, pass: string) =>
    signInWithEmailAndPassword(auth, email, pass),

  // Wylogowanie
  logout: () => signOut(auth),
};
