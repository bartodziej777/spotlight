import { useAppTheme } from "@/context/ThemeContext";
import { authService } from "@/services/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React, { useState } from "react";
import { Appbar, Menu, useTheme } from "react-native-paper";

export default function TabsLayout() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  const { isDarkMode, toggleTheme } = useAppTheme();
  const theme = useTheme();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <>
      <Appbar.Header
        style={{
          backgroundColor: theme.colors.surface,
        }}
      >
        <Appbar.Content
          title="spotlight"
          titleStyle={{
            color: theme.colors.primary,
            fontWeight: "bold",
            fontSize: 24,
          }}
        />

        <Appbar.Action
          icon={isDarkMode ? "weather-sunny" : "weather-night"}
          color={theme.colors.primary}
          onPress={toggleTheme}
        />

        <Menu
          visible={visible}
          onDismiss={closeMenu}
          anchor={
            <Appbar.Action
              icon="account-circle"
              color={theme.colors.primary}
              onPress={openMenu}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              closeMenu();
              router.push("/settings");
            }}
            title="Ustawienia"
            leadingIcon="cog"
          />
          <Menu.Item
            onPress={() => {
              closeMenu();
              authService.logout();
            }}
            title="Wyloguj się"
            leadingIcon="logout"
          />
        </Menu>
      </Appbar.Header>

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: isDarkMode ? "#aaaaaa" : "#707070",
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopWidth: isDarkMode ? 0 : 1,
            borderColor: theme.colors.outline,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Feed",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="newspaper-variant-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="saved"
          options={{
            title: "Saved",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="bookmark-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
