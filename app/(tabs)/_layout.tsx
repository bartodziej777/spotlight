import { authService } from "@/services/auth";
import { Tabs, useRouter } from "expo-router";
import React, { useState } from "react";
import { Appbar, Menu } from "react-native-paper";
// Importujemy zestaw ikon standardowy dla Expo
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabsLayout() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <>
      <Appbar.Header
        style={{ backgroundColor: "#effafb", justifyContent: "space-between" }}
      >
        <Appbar.Content
          title="spotlight"
          titleStyle={{ color: "#34656e", fontWeight: "bold", fontSize: 24 }}
        />

        <Menu
          visible={visible}
          onDismiss={closeMenu}
          anchor={
            /* Ikona profilu w nagłówku może zostać jako Avatar lub też zmieniona na zwykłą ikonę */
            <Appbar.Action
              icon="account-circle"
              color="#34656e"
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
          tabBarActiveTintColor: "#006494",
          tabBarInactiveTintColor: "#707070", // Kolor nieaktywnych ikon
          tabBarStyle: { backgroundColor: "#ffffff" },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Feed",
            tabBarIcon: ({ color, size }) => (
              /* Używamy czystej ikony bez tła */
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
