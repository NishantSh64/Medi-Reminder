import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { signupUser } from "../../src/api/authService";

export default function SignUp() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    try {
      const data = await signupUser(username, email, password);
      console.log("Signup Success: ", data);
      router.push("/(auth)/login");
    } catch (error) {
      console.error("Signup failed: ", error);
      alert("Signup failed. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("@assets/images/Medi-Reminder-Icon.png")}
        style={styles.logo}
      />

      <Text style={styles.heading}>Create Account</Text>
      <Text style={styles.subtext}>Enter your details to sign up</Text>

      {/* Username Input */}
      <TextInput
        placeholder="Enter Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />

      {/* Email Input */}
      <TextInput
        placeholder="Enter Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Input */}
      <TextInput
        placeholder="Enter Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
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
  logo: { width: 80, height: 80, alignSelf: "center", marginBottom: 20 },
  heading: { fontSize: 28, fontWeight: "bold", textAlign: "center" },
  subtext: { fontSize: 14, textAlign: "center", marginVertical: 10 },
  input: {
    borderBottomWidth: 1,
    padding: 10,
    marginVertical: 10,
  },
  button: {
    backgroundColor: "#52a2c7",
    padding: 14,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
