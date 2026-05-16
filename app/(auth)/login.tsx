import { auth } from "@/services/firebase";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const theme = useTheme();

  const translateError = (code: string) => {
    switch (code) {
      case "auth/invalid-email":
        return "Niepoprawny format adresu e-mail.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Błędny e-mail lub hasło.";
      case "auth/too-many-requests":
        return "Zbyt wiele nieudanych prób. Spróbuj później.";
      default:
        return "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.";
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg("Wprowadź e-mail i hasło.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
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
        variant="headlineLarge"
        style={[styles.title, { color: theme.colors.primary }]}
      >
        Spotlight
      </Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (errorMsg) setErrorMsg(null);
        }}
        mode="outlined"
        style={[styles.input, { backgroundColor: theme.colors.surface }]}
        textColor={theme.colors.onSurface}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        outlineColor={theme.colors.outline}
        activeOutlineColor={theme.colors.primary}
        keyboardType="email-address"
        error={!!errorMsg}
      />

      <TextInput
        label="Hasło"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (errorMsg) setErrorMsg(null);
        }}
        mode="outlined"
        secureTextEntry
        style={[styles.input, { backgroundColor: theme.colors.surface }]}
        textColor={theme.colors.onSurface}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        outlineColor={theme.colors.outline}
        activeOutlineColor={theme.colors.primary}
        error={!!errorMsg}
      />

      <HelperText type="error" visible={!!errorMsg} style={styles.errorText}>
        {errorMsg}
      </HelperText>

      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        labelStyle={{ color: theme.colors.onPrimary }}
      >
        Zaloguj się
      </Button>

      <View style={styles.footer}>
        <Button
          onPress={() => router.push("/register")}
          labelStyle={{ color: theme.colors.primary }}
        >
          Nie masz konta? Zarejestruj się
        </Button>

        <Button
          onPress={() => router.push("/reset-password")}
          labelStyle={[
            styles.forgotPass,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Zapomniałeś hasła?
        </Button>
      </View>
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
    marginBottom: 40,
    fontWeight: "bold",
  },
  input: { marginBottom: 4 },
  errorText: {
    marginBottom: 8,
    fontSize: 14,
    textAlign: "center",
  },
  button: { marginTop: 8, paddingVertical: 4 },
  footer: {
    marginTop: 20,
  },
  forgotPass: {
    fontSize: 12,
  },
});
