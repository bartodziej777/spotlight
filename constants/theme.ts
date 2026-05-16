import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

const baseTheme = {
  roundness: 4,
};

export const lightTheme = {
  ...MD3LightTheme,
  ...baseTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#34656e",
    onPrimary: "#ffffff",
    primaryContainer: "#23545d",
    onPrimaryContainer: "#ffffff",
    background: "#effafb",
    surface: "#effafb",
    outline: "#34656e",
    secondary: "#23545d",
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  ...baseTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#4a8694",
    onPrimary: "#ffffff",
    primaryContainer: "#183e45",
    onPrimaryContainer: "#e0f2f5",
    background: "#121719",
    surface: "#1a2225",
    outline: "#4a8694",
    secondary: "#34656e",
  },
};
