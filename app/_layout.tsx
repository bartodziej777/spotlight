import { ThemeProvider, useAppTheme } from "@/context/ThemeContext";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
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
      router.replace("/login");
    } else if (user && inAuthGroup) {
      router.replace("/");
    }
  }, [user, isLoading, segments]);

  return <Slot />;
}
function MainAppStructure() {
  const { theme, isDarkMode } = useAppTheme();

  return (
    <PaperProvider theme={theme}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <RootLayoutNav />
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MainAppStructure />
      </ThemeProvider>
    </AuthProvider>
  );
}
