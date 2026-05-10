import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Linking, ScrollView, StyleSheet, View } from "react-native";
import {
  Avatar,
  Button,
  Divider,
  IconButton,
  Text,
  TextInput,
} from "react-native-paper";

export default function ArticlePreviewScreen() {
  const router = useRouter();
  const { url, title, description, image, source } = useLocalSearchParams<{
    url: string;
    title: string;
    description: string;
    image: string;
    source: string;
  }>();

  const [comment, setComment] = useState("");

  const handleReadFull = () => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerButtons}>
        <IconButton
          icon="arrow-left"
          mode="contained"
          containerColor="rgba(255,255,255,0.8)"
          onPress={() => router.back()}
        />
        <IconButton
          icon="bookmark-outline"
          mode="contained"
          containerColor="rgba(255,255,255,0.8)"
          onPress={() => console.log("Zapisano")}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.content}>
          <Text variant="labelLarge" style={styles.sourceText}>
            {source}
          </Text>
          <Text variant="headlineSmall" style={styles.title}>
            {title}
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            {description}
          </Text>

          <Button
            mode="contained"
            onPress={handleReadFull}
            style={styles.readMoreButton}
            contentStyle={{ height: 50 }}
          >
            Czytaj Pełny Artykuł
          </Button>

          <Divider style={styles.divider} />

          <Text variant="titleLarge" style={styles.commentsTitle}>
            Komentarze (12)
          </Text>

          <View style={styles.commentItem}>
            <Avatar.Icon size={40} icon="account" />
            <View style={styles.commentTextContainer}>
              <Text variant="labelMedium">Użytkownik</Text>
              <Text variant="bodySmall">
                To jest bardzo interesujący artykuł!
              </Text>
            </View>
            <View style={styles.likes}>
              <IconButton icon="heart-outline" size={20} />
              <Text variant="labelSmall">4</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          mode="outlined"
          placeholder="Napisz komentarz..."
          value={comment}
          onChangeText={setComment}
          style={styles.input}
          outlineStyle={{ borderRadius: 25 }}
          right={
            <TextInput.Icon icon="send" onPress={() => console.log("Send")} />
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#effafb" },
  image: { width: "100%", height: 300, backgroundColor: "#ccc" },
  headerButtons: {
    position: "absolute",
    top: 40,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  content: {
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    backgroundColor: "#effafb",
  },
  sourceText: { color: "#006494", marginBottom: 5, fontWeight: "bold" },
  title: { color: "#34656e", fontWeight: "bold", marginBottom: 15 },
  description: { color: "#555", lineHeight: 22, marginBottom: 25 },
  readMoreButton: { borderRadius: 25, backgroundColor: "#34656e" },
  divider: { marginVertical: 25 },
  commentsTitle: { color: "#34656e", fontWeight: "bold", marginBottom: 20 },
  commentItem: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  commentTextContainer: { flex: 1, marginLeft: 15 },
  likes: { alignItems: "center" },
  inputContainer: {
    padding: 10,
    backgroundColor: "#effafb",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  input: { backgroundColor: "#fff" },
});
