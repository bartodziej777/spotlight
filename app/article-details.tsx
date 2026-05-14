import { useAuth } from "@/context/AuthContext";
import { db } from "@/services/firebase";
import { isArticleSaved, toggleSaveArticle } from "@/services/userService";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Button,
  Divider,
  IconButton,
  Text,
  TextInput,
} from "react-native-paper";

interface Comment {
  id: string;
  text: string;
  userId: string;
  userEmail: string;
  createdAt: any;
  likes: string[];
}

export default function ArticlePreviewScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const { url, title, description, image, source } = useLocalSearchParams<{
    url: string;
    title: string;
    description: string;
    image: string;
    source: string;
  }>();

  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      if (user && url) {
        const savedStatus = await isArticleSaved(user.uid, url);
        setIsSaved(savedStatus);
      }
    }
    checkStatus();
  }, [user, url]);

  // 1. Pobieranie komentarzy - Sortujemy lokalnie, aby uniknąć problemów z Firebase
  useEffect(() => {
    if (!url) return;

    // Usunięcie orderBy("createdAt") rozwiązuje problem "znikających" komentarzy bez daty
    const q = query(collection(db, "comments"), where("articleUrl", "==", url));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];

      // Ręczne sortowanie po dacie (najnowsze na górze)
      const sorted = fetchedComments.sort((a, b) => {
        const timeA = a.createdAt?.seconds || Date.now() / 1000;
        const timeB = b.createdAt?.seconds || Date.now() / 1000;
        return timeB - timeA;
      });

      setComments(sorted);
      setLoadingComments(false);
    });

    return () => unsubscribe();
  }, [url]);

  // 2. Wysyłanie komentarza - Optymistyczne dodanie do listy
  const handleSendComment = async () => {
    if (!user || !commentText.trim()) return;

    const textToSend = commentText.trim();
    const tempId = Math.random().toString(36).substring(7);

    // Tworzymy obiekt komentarza "na teraz"
    const newLocalComment: Comment = {
      id: tempId,
      text: textToSend,
      userId: user.uid,
      userEmail: user.email || "Użytkownik",
      createdAt: { seconds: Date.now() / 1000 },
      likes: [],
    };

    // Dodajemy go do listy natychmiast, żeby użytkownik go widział
    setComments((prev) => [newLocalComment, ...prev]);
    setCommentText("");

    try {
      await addDoc(collection(db, "comments"), {
        articleUrl: url,
        userId: user.uid,
        userEmail: user.email || "Anonim",
        text: textToSend,
        createdAt: serverTimestamp(),
        likes: [],
      });
    } catch (error) {
      console.error("Błąd zapisu:", error);
      // W razie błędu usuwamy go z listy i przywracamy tekst
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      setCommentText(textToSend);
    }
  };

  const handleToggleLike = async (
    commentId: string,
    currentLikes: string[],
  ) => {
    if (!user) return;
    const commentRef = doc(db, "comments", commentId);
    const isLiked = (currentLikes || []).includes(user.uid);
    try {
      await updateDoc(commentRef, {
        likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
      });
    } catch (error) {
      console.error("Błąd lajka:", error);
    }
  };

  const handleToggleSave = async () => {
    if (!user) return;
    const newStatus = !isSaved;
    setIsSaved(newStatus);
    await toggleSaveArticle(
      user.uid,
      { url, title, description, image, source },
      isSaved,
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View style={styles.container}>
        <View style={styles.headerButtons}>
          <IconButton
            icon="arrow-left"
            mode="contained"
            containerColor="rgba(255,255,255,0.9)"
            iconColor="#34656e"
            onPress={() => router.back()}
          />
          <IconButton
            icon={isSaved ? "bookmark" : "bookmark-outline"}
            mode="contained"
            containerColor={isSaved ? "#34656e" : "rgba(255,255,255,0.9)"}
            iconColor={isSaved ? "#ffffff" : "#34656e"}
            onPress={handleToggleSave}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Image
            source={{ uri: image || "https://via.placeholder.com/400x200" }}
            style={styles.image}
            resizeMode="cover"
          />

          <View style={styles.content}>
            <Text variant="labelLarge" style={styles.sourceText}>
              {source?.toUpperCase()}
            </Text>
            <Text variant="headlineSmall" style={styles.title}>
              {title}
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              {description}
            </Text>

            <Button
              mode="contained"
              onPress={() => url && Linking.openURL(url)}
              style={styles.readMoreButton}
              contentStyle={{ height: 50 }}
            >
              Czytaj Pełny Artykuł
            </Button>

            <Divider style={styles.divider} />

            <Text variant="titleLarge" style={styles.commentsTitle}>
              Komentarze ({comments.length})
            </Text>

            {loadingComments ? (
              <ActivityIndicator
                color="#34656e"
                style={{ marginVertical: 20 }}
              />
            ) : comments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <IconButton
                  icon="comment-off-outline"
                  size={30}
                  iconColor="#ccc"
                />
                <Text style={styles.emptyText}>
                  Brak komentarzy. Bądź pierwszy!
                </Text>
              </View>
            ) : (
              comments.map((item) => (
                <View key={item.id} style={styles.commentItem}>
                  <Avatar.Text
                    size={36}
                    label={(item.userEmail || "A")[0].toUpperCase()}
                  />
                  <View style={styles.commentTextContainer}>
                    <Text variant="labelMedium" style={styles.commentUser}>
                      {item.userEmail}
                    </Text>
                    <Text variant="bodySmall">{item.text}</Text>
                  </View>
                  <View style={styles.likesContainer}>
                    <IconButton
                      icon={
                        (item.likes || []).includes(user?.uid || "")
                          ? "heart"
                          : "heart-outline"
                      }
                      iconColor={
                        (item.likes || []).includes(user?.uid || "")
                          ? "#e91e63"
                          : "#34656e"
                      }
                      size={20}
                      onPress={() => handleToggleLike(item.id, item.likes)}
                    />
                    <Text variant="labelSmall" style={styles.likesCount}>
                      {(item.likes || []).length}
                    </Text>
                  </View>
                </View>
              ))
            )}
            <View style={{ height: 140 }} />
          </View>
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            mode="outlined"
            placeholder="Dodaj komentarz..."
            value={commentText}
            onChangeText={setCommentText}
            style={styles.input}
            outlineStyle={{ borderRadius: 25 }}
            onSubmitEditing={handleSendComment}
            returnKeyType="send"
            right={
              <TextInput.Icon
                icon="send"
                disabled={!commentText.trim()}
                onPress={handleSendComment}
                color={commentText.trim() ? "#34656e" : "#ccc"}
              />
            }
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#effafb" },
  image: { width: "100%", height: 350, backgroundColor: "#ccc" },
  headerButtons: {
    position: "absolute",
    top: 50,
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
    minHeight: 500,
  },
  sourceText: {
    color: "#006494",
    marginBottom: 5,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  title: { color: "#34656e", fontWeight: "bold", marginBottom: 15 },
  description: { color: "#555", lineHeight: 22, marginBottom: 25 },
  readMoreButton: { borderRadius: 25, backgroundColor: "#34656e" },
  divider: { marginVertical: 25 },
  commentsTitle: { color: "#34656e", fontWeight: "bold", marginBottom: 20 },
  commentItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 15,
    elevation: 2,
  },
  commentTextContainer: { flex: 1, marginLeft: 12 },
  commentUser: {
    color: "#34656e",
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 2,
  },
  likesContainer: { alignItems: "center", marginLeft: 5 },
  likesCount: { marginTop: -10, color: "#34656e", fontSize: 11 },
  emptyContainer: { alignItems: "center", paddingVertical: 40 },
  emptyText: { color: "#aaa", fontSize: 14 },
  inputContainer: {
    padding: 10,
    paddingBottom: Platform.OS === "ios" ? 35 : 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  input: { backgroundColor: "#fff" },
});
