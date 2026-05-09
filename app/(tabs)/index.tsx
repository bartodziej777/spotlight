import ArticleCard from "@/components/ArticleCard";
import { useAuth } from "@/context/AuthContext";
import { fetchNews } from "@/services/newsApi"; // Pamiętasz nasz serwis GNews?
import { getUserCategories } from "@/services/userService";
import React, { useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Chip, Searchbar, Text } from "react-native-paper";

const DEFAULT_CATEGORIES = [
  "Technologia",
  "Kosmos",
  "Sport",
  "Biznes",
  "Polityka",
];

export default function FeedScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  //change to categories from firestore
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      getUserCategories(user.uid).then(setCategories);
    }
  }, [user]);
  const handleSearch = async (query: string, isCategory = false) => {
    setLoading(true);
    if (!isCategory) setSelectedCategory(null);

    const results = await fetchNews(query);
    setArticles(results);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Wpisz hasło do wyszukania artykułu"
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={() => handleSearch(searchQuery)}
        style={styles.searchBar}
        elevation={1}
      />

      <View>
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
                handleSearch(cat, true);
              }}
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
        <ActivityIndicator style={{ flex: 1 }} color="#34656e" />
      ) : articles.length > 0 ? (
        <FlatList
          data={articles}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <ArticleCard article={item} onPress={() => {}} />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            Wybierz kategorię lub wpisz hasło, aby wyświetlić najnowsze
            wiadomości.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#effafb",
  },
  searchBar: {
    margin: 16,
    borderRadius: 28,
    backgroundColor: "#d9e7e9",
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  chip: {
    borderRadius: 20,
    borderColor: "#34656e",
    backgroundColor: "transparent",
  },
  chipSelected: {
    backgroundColor: "#34656e",
  },
  chipText: {
    color: "#34656e",
    fontSize: 14,
  },
  chipTextSelected: {
    color: "#ffffff",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    textAlign: "center",
    color: "#34656e",
    opacity: 0.7,
  },
});
