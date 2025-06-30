import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { loginUser } from "../../src/api/authService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      const response = await loginUser(email, password);

      if (response.status === 200) {
        Alert.alert("Success", "Login successful!", [
          {
            text: "OK",
            onPress: () => router.push("/dashboard"),
          },
        ]);
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      Alert.alert(
        "Login Failed",
        error?.response?.data?.message ||
          error?.message ||
          "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("@assets/images/Medi-Reminder-Icon.png")}
        style={styles.logo}
      />
      <Text style={styles.heading}>Welcome!</Text>
      <Text style={styles.subtext}>
        Hi, Enter your details to sign in to your account
      </Text>

      <TextInput
        placeholder="Enter email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Enter Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.signupText}>
        Don't have an account?{" "}
        <Link href="/(auth)/signup" style={styles.linkText}>
          Sign Up
        </Link>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: "center",
    marginBottom: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtext: {
    fontSize: 14,
    textAlign: "center",
    marginVertical: 10,
  },
  input: {
    borderBottomWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderBottomColor: "#ccc",
  },
  button: {
    backgroundColor: "#52a2c7",
    padding: 14,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#a0a0a0",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  signupText: {
    textAlign: "center",
    marginTop: 20,
  },
  linkText: {
    color: "#52a2c7",
    fontWeight: "bold",
  },
});
