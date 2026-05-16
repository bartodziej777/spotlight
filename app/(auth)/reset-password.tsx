import { auth } from "@/services/firebase";
import { useRouter } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();
  const theme = useTheme();

  const translateError = (code: string) => {
    switch (code) {
      case "auth/invalid-email":
        return "Niepoprawny format adresu e-mail.";
      case "auth/user-not-found":
        return "Nie znaleziono użytkownika z tym adresem e-mail.";
      case "auth/too-many-requests":
        return "Zbyt wiele próśb. Spróbuj ponownie później.";
      default:
        return "Wystąpił błąd. Spróbuj ponownie.";
    }
  };

  const handleReset = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email) {
      setErrorMsg("Podaj adres email.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg("Instrukcje zostały wysłane na Twój e-mail.");
      setTimeout(() => {
        router.back();
      }, 3000);
    } catch (error: any) {
      setErrorMsg(translateError(error.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text
        variant="headlineMedium"
        style={[styles.title, { color: theme.colors.primary }]}
      >
        Resetuj hasło
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
        Wpisz swój email, a wyślemy Ci instrukcje zmiany hasła.
      </Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setErrorMsg(null);
        }}
        mode="outlined"
        style={[styles.input, { backgroundColor: theme.colors.surface }]}
        textColor={theme.colors.onSurface}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        outlineColor={theme.colors.outline}
        activeOutlineColor={theme.colors.primary}
        keyboardType="email-address"
        autoCapitalize="none"
        error={!!errorMsg}
      />

      <HelperText type="error" visible={!!errorMsg} style={styles.message}>
        {errorMsg}
      </HelperText>

      {successMsg && <Text style={styles.successText}>{successMsg}</Text>}

      <Button
        mode="contained"
        onPress={handleReset}
        loading={loading}
        disabled={loading || !!successMsg}
        style={[styles.mainButton, { backgroundColor: theme.colors.primary }]}
        labelStyle={{ color: theme.colors.onPrimary }}
      >
        Wyślij link
      </Button>

      <Button
        mode="text"
        onPress={() => router.back()}
        style={styles.backButton}
        labelStyle={{ color: theme.colors.primary }}
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
  },
  title: {
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },
  subtitle: { textAlign: "center", marginBottom: 30 },
  input: { marginBottom: 4 },
  message: { textAlign: "center", marginBottom: 8 },
  successText: {
    color: "#2e7d32",
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "500",
  },
  mainButton: { marginTop: 10, paddingVertical: 4 },
  backButton: { marginTop: 10 },
});
