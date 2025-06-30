import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function NoMedicationsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Ionicons name="happy-outline" size={80} color="#52a2c7" />
      <Text style={styles.title}>You're all caught up!</Text>
      <Text style={styles.subtitle}>
        No medications due for now. Stay healthy!
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/(tabs)/add-reminder")}
      >
        <Text style={styles.buttonText}>Add a New Reminder</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F9FAFB",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#52a2c7",
    padding: 12,
    borderRadius: 8,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
