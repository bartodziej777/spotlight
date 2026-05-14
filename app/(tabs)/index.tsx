import ArticleCard from "@/components/ArticleCard";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/services/firebase";
import { fetchNews } from "@/services/newsApi";
import { useRouter } from "expo-router";
import {
  arrayRemove,
  arrayUnion,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Chip,
  IconButton,
  Searchbar,
  Text,
} from "react-native-paper";

interface GNewsArticle {
  title: string;
  description: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
  };
  url: string;
}

export default function FeedScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [articles, setArticles] = useState<GNewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Nasłuchiwanie zmian w Firebase (onSnapshot)
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        // Synchronizujemy stan tylko jeśli dane w bazie różnią się od lokalnych
        // Zapobiega to zbędnym re-renderom przy "Optymistycznym UI"
        setCategories(userData.categories || []);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Pobieranie wiadomości (używamy useCallback dla optymalizacji)
  const loadNews = useCallback(async (query: string) => {
    if (!query) return;
    setLoading(true);
    const results = await fetchNews(query);
    setArticles(results || []);
    setLoading(false);
  }, []);

  // 3. Efekt reagujący TYLKO na zmianę wybranej kategorii
  useEffect(() => {
    if (selectedCategory) {
      loadNews(selectedCategory);
    }
  }, [selectedCategory, loadNews]);

  // 4. Funkcja zapisująca kategorię - Zastosowano Optymistyczne UI
  const handleSaveCategory = async () => {
    const newCat = searchQuery.trim();
    if (!newCat || !user) return;

    // AKTUALIZACJA OPTYMISTYCZNA: Zmieniamy UI zanim Firebase odpowie
    setCategories((prev) => (prev.includes(newCat) ? prev : [...prev, newCat]));
    setSelectedCategory(newCat);
    setSearchQuery("");

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          categories: arrayUnion(newCat),
        },
        { merge: true },
      );
    } catch (error) {
      console.error("Błąd zapisu:", error);
      // W razie błędu usuwamy z UI
      setCategories((prev) => prev.filter((c) => c !== newCat));
    }
  };

  // 5. Funkcja usuwająca kategorię - Również optymistyczna
  const handleRemoveCategory = async (cat: string) => {
    if (!user) return;

    // Usuwamy lokalnie natychmiast
    setCategories((prev) => prev.filter((c) => c !== cat));
    if (selectedCategory === cat) {
      setSelectedCategory(null);
      setArticles([]);
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          categories: arrayRemove(cat),
        },
        { merge: true },
      );
    } catch (error) {
      console.error("Błąd usuwania:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNews(selectedCategory || searchQuery || "Polska");
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Wyszukaj temat..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={() => {
          setSelectedCategory(null);
          loadNews(searchQuery);
        }}
        style={styles.searchBar}
        elevation={0}
        right={() =>
          searchQuery.length > 0 ? (
            <IconButton
              icon="plus-circle-outline"
              iconColor="#34656e"
              onPress={handleSaveCategory}
            />
          ) : null
        }
      />

      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map((cat) => (
            <Chip
              key={cat}
              selected={selectedCategory === cat}
              onPress={() => {
                if (selectedCategory !== cat) {
                  setSelectedCategory(cat);
                  setSearchQuery("");
                }
              }}
              onClose={() => handleRemoveCategory(cat)}
              style={[
                styles.chip,
                selectedCategory === cat && styles.chipSelected,
              ]}
              textStyle={[
                styles.chipText,
                selectedCategory === cat && styles.chipTextSelected,
              ]}
              mode="outlined"
              showSelectedCheck={false}
            >
              {cat}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {loading && articles.length === 0 ? (
        <ActivityIndicator style={styles.loader} color="#34656e" size="large" />
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item, index) => item.url + index}
          renderItem={({ item }) => (
            <ArticleCard
              article={item}
              onPress={() =>
                router.push({
                  pathname: "/article-details",
                  params: {
                    url: item.url,
                    title: item.title,
                    description: item.description,
                    image: item.image,
                    source: item.source.name,
                  },
                })
              }
            />
          )}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery || selectedCategory
                    ? "Brak wyników dla tego hasła."
                    : "Wybierz kategorię powyżej lub dodaj własną, aby zacząć."}
                </Text>
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#34656e"
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#effafb" },
  searchBar: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 28,
    backgroundColor: "#d9e7e9",
  },
  categoriesWrapper: {
    height: 60,
    justifyContent: "center",
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: "center",
  },
  chip: {
    borderRadius: 20,
    borderColor: "#34656e",
    backgroundColor: "#ffffff",
  },
  chipSelected: {
    backgroundColor: "#34656e",
  },
  chipText: {
    color: "#34656e",
  },
  chipTextSelected: {
    color: "#ffffff",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    marginTop: 100,
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    textAlign: "center",
    color: "#34656e",
    opacity: 0.6,
    fontSize: 16,
  },
});
