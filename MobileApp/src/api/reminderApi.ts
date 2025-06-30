import { AnimatedKeyboardOptions } from "react-native-reanimated";
import API_BASE_URL from "./apiConfig";
import { getAuthHeaders } from "./authHeaders";
import api from "./apiInstance";

// Common headers with optional JSON Content-Type
const jsonHeaders = async () => ({
  ...(await getAuthHeaders()),
  "Content-Type": "application/json",
});

// Fetch reminders due today
// Replace your getMedicationsDueToday function in reminderApi.js with this:

export const getMedicationsDueToday = async (): Promise<any[]> => {
  try {
    console.log("=== API CALL STARTING ===");
    console.log("URL:", `${API_BASE_URL}/reminders/due-today`);

    const headers = await getAuthHeaders();
    console.log("Headers:", headers);

    const response = await fetch(`${API_BASE_URL}/reminders/due-today`, {
      credentials: "include",
      headers: headers,
    });

    console.log("=== API RESPONSE STATUS ===");
    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);
    console.log("OK:", response.ok);

    if (!response.ok) {
      console.log("Response not ok, status:", response.status);

      // Try to get error details
      try {
        const errorText = await response.text();
        console.log("Error response body:", errorText);
      } catch (e) {
        console.log("Could not read error response");
      }

      // Return add medicine prompt instead of mock data
      return [
        {
          id: "add-medicine",
          isAddPrompt: true,
          name: "No medications found",
          message: "Get started by adding your first medication reminder",
          buttonText: "Add Medicine",
          buttonAction: "add-medicine",
        },
      ];
    }

    const data = await response.json();
    console.log("=== API RESPONSE DATA ===");
    console.log("Data type:", typeof data);
    console.log("Is array:", Array.isArray(data));
    console.log("Data length:", data?.length || 0);
    console.log("Raw data:", data);
    console.log("Stringified data:", JSON.stringify(data, null, 2));

    // If no medications returned, show add medicine prompt
    if (!data || data.length === 0) {
      console.log("No medications in response, returning add prompt");
      return [
        {
          id: "add-medicine",
          isAddPrompt: true,
          name: "No medications scheduled",
          message: "Add your first medication reminder to get started",
          buttonText: "Add Medicine",
          buttonAction: "add-medicine",
        },
      ];
    }

    // Log each medication for debugging
    if (Array.isArray(data)) {
      data.forEach((med, index) => {
        console.log(`Medication ${index}:`, {
          id: med.id,
          name: med.medicineName,
          medication_name: med.medication_name,
          drug_name: med.drug_name,
          dosage: med.dosage,
          time: med.time,
          due: med.due,
          allKeys: Object.keys(med),
        });
      });
    }

    return data;
  } catch (error: any) {
    console.error("=== NETWORK ERROR ===");
    console.error("Error type:", typeof error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Full error:", error);

    // Return add medicine prompt instead of mock data
    return [
      {
        id: "add-medicine",
        isAddPrompt: true,
        name: "Unable to load medications",
        message: "Start by adding your medication reminders",
        buttonText: "Add Reminder",
        buttonAction: "add-medicine",
      },
    ];
  }
};

// Fetch adherence summary
export const getAdherenceSummary = async (): Promise<any | null> => {
  try {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const weekStartStr = weekStart.toISOString().split("T")[0];

    const response = await fetch(
      `${API_BASE_URL}/reminders/adherence-summary?weekStart=${weekStartStr}`,
      { credentials: "include", headers: await getAuthHeaders() }
    );

    if (!response.ok) {
      return {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        values: [0, 0, 0, 0, 0, 0, 0], // Show empty chart instead of mock data
        isEmpty: true,
        message:
          "No adherence data available. Add medications to track your progress.",
      };
    }
    const data = await response.json();

    // Check if data is empty
    if (
      !data ||
      (data.values && data.values.every((val: number) => val === 0))
    ) {
      return {
        ...data,
        isEmpty: true,
        message:
          "No adherence data available. Add medications to track your progress.",
      };
    }

    return data;
  } catch (error) {
    console.error("Error fetching adherence summary:", error);
    return {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      values: [0, 0, 0, 0, 0, 0, 0],
      isEmpty: true,
      message: "Unable to load adherence data. Add medications to get started.",
    };
  }
};

// Get all reminders
export const getAllReminders = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reminders`, {
      credentials: "include",
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      return [
        {
          id: "add-reminder",
          isAddPrompt: true,
          name: "No reminders found",
          message: "Create your first medication reminder",
          buttonText: "Add Reminder",
          buttonAction: "add-reminder",
        },
      ];
    }

    const data = await response.json();

    // If no reminders returned, show add reminder prompt
    if (!data || data.length === 0) {
      return [
        {
          id: "add-reminder",
          isAddPrompt: true,
          name: "No reminders set",
          message: "Add your first medication reminder to get started",
          buttonText: "Add Reminder",
          buttonAction: "add-reminder",
        },
      ];
    }

    return data;
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return [
      {
        id: "add-reminder",
        isAddPrompt: true,
        name: "Unable to load reminders",
        message: "Get started by adding your medication reminders",
        buttonText: "Add Reminder",
        buttonAction: "add-reminder",
      },
    ];
  }
};

// Get today's reminders (alternate endpoint)
export const getTodayReminders = async () => {
  try {
    console.log("🔄 Fetching today's reminders");

    const headers = await getAuthHeaders();
    const response = await api.get("/reminders/today", { headers });

    console.log("✅ Today's reminders fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error in getTodayReminders:", error);
    throw new Error("Failed to fetch today's reminders");
  }
};

// Create a new reminder
export const createReminder = async (reminderData: any): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reminders`, {
      method: "POST",
      headers: await jsonHeaders(),
      credentials: "include",
      body: JSON.stringify(reminderData),
    });
    if (!response.ok) throw new Error("Failed to create reminder.");
    return await response.json();
  } catch (error) {
    console.error("Error creating reminder:", error);
    throw error;
  }
};

// Get reminder by ID
export const getReminderById = async (id: number): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reminders/${id}`, {
      credentials: "include",
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch reminder by ID.");
    return await response.json();
  } catch (error) {
    console.error(`Error fetching reminder ${id}:`, error);
    return null;
  }
};

// Update a reminder
export const updateReminder = async (
  id: number,
  updatedData: any
): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reminders/${id}`, {
      method: "PUT",
      headers: await jsonHeaders(),
      credentials: "include",
      body: JSON.stringify(updatedData),
    });
    if (!response.ok) throw new Error("Failed to update reminder.");
    return await response.json();
  } catch (error) {
    console.error(`Error updating reminder ${id}:`, error);
    throw error;
  }
};

// Delete a reminder
export const deleteReminder = async (reminderId: any) => {
  try {
    console.log("🗑️ Deleting reminder with ID:", reminderId);

    if (!reminderId) {
      throw new Error("reminderId is required");
    }

    const headers = await getAuthHeaders();
    const response = await api.delete(`/reminders/${reminderId}`, { headers });

    console.log("✅ Reminder deleted successfully");
    return response.data;
  } catch (error: any) {
    console.error("❌ Error in deleteReminder:", error);

    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
      throw new Error(
        `Server error: ${error.response.status} - ${error.response.data}`
      );
    } else if (error.request) {
      console.error("No response received:", error.request);
      throw new Error("Network error: No response from server");
    } else {
      console.error("Error setting up request:", error.message);
      throw new Error(`Request error: ${error.message}`);
    }
  }
};
// Update reminder status
export const updateReminderStatus = async (
  id: number,
  status: string
): Promise<any> => {
  try {
    console.log(`Updating reminder ${id} with status: ${status}`);

    const response = await fetch(`${API_BASE_URL}/reminders/${id}/status`, {
      method: "PUT",
      credentials: "include",
      headers: {
        ...(await getAuthHeaders()),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: status }),
    });

    console.log(`Response status: ${response.status}`);
    console.log(`Response ok: ${response.ok}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Failed to update reminder status. Status: ${response.status}, Error: ${errorText}`
      );
      throw new Error(`Failed to update reminder status: ${response.status}`);
    }

    // Check if response has content before parsing JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      // Only parse if there's actual content
      if (responseText.trim()) {
        try {
          return JSON.parse(responseText);
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          console.error("Response text that failed to parse:", responseText);
          // Return success indicator even if JSON parsing fails
          return { success: true, message: "Status updated successfully" };
        }
      }
    }

    // Return success indicator for empty or non-JSON responses
    return { success: true, message: "Status updated successfully" };
  } catch (error) {
    console.error(`Error updating status for reminder ${id}:`, error);
    throw error;
  }
};

// Snooze a reminder
export const snoozeReminder = async (id: number): Promise<any> => {
  try {
    console.log(`Snoozing reminder ${id}`);

    const response = await fetch(`${API_BASE_URL}/reminders/${id}/snooze`, {
      method: "PUT",
      credentials: "include",
      headers: {
        ...(await getAuthHeaders()),
        "Content-Type": "application/json",
      },
    });

    console.log(`Snooze response status: ${response.status}`);
    console.log(`Snooze response ok: ${response.ok}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Failed to snooze reminder. Status: ${response.status}, Error: ${errorText}`
      );
      throw new Error(`Failed to snooze reminder: ${response.status}`);
    }

    // Check if response has content before parsing JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const responseText = await response.text();
      console.log("Snooze raw response:", responseText);

      // Only parse if there's actual content
      if (responseText.trim()) {
        try {
          return JSON.parse(responseText);
        } catch (parseError) {
          console.error("JSON parse error in snooze:", parseError);
          console.error("Response text that failed to parse:", responseText);
          // Return success indicator even if JSON parsing fails
          return { success: true, message: "Reminder snoozed successfully" };
        }
      }
    }

    // Return success indicator for empty or non-JSON responses
    return { success: true, message: "Reminder snoozed successfully" };
  } catch (error) {
    console.error(`Error snoozing reminder ${id}:`, error);
    throw error;
  }
};

// Get reminder dates for a month
export const getReminderDates = async (
  month: number,
  year: number
): Promise<string[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/reminders/calendar?month=${month}&year=${year}`,
      {
        credentials: "include",
        headers: await getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to fetch reminder dates.");
    return await response.json();
  } catch (error) {
    console.error("Error fetching reminder dates:", error);
    return [];
  }
};

// Weekly adherence summary
export const getWeeklyAdherenceSummary = async (
  weekStart: string
): Promise<any> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/reminders/adherence-summary?weekStart=${weekStart}`,
      {
        credentials: "include",
        headers: await getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to fetch adherence summary.");
    return await response.json();
  } catch (error) {
    console.error("Error fetching adherence summary:", error);
    return null;
  }
};

// Full report between dates
export const getFullReport = async (
  from: string,
  to: string
): Promise<any[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/reminders/report?from=${from}&to=${to}`,
      {
        credentials: "include",
        headers: await getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to fetch full report.");
    return await response.json();
  } catch (error) {
    console.error(`Error fetching full report from ${from} to ${to}:`, error);
    return [];
  }
};
// Add this function to your reminderApi.js file
export const createMedicineWithReminder = async (data: any) => {
  try {
    console.log(
      "Sending request to:",
      `${API_BASE_URL}/reminders/createMedicineWithReminder`
    );
    console.log("Request data:", JSON.stringify(data, null, 2));

    const response = await fetch(
      `${API_BASE_URL}/reminders/createMedicineWithReminder`,
      {
        method: "POST",
        headers: {
          ...(await getAuthHeaders()),
          "Content-Type": "application/json",
        },
        credentials: "include", // Add this for session handling
        body: JSON.stringify(data),
      }
    );

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      // Try to get more detailed error information
      let errorMessage;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage =
          errorData.message ||
          errorData.error ||
          `HTTP ${response.status}: ${response.statusText}`;
      } else {
        errorMessage = await response.text();
      }

      console.error("API Error Response:", errorMessage);
      throw new Error(
        errorMessage || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const result = await response.json();
    console.log("API Success Response:", result);
    return result;
  } catch (error) {
    console.error("Network/Parse Error:", error);

    // Re-throw with more specific error message
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Network error: Unable to connect to server. Please check your connection."
      );
    }

    throw error;
  }
};
export const getRemindersByUserId = async (userId: any) => {
  try {
    console.log("🔄 Fetching reminders for userId:", userId);

    if (!userId) {
      throw new Error("userId is required");
    }

    const headers = await getAuthHeaders();

    // ✅ Use the correct endpoint that matches your backend
    // Based on your controller, it seems like you need to use a different endpoint
    // Let's try the /reminders endpoint with user authentication
    const response = await api.get("/reminders", { headers });

    console.log("✅ Reminders fetched successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Error in getRemindersByUserId:", error);

    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
      throw new Error(
        `Server error: ${error.response.status} - ${error.response.data}`
      );
    } else if (error.request) {
      console.error("No response received:", error.request);
      throw new Error("Network error: No response from server");
    } else {
      console.error("Error setting up request:", error.message);
      throw new Error(`Request error: ${error.message}`);
    }
  }
};
export const getAllUserReminders = async () => {
  try {
    console.log("🔄 Fetching all user reminders");

    const headers = await getAuthHeaders();
    const response = await api.get("/reminders", { headers });

    console.log("✅ All reminders fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error in getAllUserReminders:", error);
    throw new Error("Failed to fetch reminders");
  }
};
