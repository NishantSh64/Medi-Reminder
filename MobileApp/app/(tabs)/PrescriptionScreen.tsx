import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PrescriptionScreen() {
  const router = useRouter();

  return (
    <>
      {/* Stack Header */}
      <Stack.Screen
        options={{
          title: "Prescription",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons
                name="arrow-back"
                size={24}
                color="#333"
                style={{ marginLeft: 10 }}
              />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Screen Content */}
      <View style={styles.container}>
        <Text style={styles.text}>Your Prescription Screen Content Here</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 18,
    marginTop: 20,
    color: "#333",
  },
});
