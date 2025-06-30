import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.1.5:8080", // <-- replace with your system's IP
});

// Fetch all reminders
export const fetchReminders = () => api.get("/reminders");

// Fetch today's reminders for a user
export const fetchTodaysReminders = (userId) =>
  api.get(`/reminders/today?userId=${userId}`);

// Fetch adherence summary
export const fetchAdherenceSummary = (weekStart) =>
  api.get(`/reminders/adherence-summary?weekStart=${weekStart}`);

// Fetch calendar dates with reminders
export const fetchCalendarReminders = () => api.get("/reminders/calendar");

// Fetch reminders within a date range
export const fetchReminderReport = (from, to) =>
  api.get(`/reminders/report?from=${from}&to=${to}`);

// Create a new reminder
export const createReminder = (reminderData) =>
  api.post("/reminders", reminderData);

// Update an existing reminder
export const updateReminder = (reminderId, updatedData) =>
  api.put(`/reminders/${reminderId}`, updatedData);

// Delete a reminder
export const deleteReminder = (reminderId) =>
  api.delete(`/reminders/${reminderId}`);

// Update reminder status
export const updateReminderStatus = (reminderId, status) =>
  api.put(`/reminders/${reminderId}/status?status=${status}`);

// Snooze a reminder
export const snoozeReminder = (reminderId, snoozeDuration) =>
  api.put(`/reminders/${reminderId}/snooze?snoozeDuration=${snoozeDuration}`);
