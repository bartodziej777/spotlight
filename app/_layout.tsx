import { theme } from "@/constants/theme";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import { AuthProvider, useAuth } from "../context/AuthContext";

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      // Jeśli nie ma użytkownika i nie jesteśmy w grupie logowania -> idź do logowania
      router.replace("/login");
    } else if (user && inAuthGroup) {
      // Jeśli użytkownik się zalogował, a jest na logowaniu -> idź do aplikacji
      router.replace("/");
    }
  }, [user, isLoading, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
        <RootLayoutNav />
      </PaperProvider>
    </AuthProvider>
  );
}
