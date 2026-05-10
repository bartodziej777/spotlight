import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Appbar } from "react-native-paper";
import { WebView } from "react-native-webview";
export default function ArticleDetailsScreen() {
  const router = useRouter();
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>();

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} color="#34656e" />
        <Appbar.Content
          title={title || "Artykuł"}
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>

      {/* Wyświetlanie strony artykułu */}
      <WebView
        source={{ uri: url }}
        style={{ flex: 1 }}
        startInLoadingState={true}
        renderLoading={() => (
          <ActivityIndicator
            style={StyleSheet.absoluteFill}
            size="large"
            color="#34656e"
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#effafb",
  },
  headerTitle: {
    color: "#34656e",
    fontSize: 16,
  },
});
