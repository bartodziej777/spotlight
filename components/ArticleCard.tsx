import { useAuth } from "@/context/AuthContext"; // Import
import { isArticleSaved, toggleSaveArticle } from "@/services/userService";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { IconButton, Surface, Text, useTheme } from "react-native-paper";

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
  const theme = useTheme();
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
      <Surface
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        elevation={1}
      >
        <Image
          source={{
            uri:
              article.image ||
              "https://via.placeholder.com/400x200?text=Brak+zdjęcia",
          }}
          style={[styles.image, { backgroundColor: theme.colors.background }]}
        />

        <View style={styles.content}>
          <View style={styles.header}>
            <Text
              variant="labelMedium"
              style={[styles.sourceName, { color: theme.colors.primary }]}
            >
              {article.source.name.toUpperCase()}
            </Text>
            <Text
              variant="labelSmall"
              style={[styles.date, { color: theme.colors.onSurfaceVariant }]}
            >
              {date}
            </Text>
          </View>

          <Text
            variant="titleMedium"
            style={[styles.title, { color: theme.colors.onSurface }]}
            numberOfLines={2}
          >
            {article.title}
          </Text>

          <Text
            variant="bodySmall"
            style={[
              styles.description,
              { color: theme.colors.onSurfaceVariant },
            ]}
            numberOfLines={2}
          >
            {article.description}
          </Text>

          <View style={styles.footer}>
            <IconButton
              icon={saved ? "bookmark" : "bookmark-outline"}
              iconColor={theme.colors.primary}
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
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    overflow: "hidden",
  },
  image: { width: "100%", height: 180 },
  content: { padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sourceName: { fontWeight: "bold", letterSpacing: 1 },
  date: { opacity: 0.8 },
  title: {
    fontWeight: "bold",
    lineHeight: 22,
    marginBottom: 6,
  },
  description: { lineHeight: 18, opacity: 0.9 },
  footer: { flexDirection: "row", justifyContent: "flex-end", marginTop: 0 },
});
