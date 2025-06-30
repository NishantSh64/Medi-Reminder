import AsyncStorage from "@react-native-async-storage/async-storage";

export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem("token");

  console.log(
    "🔑 Token from AsyncStorage:",
    token ? "Token exists" : "No token found"
  );
  console.log(
    "🔑 Token preview:",
    token ? token.substring(0, 20) + "..." : "null"
  );

  if (!token) {
    console.error("❌ No authentication token found!");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};
