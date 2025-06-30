import api from "./apiInstance";
import { getAuthHeaders } from "./authHeaders";

// Interfaces
export interface Allergy {
  allergyId?: number; // make it optional if it's not always there
  name: string;
  severity: string;
  userId: number;
}

export interface ReminderPreference {
  preferenceId?: number;
  notificationsEnabled: boolean;
  dailyTipsEnabled: boolean;
  reminderSound: string;
  userId: number;
}

// ✅ GET /api/profile
export const getProfile = async () => {
  const headers = await getAuthHeaders();
  return api.get("/api/profile", { headers });
};

// ✅ POST /api/profile/preferences
export const updatePreferences = async (preferences: ReminderPreference) => {
  const headers = await getAuthHeaders();
  return api.post("/api/profile/preferences", preferences, { headers });
};

// ✅ GET /api/allergies
export const getAllergies = async () => {
  const headers = await getAuthHeaders();
  return api.get("/api/allergies", { headers });
};

// ✅ POST /api/allergies
export const addAllergy = async (allergy: Allergy) => {
  const headers = await getAuthHeaders();
  return api.post("/api/allergies", allergy, { headers });
};

// ✅ DELETE /api/allergies/{id}
export const deleteAllergy = async (id: number) => {
  const headers = await getAuthHeaders();
  return api.delete(`/api/allergies/${id}`, { headers });
};
