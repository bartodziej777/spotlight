import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

const DEFAULT_CATEGORIES = [
  "Technologia",
  "Sport",
  "Biznes",
  "Polityka",
  "Kosmos",
];

export const isArticleSaved = async (userId: string, articleUrl: string) => {
  const userRef = doc(db, "users", userId);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    const saved = docSnap.data().savedArticles || [];
    return saved.some((a: any) => a.url === articleUrl);
  }
  return false;
};

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

export const toggleSaveArticle = async (
  userId: string,
  article: any,
  isCurrentlySaved: boolean,
) => {
  const userRef = doc(db, "users", userId);

  try {
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) return;

    const userData = docSnap.data();
    const savedArticles = userData.savedArticles || [];

    if (isCurrentlySaved) {
      const updatedArticles = savedArticles.filter(
        (a: any) => a.url !== article.url,
      );
      await updateDoc(userRef, { savedArticles: updatedArticles });
    } else {
      const articleToSave = {
        url: article.url || "",
        title: article.title || "",
        description: article.description || "",
        image: article.image || "",
        source:
          typeof article.source === "object"
            ? article.source.name
            : article.source,
        publishedAt: article.publishedAt || new Date().toISOString(),
      };
      await updateDoc(userRef, { savedArticles: arrayUnion(articleToSave) });
    }
  } catch (error) {
    console.error("Błąd podczas operacji na artykule:", error);
  }
};

export const toggleFavoriteSearch = async (
  userId: string,
  query: string,
  isFavorite: boolean,
) => {
  const userRef = doc(db, "users", userId);
  try {
    await updateDoc(userRef, {
      favoriteSearches: isFavorite ? arrayRemove(query) : arrayUnion(query),
    });
  } catch (error) {
    console.error("Błąd podczas aktualizacji haseł:", error);
  }
};

export const addCategory = async (userId: string, category: string) => {
  const userRef = doc(db, "users", userId);
  try {
    await updateDoc(userRef, {
      categories: arrayUnion(category),
    });
    return true;
  } catch (error) {
    console.error("Błąd podczas dodawania kategorii:", error);
    return false;
  }
};
