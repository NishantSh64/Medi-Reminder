import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { LineChart } from "react-native-chart-kit";
import {
  getAdherenceSummary,
  getMedicationsDueToday,
  snoozeReminder,
  updateReminderStatus,
} from "../../src/api/reminderApi";
import { useFocusEffect } from "@react-navigation/native";
import API_BASE_URL from "src/api/apiConfig";
import { getAuthHeaders } from "src/api/authHeaders";

const screenWidth = Dimensions.get("window").width;

interface AdherenceChartData {
  labels: string[];
  datasets: { data: number[] }[];
}

interface Medication {
  id: number;
  medicineName: string;
  dosage?: string;
  time?: string;
  due?: boolean;
  isAddPrompt?: boolean;
  message?: string;
  buttonText?: string;
  buttonAction?: string;
  date?: string; // <-- if you're adding calendar support
}

export default function Dashboard() {
  const router = useRouter();

  const [medications, setMedications] = useState<Medication[]>([]);
  const [markedDates, setMarkedDates] = useState({});
  const [adherenceData, setAdherenceData] = useState<AdherenceChartData>({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }],
  });
  const [loadingMeds, setLoadingMeds] = useState<boolean>(true);
  const [medsError, setMedsError] = useState<string | null>(null);
  const [adherenceEmpty, setAdherenceEmpty] = useState<boolean>(false);
  const [adherenceMessage, setAdherenceMessage] = useState<string>("");

  useEffect(() => {
    fetchMedications();
    fetchAdherence();
  }, []);
  useFocusEffect(
    React.useCallback(() => {
      fetchMedications();
      fetchAdherence();
    }, [])
  );
  const fetchMedications = async () => {
    setLoadingMeds(true);
    setMedsError(null);

    try {
      console.log("=== STARTING API CALL ===");
      console.log("Calling getMedicationsDueToday()...");

      const meds: Medication[] = await getMedicationsDueToday();

      console.log("=== API RESPONSE RECEIVED ===");
      console.log("Response type:", typeof meds);
      console.log("Is array:", Array.isArray(meds));
      console.log("Length:", meds?.length || 0);
      console.log("Raw response:", JSON.stringify(meds, null, 2));

      if (meds && meds.length > 0) {
        console.log("=== ANALYZING ITEMS ===");
        meds.forEach((item, index) => {
          console.log(`Item ${index}:`, {
            id: item.id,
            name: item.medicineName,
            isAddPrompt: item.isAddPrompt,
            message: item.message,
            buttonText: item.buttonText,
            dosage: item.dosage,
            time: item.time,
          });
        });

        // Check if we have real medications or just prompts
        const realMedications = meds.filter((med) => !med.isAddPrompt);
        const promptCards = meds.filter((med) => med.isAddPrompt);

        console.log("Real medications count:", realMedications.length);
        console.log("Prompt cards count:", promptCards.length);

        if (realMedications.length > 0) {
          console.log("Real medications:", realMedications);
        }
      }

      const today = new Date().toISOString().split("T")[0];
      const dates: { [key: string]: { marked: boolean; dotColor: string } } =
        {};

      // Check if we received add prompt or real medications
      const hasRealMedications = meds && meds.some((med) => !med.isAddPrompt);

      if (hasRealMedications) {
        dates[today] = { marked: true, dotColor: "#FF6B6B" };
        setMarkedDates(dates);
      }

      setMedications(meds || []);
    } catch (error) {
      console.error("=== API ERROR ===");
      console.error("Error details:", error);
      setMedsError(
        "Unable to fetch medications. Please check your connection."
      );
    } finally {
      setLoadingMeds(false);
    }
  };

  const fetchAdherence = async () => {
    try {
      console.log("Fetching adherence data...");
      const summary = await getAdherenceSummary();
      console.log("Raw API response:", summary);

      // Check if adherence data is empty
      if (summary && summary.isEmpty) {
        setAdherenceEmpty(true);
        setAdherenceMessage(summary.message || "No adherence data available");
        setAdherenceData({
          labels: summary.labels || [
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
            "Sun",
          ],
          datasets: [{ data: summary.values || [0, 0, 0, 0, 0, 0, 0] }],
        });
        return;
      }

      if (
        summary &&
        Array.isArray(summary.values) &&
        summary.values.length > 0
      ) {
        // More robust data cleaning
        const cleanedValues = summary.values.map((v: any) => {
          const num = Number(v);
          // Check for NaN, Infinity, -Infinity, and null/undefined
          if (!Number.isFinite(num) || num < 0 || num > 100) {
            console.log("Invalid value found:", v, "converting to 0");
            return 0; // Default to 0 for invalid values
          }
          return Math.round(num); // Round to integer for cleaner display
        });

        console.log("Cleaned values:", cleanedValues);

        // Ensure we have valid labels
        const validLabels =
          Array.isArray(summary.labels) && summary.labels.length > 0
            ? summary.labels
            : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        // Ensure data and labels have same length
        const finalData =
          cleanedValues.length === validLabels.length
            ? cleanedValues
            : [0, 0, 0, 0, 0, 0, 0];

        console.log("Final chart data:", {
          labels: validLabels,
          data: finalData,
        });

        // Check if all values are zero
        const allZero = finalData.every((val: number) => val === 0);
        setAdherenceEmpty(allZero);
        if (allZero) {
          setAdherenceMessage(
            "No adherence data available. Add medications to track your progress."
          );
        }

        setAdherenceData({
          labels: validLabels,
          datasets: [{ data: finalData }],
        });
      } else {
        console.log("No valid data received, using defaults");
        setAdherenceEmpty(true);
        setAdherenceMessage(
          "No adherence data available. Add medications to track your progress."
        );

        // Fallback data
        const defaultLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const defaultValues = [0, 0, 0, 0, 0, 0, 0];

        setAdherenceData({
          labels: defaultLabels,
          datasets: [{ data: defaultValues }],
        });
      }
    } catch (error) {
      console.error("Error fetching adherence summary:", error);
      console.log("Setting fallback data due to error");
      setAdherenceEmpty(true);
      setAdherenceMessage(
        "Unable to load adherence data. Add medications to get started."
      );

      // Set safe fallback data on error
      setAdherenceData({
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }],
      });
    }
  };

  const handleMarkAsTaken = async (id: number) => {
    try {
      console.log(`Attempting to mark reminder ${id} as taken`);

      const result = await updateReminderStatus(id, "TAKEN");
      console.log("Mark as taken result:", result);

      Alert.alert("Success", "Medication marked as taken!");

      // Refresh the data
      await fetchMedications();
      await fetchAdherence();
    } catch (error: any) {
      console.error("Error marking as taken:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to mark as taken. Please try again."
      );
    }
  };

  const handleSnooze = async (id: number) => {
    try {
      console.log(`Attempting to snooze reminder ${id}`);

      const result = await snoozeReminder(id);
      console.log("Snooze result:", result);

      Alert.alert("Snoozed", "Reminder snoozed for 10 minutes.");

      // Refresh the medications list
      await fetchMedications();
    } catch (error: any) {
      console.error("Error snoozing:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to snooze reminder. Please try again."
      );
    }
  };
  const handleMarkAsTakenAlternative = async (id: number) => {
    try {
      console.log(
        `Attempting to mark reminder ${id} as taken (alternative method)`
      );

      // Try with query parameter instead of body
      const response = await fetch(
        `${API_BASE_URL}/reminders/${id}/status?status=TAKEN`,
        {
          method: "PUT",
          credentials: "include",
          headers: await getAuthHeaders(),
        }
      );

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to update status: ${errorText}`);
        throw new Error(`Failed to update status: ${response.status}`);
      }

      // Handle response safely
      let result = { success: true };
      try {
        const responseText = await response.text();
        if (responseText.trim()) {
          result = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.log("Non-JSON response, assuming success");
      }

      Alert.alert("Success", "Medication marked as taken!");
      await fetchMedications();
      await fetchAdherence();
    } catch (error: any) {
      console.error("Error marking as taken (alternative):", error);
      Alert.alert(
        "Error",
        error.message || "Failed to mark as taken. Please try again."
      );
    }
  };
  const handleAddMedicine = () => {
    router.push("/(tabs)/add-reminder");
  };

  const handleAddPromptAction = (action: string) => {
    switch (action) {
      case "add-medicine":
      case "add-reminder":
        router.push("/(tabs)/add-reminder");
        break;
      default:
        router.push("/(tabs)/add-reminder");
    }
  };

  // Check if chart data is safe to render
  const isChartDataValid = () => {
    return (
      adherenceData.datasets &&
      adherenceData.datasets[0] &&
      adherenceData.datasets[0].data &&
      adherenceData.datasets[0].data.length > 0 &&
      adherenceData.datasets[0].data.every(
        (val) => Number.isFinite(val) && val >= 0
      )
    );
  };

  // Fix for the renderMedicationCard function
  // Replace the existing renderMedicationCard function with this updated version:
  const renderMedicationCard = (med: Medication) => {
    console.log("Rendering medication card for:", med);

    // Handle add prompt cards correctly
    if (med.isAddPrompt) {
      return (
        <View key={med.id} style={styles.addPromptCard}>
          <View style={styles.addPromptContent}>
            <MaterialCommunityIcons name="pill" size={48} color="#52a2c7" />
            {/* Show the proper prompt title, not "Unknown Medicine" */}
            <Text style={styles.addPromptTitle}>
              {med.medicineName || "Add Your First Medication"}
            </Text>
            <Text style={styles.addPromptMessage}>
              {med.message || "Get started by adding your medication reminders"}
            </Text>
            <TouchableOpacity
              style={styles.addPromptButton}
              onPress={() =>
                handleAddPromptAction(med.buttonAction || "add-medicine")
              }
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFF" />
              <Text style={styles.addPromptButtonText}>
                {med.buttonText || "Add Medicine"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Handle real medication cards
    const medicineName = med.medicineName || "Unnamed Medication";

    return (
      <View key={med.id} style={styles.medicationCard}>
        <View style={styles.medHeader}>
          <MaterialCommunityIcons name="pill" size={20} color="#52a2c7" />
          <Text style={styles.medName}>{medicineName}</Text>
        </View>

        {med.dosage && (
          <Text style={styles.medDosage}>Dosage: {med.dosage}</Text>
        )}

        {med.time && <Text style={styles.medTime}>⏰ {med.time}</Text>}

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.markButton}
            onPress={() => handleMarkAsTaken(med.id as number)}
          >
            <Text style={styles.buttonText}>Mark as Taken</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.snoozeButton}
            onPress={() => handleSnooze(med.id as number)}
          >
            <Text style={{ color: "#333" }}>Snooze</Text>
          </TouchableOpacity>
          {med.due && <Text style={styles.dueLabel}>Due Soon</Text>}
        </View>
      </View>
    );
  };

  const renderAdherenceChart = () => {
    if (adherenceEmpty) {
      return (
        <View style={styles.chartPlaceholder}>
          <MaterialCommunityIcons name="chart-line" size={48} color="#ccc" />
          <Text style={styles.chartPlaceholderText}>No adherence data yet</Text>
          <Text style={styles.chartPlaceholderSubtext}>{adherenceMessage}</Text>
          <TouchableOpacity
            style={styles.chartAddButton}
            onPress={handleAddMedicine}
          >
            <Ionicons name="add-circle-outline" size={20} color="#52a2c7" />
            <Text style={styles.chartAddButtonText}>Add Reminder</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (isChartDataValid()) {
      return (
        <LineChart
          data={adherenceData}
          width={screenWidth - 30}
          height={220}
          chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(82, 162, 199, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            propsForDots: { r: "5", strokeWidth: "2", stroke: "#52a2c7" },
          }}
          bezier
          style={{ borderRadius: 16, marginVertical: 8 }}
        />
      );
    }

    return (
      <View style={styles.chartPlaceholder}>
        <MaterialCommunityIcons name="chart-line" size={48} color="#ccc" />
        <Text style={styles.chartPlaceholderText}>Chart data unavailable</Text>
        <Text style={styles.chartPlaceholderSubtext}>
          Please check your connection and try again
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchAdherence}>
          <Text style={{ color: "#FFF" }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Health Dashboard</Text>
        <TouchableOpacity
          onPress={() => {
            // Handle notifications - you can implement this later
            Alert.alert("Notifications", "No new notifications");
          }}
        >
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Stay Consistent, Feel Your Best!</Text>
        <Text style={styles.bannerSubtitle}>
          Every dose counts on your journey to wellness.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Medications Due Today</Text>

      {loadingMeds ? (
        <ActivityIndicator size="large" color="#52a2c7" />
      ) : medsError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{medsError}</Text>
          <TouchableOpacity
            onPress={fetchMedications}
            style={styles.retryButton}
          >
            <Text style={{ color: "#FFF" }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        medications.map(renderMedicationCard)
      )}

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => router.push("../(tabs)/add-reminder")}
        >
          <Ionicons name="add-circle-outline" size={24} color="#52a2c7" />
          <Text style={styles.quickActionText}>Add New Reminder</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => router.push("./(tabs)/prescriptionScreen")}
        >
          <Ionicons name="document-text-outline" size={24} color="#52a2c7" />
          <Text style={styles.quickActionText}>Prescriptions</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Your Calendar</Text>
      <Calendar
        markedDates={markedDates}
        theme={{
          selectedDayBackgroundColor: "#52a2c7",
          todayTextColor: "#52a2c7",
        }}
        onDayPress={(day) => {
          // Handle calendar day press - you can navigate to day view
          console.log("Selected day:", day);
          // router.push(`/(tabs)/day-view?date=${day.dateString}`);
        }}
      />

      <Text style={styles.sectionTitle}>Weekly Adherence</Text>
      {renderAdherenceChart()}
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => router.push("/(tabs)/profile")}
      >
        <Ionicons name="person-circle-outline" size={20} color="#FFF" />
        <Text style={styles.profileButtonText}>Go to Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  buttonText: {
    color: "#FFF",
    fontWeight: "600",
  },
  container: {
    padding: 16,
    paddingBottom: 120,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  banner: {
    backgroundColor: "#DCEEFB",
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "#555",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 12,
  },
  medicationCard: {
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addPromptCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: "#E3F2FD",
    borderStyle: "dashed",
  },
  addPromptContent: {
    padding: 24,
    alignItems: "center",
  },
  addPromptTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 12,
    marginBottom: 8,
  },
  addPromptMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  addPromptButton: {
    backgroundColor: "#52a2c7",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addPromptButtonText: {
    color: "#FFF",
    fontWeight: "600",
    marginLeft: 8,
  },
  medHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  medName: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  medDosage: {
    fontSize: 14,
    color: "#555",
    marginVertical: 4,
  },
  medTime: {
    fontSize: 13,
    color: "#333",
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  markButton: {
    backgroundColor: "#52a2c7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  snoozeButton: {
    backgroundColor: "#D3D3D3",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  dueLabel: {
    color: "#FF6B6B",
    fontSize: 12,
    fontWeight: "600",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  quickActionButton: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  quickActionText: {
    marginTop: 6,
    fontSize: 13,
    color: "#333",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: "#52a2c7",
    padding: 10,
    borderRadius: 8,
  },
  chartPlaceholder: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    marginVertical: 8,
    elevation: 2,
  },
  chartPlaceholderText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
    fontWeight: "500",
  },
  chartPlaceholderSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
    textAlign: "center",
    marginBottom: 16,
  },
  chartAddButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  chartAddButtonText: {
    color: "#52a2c7",
    fontWeight: "600",
    marginLeft: 8,
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#52a2c7",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 24,
    alignSelf: "center",
  },
  profileButtonText: {
    color: "#FFF",
    fontSize: 16,
    marginLeft: 8,
  },
});
