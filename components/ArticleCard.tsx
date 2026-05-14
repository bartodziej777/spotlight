import { useAuth } from "@/context/AuthContext"; // Import autoryzacji
import { isArticleSaved, toggleSaveArticle } from "@/services/userService"; // Import funkcji bazy danych
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { IconButton, Surface, Text } from "react-native-paper";

interface Article {
  title: string;
  description: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
  };
  url: string;
}

interface Props {
  article: Article;
  onPress: () => void;
}

export default function ArticleCard({ article, onPress }: Props) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const date = new Date(article.publishedAt).toLocaleDateString("pl-PL");

  useEffect(() => {
    async function checkStatus() {
      if (user) {
        const status = await isArticleSaved(user.uid, article.url);
        setSaved(status);
      }
    }
    checkStatus();
  }, [user, article.url]);

  const handleSavePress = async () => {
    if (!user) return;

    const wasSaved = saved;
    setSaved(!wasSaved);

    await toggleSaveArticle(user.uid, article, wasSaved);
  };

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <Surface style={styles.card} elevation={1}>
        <Image
          source={{
            uri:
              article.image ||
              "https://via.placeholder.com/400x200?text=Brak+zdjęcia",
          }}
          style={styles.image}
        />

        <View style={styles.content}>
          <View style={styles.header}>
            <Text variant="labelMedium" style={styles.sourceName}>
              {article.source.name.toUpperCase()}
            </Text>
            <Text variant="labelSmall" style={styles.date}>
              {date}
            </Text>
          </View>

          <Text variant="titleMedium" style={styles.title} numberOfLines={2}>
            {article.title}
          </Text>

          <Text
            variant="bodySmall"
            style={styles.description}
            numberOfLines={2}
          >
            {article.description}
          </Text>

          <View style={styles.footer}>
            <IconButton
              icon={saved ? "bookmark" : "bookmark-outline"}
              iconColor="#34656e"
              size={24}
              style={{ margin: 0 }}
              onPress={handleSavePress}
            />
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // ... Twoje style pozostają bez zmian
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  image: { width: "100%", height: 180, backgroundColor: "#d9e7e9" },
  content: { padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sourceName: { color: "#006494", fontWeight: "bold", letterSpacing: 1 },
  date: { color: "#666" },
  title: {
    color: "#34656e",
    fontWeight: "bold",
    lineHeight: 22,
    marginBottom: 6,
  },
  description: { color: "#555", lineHeight: 18 },
  footer: { flexDirection: "row", justifyContent: "flex-end", marginTop: 0 },
});
