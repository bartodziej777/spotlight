import { Slot } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
// Jeśli używasz React Native Paper:
import { PaperProvider } from "react-native-paper";

export default function RootLayout() {
  return (
    <AuthProvider>
      <PaperProvider>
        <Slot />
      </PaperProvider>
    </AuthProvider>
  );
}
