import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const DEFAULT_CATEGORIES = [
  "Technologia",
  "Sport",
  "Biznes",
  "Polityka",
  "Kosmos",
];

export const getUserCategories = async (userId: string) => {
  const docRef = doc(db, `users/${userId}`);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data().categories || DEFAULT_CATEGORIES;
  } else {
    await setDoc(docRef, { categories: DEFAULT_CATEGORIES });
    return DEFAULT_CATEGORIES;
  }
};
