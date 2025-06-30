import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MedicationCard({ medName, dosage, time, status }) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>
        {medName} ({dosage})
      </Text>
      <Text style={styles.time}>🕒 {time}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.markBtn}>
          <Text style={{ color: "white" }}>Mark as Taken</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.snoozeBtn}>
          <Text>Snooze</Text>
        </TouchableOpacity>
      </View>
      {status && <Text style={styles.status}>{status}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    marginVertical: 8,
    borderRadius: 10,
  },
  name: { fontSize: 16, fontWeight: "600" },
  time: { fontSize: 14, color: "#555" },
  actions: { flexDirection: "row", marginTop: 8 },
  markBtn: {
    backgroundColor: "#007BFF",
    padding: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  snoozeBtn: {
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  status: { marginTop: 6, color: "red", fontSize: 12 },
});
