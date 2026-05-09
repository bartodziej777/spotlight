import { auth } from "@/services/firebase";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const translateError = (code: string) => {
    switch (code) {
      case "auth/email-already-in-use":
        return "Ten adres e-mail jest już przypisany do innego konta.";
      case "auth/invalid-email":
        return "Niepoprawny format adresu e-mail.";
      case "auth/weak-password":
        return "Hasło jest zbyt słabe (min. 6 znaków).";
      case "auth/operation-not-allowed":
        return "Rejestracja e-mail/hasło jest wyłączona w Firebase.";
      default:
        return "Wystąpił błąd podczas rejestracji. Spróbuj ponownie.";
    }
  };

  const handleRegister = async () => {
    setErrorMsg(null);

    if (!email || !password || !confirmPassword) {
      setErrorMsg("Wypełnij wszystkie pola.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Hasła nie są identyczne.");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setErrorMsg(translateError(error.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Stwórz konto
      </Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setErrorMsg(null);
        }}
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        error={!!errorMsg && errorMsg.includes("e-mail")}
      />

      <TextInput
        label="Hasło"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setErrorMsg(null);
        }}
        mode="outlined"
        secureTextEntry
        style={styles.input}
        error={!!errorMsg && errorMsg.includes("Hasło")}
      />

      <TextInput
        label="Powtórz hasło"
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          setErrorMsg(null);
        }}
        mode="outlined"
        secureTextEntry
        style={styles.input}
        error={!!errorMsg && errorMsg.includes("identyczne")}
      />

      <HelperText type="error" visible={!!errorMsg} style={styles.errorText}>
        {errorMsg}
      </HelperText>

      <Button
        mode="contained"
        onPress={handleRegister}
        loading={loading}
        style={styles.mainButton}
      >
        Zarejestruj się
      </Button>

      <Button
        mode="text"
        onPress={() => router.back()}
        rippleColor="transparent"
      >
        Masz już konto? Zaloguj się
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
    marginBottom: 30,
    color: "#34656e",
    fontWeight: "bold",
  },
  input: { marginBottom: 4 },
  errorText: {
    textAlign: "center",
    marginBottom: 8,
  },
  mainButton: { marginTop: 10, paddingVertical: 4 },
});
