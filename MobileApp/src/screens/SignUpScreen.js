import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignUpScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image source={require("../../assets/logo.png")} style={styles.logo} />
      <Text style={styles.welcome}>Welcome!</Text>
      <Text style={styles.subtitle}>Hi, Enter your details to get sign up</Text>

      <TextInput placeholder="Enter Email" style={styles.input} />
      <TextInput
        placeholder="Enter Password"
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace("Dashboard")}
      >
        <Text style={styles.buttonText}>Join-Us</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: 80, height: 80, marginBottom: 20 },
  welcome: { fontSize: 26, fontWeight: "bold", marginBottom: 5 },
  subtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 20,
    padding: 8,
  },
  button: {
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "600" },
});
