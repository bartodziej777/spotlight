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
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
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

  const loadNews = async (query: string) => {
    if (!query) return;
    setArticles([]);
    setLoading(true);
    const results = await fetchNews(query);
    setArticles(results || []);
    setLoading(false);
  };

  const handleSaveSearch = async () => {
    if (!searchQuery.trim() || !user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        categories: arrayUnion(searchQuery.trim()),
      });
      const newCat = searchQuery.trim();
      setSelectedCategory(newCat);
      setSearchQuery("");
      loadNews(newCat);
    } catch (error) {
      console.error("Błąd podczas zapisywania kategorii:", error);
    }
  };

  const handleRemoveCategory = async (cat: string) => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        categories: arrayRemove(cat),
      });

      if (selectedCategory === cat) {
        setSelectedCategory(null);
        setArticles([]);
      }
    } catch (error) {
      console.error("Błąd podczas usuwania kategorii:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const query = selectedCategory || searchQuery || "Polska";
    const results = await fetchNews(query);
    setArticles(results || []);
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
              onPress={handleSaveSearch}
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
                setSelectedCategory(cat);
                setSearchQuery("");
                loadNews(cat);
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

      {loading ? (
        <ActivityIndicator style={styles.loader} color="#34656e" size="large" />
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item, index) => index.toString()}
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
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery || selectedCategory
                  ? "Brak wyników dla tego hasła."
                  : "Wybierz kategorię powyżej lub dodaj własną, aby zacząć."}
              </Text>
            </View>
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
