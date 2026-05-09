import { auth } from "@/services/firebase";
import { useRouter } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    if (!email) {
      Alert.alert("Błąd", "Podaj adres email");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Wysłano!",
        "Sprawdź swoją skrzynkę mailową, aby zresetować hasło.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (error: any) {
      Alert.alert("Błąd", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Resetuj hasło
      </Text>
      <Text style={styles.subtitle}>
        Wpisz swój email, a wyślemy Ci instrukcje zmiany hasła.
      </Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Button
        mode="contained"
        onPress={handleReset}
        loading={loading}
        style={styles.mainButton}
      >
        Wyślij link
      </Button>

      <Button
        mode="text"
        onPress={() => router.back()}
        rippleColor="transparent"
        theme={{ colors: { primaryContainer: "transparent" } }}
      >
        Wróć do logowania
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#effafb",
  },
  title: {
    textAlign: "center",
    marginBottom: 10,
    color: "#34656e",
    fontWeight: "bold",
  },
  subtitle: { textAlign: "center", marginBottom: 30, color: "#666" },
  input: { marginBottom: 12 },
  mainButton: { marginTop: 10, paddingVertical: 4 },
});
