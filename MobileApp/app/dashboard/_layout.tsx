import { NavigationContainer } from "@react-navigation/native";
import { Stack } from "expo-router";

export default function DashboardLayout() {
  return (
    <NavigationContainer>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Dashboard" }} />
        <Stack.Screen name="HomeScreen" options={{ title: "Your Medicines" }} />
      </Stack>
    </NavigationContainer>
  );
}
