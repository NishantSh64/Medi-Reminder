import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  deleteReminder,
  getAllUserReminders,
  getRemindersByUserId,
} from "../../src/api/reminderApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  AlertButton,
  ActivityIndicator,
} from "react-native";
import {
  getAllergies,
  addAllergy,
  deleteAllergy,
  getProfile,
  updatePreferences,
  Allergy,
  ReminderPreference,
} from "../../src/api/profileApi";
interface ReminderItem {
  id?: string;
  reminderId?: string;
  [key: string]: any; // Allow for other properties
}
export default function ProfileScreen() {
  const router = useRouter();

  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [dailyTipsEnabled, setDailyTipsEnabled] = React.useState(false);
  const [reminderSound, setReminderSound] = React.useState("Chime");

  const [allergies, setAllergies] = React.useState<Allergy[]>([]);
  const [newAllergy, setNewAllergy] = React.useState("");

  const [userId, setUserId] = React.useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [deletingReminders, setDeletingReminders] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);

  // ✅ Enhanced getUserId function with better error handling
  const getUserId = async (): Promise<number | null> => {
    // First try to get from state
    if (userId) {
      console.log("✅ Using userId from state:", userId);
      return userId;
    }

    try {
      // Try to get from AsyncStorage
      const storedUserId = await AsyncStorage.getItem("userId");
      if (storedUserId) {
        const parsedUserId = parseInt(storedUserId);
        if (!isNaN(parsedUserId)) {
          console.log("✅ Using userId from AsyncStorage:", parsedUserId);
          setUserId(parsedUserId); // Update state for future use
          return parsedUserId;
        }
      }

      // Try to fetch from profile API as last resort
      console.log("🔄 Attempting to fetch userId from profile API...");
      const profileResponse = await getProfile();
      const profile = profileResponse.data;

      if (profile?.userId) {
        console.log("✅ Got userId from profile API:", profile.userId);
        setUserId(profile.userId);
        // Store in AsyncStorage for future use
        await AsyncStorage.setItem("userId", profile.userId.toString());
        return profile.userId;
      }

      console.error("❌ No userId found anywhere");
      return null;
    } catch (error) {
      console.error("❌ Error getting userId:", error);
      return null;
    }
  };

  // Fetch profile data and allergies on load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // ✅ Try multiple sources for userId
        const currentUserId = await getUserId();

        if (!currentUserId) {
          console.error("❌ Could not determine userId during initialization");
          Alert.alert(
            "Error",
            "Could not load user information. Please try logging in again.",
            [
              {
                text: "Logout",
                onPress: () => handleLogout(),
              },
            ]
          );
          return;
        }

        // Fetch profile data
        const profileResponse = await getProfile();
        const profile = profileResponse.data;
        console.log("📄 Profile response:", profile);

        // ✅ Better handling of preferences with more robust fallback
        let preferences;
        if (profile?.reminderPreference) {
          preferences = profile.reminderPreference;
        } else if (profile?.preferences) {
          // Sometimes the API might return it as 'preferences' instead
          preferences = profile.preferences;
        } else {
          // Default preferences
          preferences = {
            notificationsEnabled: false,
            dailyTipsEnabled: false,
            reminderSound: "Chime",
          };
        }

        setNotificationsEnabled(preferences.notificationsEnabled ?? false);
        setDailyTipsEnabled(preferences.dailyTipsEnabled ?? false);
        setReminderSound(preferences.reminderSound ?? "Chime");

        // Fetch allergies
        const allergiesResponse = await getAllergies();
        setAllergies(allergiesResponse.data || []);
      } catch (error) {
        console.error("Error fetching profile:", error);
        Alert.alert("Error", "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    const fetchUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem("username");
        setUsername(storedUsername);
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };

    fetchData();
    fetchUsername();
  }, []);

  const handleAddAllergy = async () => {
    if (newAllergy.trim() === "") {
      Alert.alert("Error", "Please enter an allergy name");
      return;
    }

    // ✅ Use the enhanced getUserId function
    const currentUserId = await getUserId();
    if (!currentUserId) {
      Alert.alert("Error", "User ID not found. Please try logging in again.");
      return;
    }

    // Check if allergy already exists
    const existingAllergy = allergies.find(
      (allergy) =>
        allergy.name.toLowerCase() === newAllergy.trim().toLowerCase()
    );

    if (existingAllergy) {
      Alert.alert("Error", "This allergy already exists");
      return;
    }

    const allergy: Allergy = {
      name: newAllergy.trim(),
      severity: "Mild",
      userId: currentUserId,
    };

    try {
      await addAllergy(allergy);
      const updatedAllergies = await getAllergies();
      setAllergies(updatedAllergies.data || []);
      setNewAllergy("");
      Alert.alert("Success", "Allergy added successfully");
    } catch (error) {
      console.error("Error adding allergy:", error);
      Alert.alert("Error", "Failed to add allergy");
    }
  };

  const handleDeleteAllergy = async (
    allergyId: number,
    allergyName: string
  ) => {
    Alert.alert(
      "Delete Allergy",
      `Are you sure you want to delete "${allergyName}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAllergy(allergyId);
              const updatedAllergies = await getAllergies();
              setAllergies(updatedAllergies.data || []);
              Alert.alert("Success", "Allergy deleted successfully");
            } catch (error) {
              console.error("Error deleting allergy:", error);
              Alert.alert("Error", "Failed to delete allergy");
            }
          },
        },
      ]
    );
  };

  const handleSavePreferences = async () => {
    // ✅ Use the enhanced getUserId function
    const currentUserId = await getUserId();
    if (!currentUserId) {
      Alert.alert("Error", "User ID not found. Please try logging in again.");
      return;
    }

    setSavingPreferences(true);
    const preferences: ReminderPreference = {
      notificationsEnabled,
      dailyTipsEnabled,
      reminderSound,
      userId: currentUserId,
    };

    try {
      await updatePreferences(preferences);
      Alert.alert("Success", "Preferences updated successfully");
    } catch (error) {
      console.error("Error updating preferences:", error);
      Alert.alert("Error", "Failed to update preferences");
    } finally {
      setSavingPreferences(false);
    }
  };

  // ✅ Enhanced handleDeleteAllReminders with better error handling
  const handleDeleteAllReminders = async () => {
    // ✅ Use the enhanced getUserId function
    const currentUserId = await getUserId();
    if (!currentUserId) {
      Alert.alert("Error", "User ID not found. Please try logging in again.", [
        {
          text: "OK",
          onPress: () => console.log("User acknowledged error"),
        },
        {
          text: "Logout",
          onPress: () => handleLogout(),
        },
      ]);
      return;
    }

    Alert.alert(
      "Delete All Reminders",
      "Are you sure you want to delete all your reminders? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            setDeletingReminders(true);
            try {
              console.log("🔄 Fetching reminders for userId:", currentUserId);

              // ✅ Use the new getAllUserReminders function with proper error handling
              const remindersResponse = await getAllUserReminders();

              // ✅ Validate the response structure
              let reminders = [];
              if (Array.isArray(remindersResponse)) {
                reminders = remindersResponse;
              } else if (
                remindersResponse &&
                Array.isArray(remindersResponse.data)
              ) {
                reminders = remindersResponse.data;
              } else if (
                remindersResponse &&
                Array.isArray(remindersResponse.reminders)
              ) {
                reminders = remindersResponse.reminders;
              } else {
                console.error(
                  "❌ Unexpected response format:",
                  remindersResponse
                );
                Alert.alert(
                  "Error",
                  "Failed to fetch reminders. Please try again."
                );
                return;
              }

              console.log(`📊 Found ${reminders.length} reminders to process`);

              if (!reminders || reminders.length === 0) {
                Alert.alert("Info", "No reminders to delete.");
                return;
              }

              console.log(`🔄 Deleting ${reminders.length} reminders...`);

              // ✅ Delete each reminder by its id with error handling for each deletion
              const deletePromises = reminders.map(
                async (reminder: ReminderItem) => {
                  try {
                    // ✅ Handle different possible ID field names
                    const reminderId = reminder.reminderId || reminder.id;
                    if (!reminderId) {
                      console.warn("⚠️ Reminder without ID found:", reminder);
                      return { success: false, error: "No ID found" };
                    }

                    console.log("🗑️ Deleting reminder:", reminderId);
                    await deleteReminder(reminderId);
                    return { success: true, id: reminderId };
                  } catch (error: any) {
                    console.error(
                      "❌ Failed to delete reminder:",
                      reminder,
                      error
                    );
                    return { success: false, error: error.message, reminder };
                  }
                }
              );

              const results = await Promise.allSettled(deletePromises);

              // ✅ Count successful deletions
              const successful = results.filter(
                (result) =>
                  result.status === "fulfilled" && result.value.success
              ).length;

              const failed = results.length - successful;

              if (failed > 0) {
                console.warn(`⚠️ ${failed} reminders failed to delete`);
                Alert.alert(
                  "Partial Success",
                  `${successful} reminders deleted successfully. ${failed} failed to delete. Please try again for the remaining reminders.`
                );
              } else {
                Alert.alert(
                  "Success",
                  `All ${successful} reminders deleted successfully.`
                );
              }
            } catch (error: any) {
              console.error("❌ Error in delete all reminders process:", error);
              Alert.alert(
                "Error",
                `Failed to delete reminders: ${
                  error.message || "Unknown error"
                }. Please try again.`
              );
            } finally {
              setDeletingReminders(false);
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            // Clear stored data
            await AsyncStorage.multiRemove(["token", "username", "userId"]);
            // Reset state
            setUserId(null);
            setUsername(null);
            router.replace("/(auth)/login");
          } catch (error) {
            console.error("Error during logout:", error);
            // Force navigation even if clearing storage fails
            router.replace("/(auth)/login");
          }
        },
      },
    ]);
  };

  const handleReminderSoundChange = () => {
    const soundOptions = ["Chime", "Bell", "Notification", "Alert", "Gentle"];

    const buttons: AlertButton[] = soundOptions.map((sound) => ({
      text: sound,
      onPress: () => setReminderSound(sound),
    }));

    buttons.push({
      text: "Cancel",
      style: "cancel",
    });

    Alert.alert(
      "Select Reminder Sound",
      "Choose your preferred reminder sound:",
      buttons
    );
  };

  // ✅ Show loading state while fetching initial data
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#52a2c7" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>My Profile</Text>

      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {username ? username.substring(0, 2).toUpperCase() : "MR"}
          </Text>
        </View>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.nameText}>
          {username ? username : "MediReminder User"}
        </Text>
      </View>

      {/* Allergy Info */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Allergy Information</Text>
        </View>

        {allergies.length === 0 ? (
          <Text style={styles.noDataText}>No allergies recorded</Text>
        ) : (
          allergies.map((item, index) => (
            <View
              key={`allergy-${item.allergyId ?? index}`}
              style={styles.allergyItem}
            >
              <View style={styles.allergyInfo}>
                <Text style={styles.label}>Allergy {index + 1}</Text>
                <TextInput
                  style={styles.input}
                  value={item.name}
                  editable={false}
                />
                <Text style={styles.severityText}>
                  Severity: {item.severity}
                </Text>
              </View>
              {item.allergyId && (
                <TouchableOpacity
                  style={styles.deleteAllergyButton}
                  onPress={() =>
                    handleDeleteAllergy(item.allergyId!, item.name)
                  }
                >
                  <Text style={styles.deleteAllergyText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}

        <Text style={styles.label}>Add New Allergy</Text>
        <TextInput
          style={styles.input}
          value={newAllergy}
          onChangeText={setNewAllergy}
          placeholder="Type allergy name..."
          maxLength={50}
        />

        <TouchableOpacity
          style={[
            styles.addButton,
            newAllergy.trim() === "" && styles.disabledButton,
          ]}
          onPress={handleAddAllergy}
          disabled={newAllergy.trim() === ""}
        >
          <Text style={styles.addButtonText}>Add Allergy</Text>
        </TouchableOpacity>
      </View>

      {/* Reminder Preferences */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Reminder Preferences</Text>
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Enable Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: "#767577", true: "#52a2c7" }}
            thumbColor={notificationsEnabled ? "#ffffff" : "#f4f3f4"}
          />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Daily Health Tips</Text>
          <Switch
            value={dailyTipsEnabled}
            onValueChange={setDailyTipsEnabled}
            trackColor={{ false: "#767577", true: "#52a2c7" }}
            thumbColor={dailyTipsEnabled ? "#ffffff" : "#f4f3f4"}
          />
        </View>
        <Text style={styles.label}>Reminder Sound</Text>
        <TouchableOpacity onPress={handleReminderSoundChange}>
          <TextInput
            style={[styles.input, styles.soundInput]}
            value={reminderSound}
            editable={false}
            pointerEvents="none"
          />
        </TouchableOpacity>
        <Text style={styles.helperText}>Tap to change sound</Text>

        <TouchableOpacity
          style={[styles.addButton, savingPreferences && styles.disabledButton]}
          onPress={handleSavePreferences}
          disabled={savingPreferences}
        >
          {savingPreferences ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.addButtonText}>Save Preferences</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        style={[
          styles.deleteButton,
          deletingReminders && styles.disabledButton,
        ]}
        onPress={handleDeleteAllReminders}
        disabled={deletingReminders}
      >
        {deletingReminders ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.deleteButtonText}>Delete All Reminders</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.dashboardButton}
        onPress={() => router.push("/dashboard")}
      >
        <Text style={styles.dashboardButtonText}>Go to Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 20,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    backgroundColor: "#52a2c7",
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  welcomeText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  nameText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  card: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  noDataText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 10,
  },
  allergyItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  allergyInfo: {
    flex: 1,
  },
  severityText: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  deleteAllergyButton: {
    backgroundColor: "#f44336",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  deleteAllergyText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    backgroundColor: "#fff",
  },
  soundInput: {
    backgroundColor: "#f5f5f5",
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
    fontStyle: "italic",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  addButton: {
    backgroundColor: "#52a2c7",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#f44336",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  dashboardButton: {
    backgroundColor: "#52a2c7",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  dashboardButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: "#f44336",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  logoutText: {
    color: "#f44336",
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
