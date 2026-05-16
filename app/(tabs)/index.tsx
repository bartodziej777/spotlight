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
  useTheme,
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
  const theme = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [articles, setArticles] = useState<GNewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setCategories(userData.categories || []);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const loadNews = useCallback(async (query: string) => {
    if (!query) return;
    setLoading(true);
    const results = await fetchNews(query);
    setArticles(results || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadNews(selectedCategory);
    }
  }, [selectedCategory, loadNews]);

  const handleSaveCategory = async () => {
    const newCat = searchQuery.trim();
    if (!newCat || !user) return;

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
      setCategories((prev) => prev.filter((c) => c !== newCat));
    }
  };

  const handleRemoveCategory = async (cat: string) => {
    if (!user) return;

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
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Searchbar
        placeholder="Wyszukaj temat..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={() => {
          setSelectedCategory(null);
          loadNews(searchQuery);
        }}
        style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        iconColor={theme.colors.primary}
        elevation={0}
        right={() =>
          searchQuery.length > 0 ? (
            <IconButton
              icon="plus-circle-outline"
              iconColor={theme.colors.primary}
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
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <Chip
                key={cat}
                selected={isSelected}
                onPress={() => {
                  if (selectedCategory !== cat) {
                    setSelectedCategory(cat);
                    setSearchQuery("");
                  }
                }}
                onClose={() => handleRemoveCategory(cat)}
                // closeIconColor={
                //   isSelected ? theme.colors.onPrimary : theme.colors.primary
                // }
                style={[
                  styles.chip,
                  {
                    borderColor: theme.colors.outline,
                    backgroundColor: isSelected
                      ? theme.colors.primary
                      : theme.colors.surface,
                  },
                ]}
                textStyle={{
                  color: isSelected
                    ? theme.colors.onPrimary
                    : theme.colors.primary,
                }}
                mode="outlined"
                showSelectedCheck={false}
              >
                {cat}
              </Chip>
            );
          })}
        </ScrollView>
      </View>

      {loading && articles.length === 0 ? (
        <ActivityIndicator
          style={styles.loader}
          color={theme.colors.primary}
          size="large"
        />
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
                <Text
                  style={[
                    styles.emptyText,
                    { color: theme.colors.onBackground },
                  ]}
                >
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
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]} // Dla systemów Android
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 28,
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
    opacity: 0.7,
    fontSize: 16,
  },
});
