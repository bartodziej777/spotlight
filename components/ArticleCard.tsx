import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Surface, Text } from "react-native-paper";

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
  // Formatowanie daty na czytelną
  const date = new Date(article.publishedAt).toLocaleDateString("pl-PL");

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <Surface style={styles.card} elevation={1}>
        {/* Obrazek Artykułu */}
        <Image
          source={{
            uri:
              article.image ||
              "https://via.placeholder.com/400x200?text=Brak+zdjęcia",
          }}
          style={styles.image}
        />

        <View style={styles.content}>
          {/* Nagłówek: Źródło i Data */}
          <View style={styles.header}>
            <Text variant="labelMedium" style={styles.sourceName}>
              {article.source.name.toUpperCase()}
            </Text>
            <Text variant="labelSmall" style={styles.date}>
              {date}
            </Text>
          </View>

          {/* Tytuł */}
          <Text variant="titleMedium" style={styles.title} numberOfLines={2}>
            {article.title}
          </Text>

          {/* Krótki Opis */}
          <Text
            variant="bodySmall"
            style={styles.description}
            numberOfLines={2}
          >
            {article.description}
          </Text>

          {/* Dolny pasek z ikonką zapisu (opcjonalnie) */}
          <View style={styles.footer}>
            <MaterialCommunityIcons
              name="bookmark-outline"
              size={20}
              color="#34656e"
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
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 180,
    backgroundColor: "#d9e7e9",
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sourceName: {
    color: "#006494",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  date: {
    color: "#666",
  },
  title: {
    color: "#34656e",
    fontWeight: "bold",
    lineHeight: 22,
    marginBottom: 6,
  },
  description: {
    color: "#555",
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
});
