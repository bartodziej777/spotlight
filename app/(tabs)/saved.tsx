import ArticleCard from "@/components/ArticleCard";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/services/firebase";
import { useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";

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
  const theme = useTheme();
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const articles = data.savedArticles || [];
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
      <View
        style={[styles.center, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <FlatList
        data={savedArticles}
        keyExtractor={(item, index) => (item.url || index.toString()) + index}
        renderItem={({ item }) => {
          const formattedArticle = {
            ...item,
            publishedAt: item.publishedAt || new Date().toISOString(),
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
            <Text
              variant="titleMedium"
              style={[styles.emptyTitle, { color: theme.colors.onBackground }]}
            >
              Brak zapisanych artykułów
            </Text>
            <Text
              variant="bodySmall"
              style={[
                styles.emptySub,
                { color: theme.colors.onBackground, opacity: 0.6 },
              ]}
            >
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
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    fontWeight: "bold",
  },
  emptySub: {
    textAlign: "center",
    marginTop: 8,
  },
});
