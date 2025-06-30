import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_BASE_URL from "./apiConfig";

export const signupUser = async (
  username: string,
  email: string,
  password: string
) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
      username,
      email,
      password,
    });

    console.log("✅ Signup successful:", response.data);
    return response;
  } catch (error: any) {
    console.error("❌ Signup error:", error.response?.data || error.message);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    console.log("🔐 Attempting login for:", email);

    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email,
      password,
    });

    console.log("✅ Login API response:", response.data);

    // Store authentication data
    if (response.data.token) {
      await AsyncStorage.setItem("token", response.data.token);
      console.log("💾 Token stored successfully");
    }

    if (response.data.userId) {
      await AsyncStorage.setItem("userId", response.data.userId.toString());
      console.log("💾 User ID stored:", response.data.userId);
    }

    // Optional: Store other user info
    if (response.data.email) {
      await AsyncStorage.setItem("userEmail", response.data.email);
    }

    if (response.data.username) {
      await AsyncStorage.setItem("username", response.data.username);
    }

    return response;
  } catch (error: any) {
    console.error("❌ Login error:", error.response?.data || error.message);
    throw error;
  }
};

// Helper function to check if user is logged in
export const isLoggedIn = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem("token");
    const userId = await AsyncStorage.getItem("userId");

    const loggedIn = !!(token && userId);
    console.log("🔍 Login status check:", loggedIn);

    return loggedIn;
  } catch (error: any) {
    console.error("Error checking login status:", error);
    return false;
  }
};

// Helper function to get current user info
export const getCurrentUser = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    const userId = await AsyncStorage.getItem("userId");
    const email = await AsyncStorage.getItem("userEmail");
    const username = await AsyncStorage.getItem("username");

    if (!token || !userId) {
      return null;
    }

    return {
      token,
      userId: parseInt(userId),
      email,
      username,
    };
  } catch (error: any) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Helper function to logout
export const logoutUser = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      "token",
      "userId",
      "userEmail",
      "username",
    ]);
    console.log("✅ User logged out successfully");
  } catch (error: any) {
    console.error("Error during logout:", error);
  }
};
