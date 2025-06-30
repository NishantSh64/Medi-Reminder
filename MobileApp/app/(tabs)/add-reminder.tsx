import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { createMedicineWithReminder } from "../../src/api/reminderApi";

interface ApiError {
  response?: {
    data?: string | object;
  };
  message?: string;
}
export default function AddMedicineReminder() {
  const router = useRouter();
  // Add these functions to your AddMedicineReminder component

  // Handler for start date picker
  const onStartDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    setShowStartDateP(Platform.OS === "ios"); // Keep picker open on iOS, close on Android
    setStartDate(currentDate);
  };

  // Handler for reminder date picker
  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || reminderDate;
    setShowDateP(Platform.OS === "ios"); // Keep picker open on iOS, close on Android
    setReminderDate(currentDate);
  };

  // Handler for reminder time picker
  const onTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || reminderTime;
    setShowTimeP(Platform.OS === "ios"); // Keep picker open on iOS, close on Android
    setReminderTime(currentTime);
  };

  // Note: You also have validateInputs defined twice in your code.
  // Remove one of the duplicate validateInputs functions to avoid conflicts.
  // Medicine fields
  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [startDate, setStartDate] = useState(new Date());

  // Reminder fields
  const [reminderTime, setReminderTime] = useState(new Date());
  const [reminderDate, setReminderDate] = useState(new Date());

  // UI state
  const [showTimeP, setShowTimeP] = useState(false);
  const [showDateP, setShowDateP] = useState(false);
  const [showStartDateP, setShowStartDateP] = useState(false);
  const [loading, setLoading] = useState(false);

  // TODO: This should come from your app's state/context
  const [userId, setUserId] = useState(1);

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const formatTime = (date: Date) => {
    return date.toTimeString().slice(0, 5);
  };

  const checkTokenBeforeSave = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Session Expired", "Please log in again", [
        { text: "OK", onPress: () => router.push("/login") },
      ]);
      return false;
    }
    return true;
  };
  useEffect(() => {
    const getUserId = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          // Decode JWT to get user ID (you might need to install jwt-decode)
          // const decoded = jwtDecode(token);
          // setUserId(decoded.userId);

          // Or get it from your user storage
          const storedUserId = await AsyncStorage.getItem("userId");
          if (storedUserId) {
            setUserId(parseInt(storedUserId));
            console.log("👤 User ID loaded:", storedUserId);
          } else {
            console.error("❌ No user ID found in storage");
            Alert.alert("Error", "Please log in again");
            router.push("/login");
          }
        }
      } catch (error) {
        console.error("Error getting user ID:", error);
      }
    };

    getUserId();
  }, []);
  // Enhanced handleSave function with better error handling and debugging
  const handleSave = async () => {
    if (!(await checkTokenBeforeSave())) {
      return;
    }
    if (!validateInputs()) {
      return;
    }

    setLoading(true);

    try {
      const medicineReminderData = {
        medicine: {
          name: medicineName.trim(),
          dosage: dosage.trim(),
          frequency: Number(frequency),
          startDate: formatDate(startDate),
          user: {
            userId: userId,
          },
        },
        reminder: {
          reminderTime: formatTime(reminderTime),
          reminderDate: formatDate(reminderDate),
          status: "PENDING",
          notified: false,
        },
      };

      console.log("=== FRONTEND DEBUG INFO ===");
      console.log("User ID:", userId);
      console.log("Medicine name:", medicineName);
      console.log("Dosage:", dosage);
      console.log("Frequency:", frequency);
      console.log("Start date formatted:", formatDate(startDate));
      console.log("Reminder time formatted:", formatTime(reminderTime));
      console.log("Reminder date formatted:", formatDate(reminderDate));
      console.log(
        "Complete payload:",
        JSON.stringify(medicineReminderData, null, 2)
      );

      const result = await createMedicineWithReminder(medicineReminderData);
      console.log("✅ Success! Medicine and reminder created:", result);

      Alert.alert("Success", "Medicine and reminder saved successfully!", [
        {
          text: "OK",
          onPress: () => router.push("/dashboard"),
        },
      ]);
    } catch (error: unknown) {
      console.error("❌ Error saving reminder:", error);

      let errorMessage = "Failed to save reminder.";
      const apiError = error as ApiError;

      // Enhanced error handling
      if (apiError.response?.data) {
        if (typeof apiError.response.data === "string") {
          errorMessage = apiError.response.data;
        } else if (typeof apiError.response.data === "object") {
          const errorObj = apiError.response.data as any;
          errorMessage =
            errorObj.message || errorObj.error || "Server error occurred.";
        }
      } else if (apiError.message) {
        errorMessage = apiError.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error("Final error message to show:", errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced validation with more detailed checks
  const validateInputs = () => {
    console.log("=== VALIDATION DEBUG ===");
    console.log("Medicine name:", `"${medicineName}"`);
    console.log("Dosage:", `"${dosage}"`);
    console.log("Frequency:", `"${frequency}"`);
    console.log("User ID:", userId);

    if (!medicineName.trim()) {
      Alert.alert("Validation Error", "Please enter a medicine name");
      return false;
    }

    if (!dosage.trim()) {
      Alert.alert("Validation Error", "Please enter a dosage");
      return false;
    }

    if (
      !frequency.trim() ||
      isNaN(Number(frequency)) ||
      Number(frequency) <= 0
    ) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid frequency (number greater than 0)"
      );
      return false;
    }

    if (!userId || userId <= 0) {
      Alert.alert("Error", "Invalid user ID. Please log in again.");
      return false;
    }

    console.log("✅ All validations passed");
    return true;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Medicine & Reminder</Text>

      {/* Medicine Information Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Medicine Information</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Medicine Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Paracetamol, Aspirin"
            value={medicineName}
            onChangeText={setMedicineName}
            maxLength={100}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Dosage *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 500 mg, 2 tablets"
            value={dosage}
            onChangeText={setDosage}
            maxLength={50}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Frequency (times per day) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 2, 3"
            value={frequency}
            onChangeText={setFrequency}
            keyboardType="numeric"
            maxLength={2}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Start Date *</Text>
          <TouchableOpacity
            onPress={() => setShowStartDateP(true)}
            style={styles.input}
          >
            <Text style={styles.dateTimeText}>
              {startDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Reminder Information Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Reminder Settings</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Reminder Date *</Text>
          <TouchableOpacity
            onPress={() => setShowDateP(true)}
            style={styles.input}
          >
            <Text style={styles.dateTimeText}>
              {reminderDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Reminder Time *</Text>
          <TouchableOpacity
            onPress={() => setShowTimeP(true)}
            style={styles.input}
          >
            <Text style={styles.dateTimeText}>
              {reminderTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Date/Time Pickers */}
      {showStartDateP && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={onStartDateChange}
        />
      )}

      {showDateP && (
        <DateTimePicker
          value={reminderDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={onDateChange}
        />
      )}

      {showTimeP && (
        <DateTimePicker
          value={reminderTime}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onTimeChange}
        />
      )}

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? "Saving..." : "Save Medicine & Reminder"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
  },
  sectionContainer: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#495057",
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#fff",
    minHeight: 50,
    justifyContent: "center",
  },
  dateTimeText: {
    fontSize: 16,
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#52a2c7",
    padding: 18,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButtonDisabled: {
    backgroundColor: "#a0a0a0",
    elevation: 0,
    shadowOpacity: 0,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
