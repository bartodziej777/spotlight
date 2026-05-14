import ArticleCard from "@/components/ArticleCard";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/services/firebase";
import { useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

// Definiujemy interfejs danych pobieranych z bazy
interface SavedArticle {
  title: string;
  description: string;
  image: string;
  source: string;
  url: string;
  publishedAt?: string;
}

export default function SavedArticlesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Nasłuchiwanie zmian w dokumencie użytkownika w czasie rzeczywistym
    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const articles = data.savedArticles || [];
          // Odwracamy kolejność, aby najnowsze zapisy były na górze
          setSavedArticles([...articles].reverse());
        }
        setLoading(false);
      },
      (error) => {
        console.error("Błąd pobierania zapisanych artykułów:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#34656e" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={savedArticles}
        keyExtractor={(item, index) => (item.url || index.toString()) + index}
        renderItem={({ item }) => {
          // Dostosowujemy obiekt SavedArticle do formatu oczekiwanego przez ArticleCard
          const formattedArticle = {
            ...item,
            // Gwarantujemy, że publishedAt jest stringiem (wymagane przez ArticleCard)
            publishedAt: item.publishedAt || new Date().toISOString(),
            // Mapujemy string source z bazy na obiekt { name: string }
            source: { name: item.source },
          };

          return (
            <ArticleCard
              article={formattedArticle}
              onPress={() =>
                router.push({
                  pathname: "/article-details",
                  params: {
                    url: item.url,
                    title: item.title,
                    description: item.description,
                    image: item.image,
                    source: item.source,
                  },
                })
              }
            />
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium" style={styles.emptyTitle}>
              Brak zapisanych artykułów
            </Text>
            <Text variant="bodySmall" style={styles.emptySub}>
              Artykuły, które zapiszesz ikoną zakładki, pojawią się tutaj.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#effafb",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#effafb",
  },
  listContent: {
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    marginTop: 100,
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: "#34656e",
    fontWeight: "bold",
  },
  emptySub: {
    textAlign: "center",
    color: "#34656e",
    opacity: 0.6,
    marginTop: 8,
  },
});
