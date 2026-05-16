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
  useTheme,
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
  const theme = useTheme();

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

  useEffect(() => {
    if (!url) return;

    const q = query(collection(db, "comments"), where("articleUrl", "==", url));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];

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

  const handleSendComment = async () => {
    if (!user || !commentText.trim()) return;

    const textToSend = commentText.trim();
    const tempId = Math.random().toString(36).substring(7);

    const newLocalComment: Comment = {
      id: tempId,
      text: textToSend,
      userId: user.uid,
      userEmail: user.email || "Użytkownik",
      createdAt: { seconds: Date.now() / 1000 },
      likes: [],
    };

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
    >
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.headerButtons}>
          <IconButton
            icon="arrow-left"
            mode="contained"
            containerColor={theme.colors.surface}
            iconColor={theme.colors.primary}
            onPress={() => router.back()}
          />
          <IconButton
            icon={isSaved ? "bookmark" : "bookmark-outline"}
            mode="contained"
            containerColor={
              isSaved ? theme.colors.primary : theme.colors.surface
            }
            iconColor={isSaved ? theme.colors.onPrimary : theme.colors.primary}
            onPress={handleToggleSave}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Image
            source={{ uri: image || "https://via.placeholder.com/400x200" }}
            style={styles.image}
            resizeMode="cover"
          />

          <View
            style={[
              styles.content,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <Text
              variant="labelLarge"
              style={[styles.sourceText, { color: theme.colors.primary }]}
            >
              {source?.toUpperCase()}
            </Text>
            <Text
              variant="headlineSmall"
              style={[styles.title, { color: theme.colors.onSurface }]}
            >
              {title}
            </Text>
            <Text
              variant="bodyMedium"
              style={[
                styles.description,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {description}
            </Text>

            <Button
              mode="contained"
              onPress={() => url && Linking.openURL(url)}
              style={[
                styles.readMoreButton,
                { backgroundColor: theme.colors.primary },
              ]}
              labelStyle={{ color: theme.colors.onPrimary }}
              contentStyle={{ height: 50 }}
            >
              Czytaj Pełny Artykuł
            </Button>

            <Divider
              style={[
                styles.divider,
                { backgroundColor: theme.colors.outline },
              ]}
            />

            <Text
              variant="titleLarge"
              style={[styles.commentsTitle, { color: theme.colors.onSurface }]}
            >
              Komentarze ({comments.length})
            </Text>

            {loadingComments ? (
              <ActivityIndicator
                color={theme.colors.primary}
                style={{ marginVertical: 20 }}
              />
            ) : comments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <IconButton
                  icon="comment-off-outline"
                  size={30}
                  iconColor={theme.colors.outline}
                />
                <Text
                  style={[
                    styles.emptyText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Brak komentarzy. Bądź pierwszy!
                </Text>
              </View>
            ) : (
              comments.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.commentItem,
                    { backgroundColor: theme.colors.surface },
                  ]}
                >
                  <Avatar.Text
                    size={36}
                    label={(item.userEmail || "A")[0].toUpperCase()}
                    style={{ backgroundColor: theme.colors.primaryContainer }}
                    labelStyle={{ color: theme.colors.onPrimaryContainer }}
                  />
                  <View style={styles.commentTextContainer}>
                    <Text
                      variant="labelMedium"
                      style={[
                        styles.commentUser,
                        { color: theme.colors.primary },
                      ]}
                    >
                      {item.userEmail}
                    </Text>
                    <Text
                      variant="bodySmall"
                      style={{ color: theme.colors.onSurface }}
                    >
                      {item.text}
                    </Text>
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
                          : theme.colors.primary
                      }
                      size={20}
                      onPress={() => handleToggleLike(item.id, item.likes)}
                    />
                    <Text
                      variant="labelSmall"
                      style={[
                        styles.likesCount,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      {(item.likes || []).length}
                    </Text>
                  </View>
                </View>
              ))
            )}
            <View style={{ height: 140 }} />
          </View>
        </ScrollView>

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
            },
          ]}
        >
          <TextInput
            mode="outlined"
            placeholder="Dodaj komentarz..."
            placeholderTextColor={theme.colors.onSurfaceVariant}
            textColor={theme.colors.onSurface}
            value={commentText}
            onChangeText={setCommentText}
            style={[styles.input, { backgroundColor: theme.colors.surface }]}
            outlineStyle={{
              borderRadius: 25,
              borderColor: theme.colors.outline,
            }}
            onSubmitEditing={handleSendComment}
            returnKeyType="send"
            right={
              <TextInput.Icon
                icon="send"
                disabled={!commentText.trim()}
                onPress={handleSendComment}
                color={
                  commentText.trim()
                    ? theme.colors.primary
                    : theme.colors.outline
                }
              />
            }
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { width: "100%", height: 350 },
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
    minHeight: 500,
  },
  sourceText: {
    marginBottom: 5,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  title: { fontWeight: "bold", marginBottom: 15 },
  description: { lineHeight: 22, marginBottom: 25 },
  readMoreButton: { borderRadius: 25 },
  divider: { marginVertical: 25 },
  commentsTitle: { fontWeight: "bold", marginBottom: 20 },
  commentItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
    padding: 12,
    borderRadius: 15,
    elevation: 2,
  },
  commentTextContainer: { flex: 1, marginLeft: 12 },
  commentUser: {
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 2,
  },
  likesContainer: { alignItems: "center", marginLeft: 5 },
  likesCount: { marginTop: -10, fontSize: 11 },
  emptyContainer: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 14 },
  inputContainer: {
    padding: 10,
    paddingBottom: Platform.OS === "ios" ? 35 : 15,
    borderTopWidth: 1,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  input: { flex: 1 },
});
