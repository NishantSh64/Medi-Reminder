package com.nishant.medicine_reminder.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;

public class ReminderRequest {

    private UserDTO user;
    private MedicineDTO medicine;
    private String reminderTime; // Accepting time as String to convert later
    private String status;
    private boolean notified;

    @JsonFormat(pattern = "yyyy-MM-dd") // ensures correct JSON parsing
    private LocalDate reminderDate;

    // Getters and Setters
    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public MedicineDTO getMedicine() {
        return medicine;
    }

    public void setMedicine(MedicineDTO medicine) {
        this.medicine = medicine;
    }

    public String getReminderTime() {
        return reminderTime;
    }

    public void setReminderTime(String reminderTime) {
        this.reminderTime = reminderTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isNotified() {
        return notified;
    }

    public void setNotified(boolean notified) {
        this.notified = notified;
    }

    public LocalDate getReminderDate() { // ✅ corrected getter
        return reminderDate;
    }

    public void setReminderDate(LocalDate reminderDate) { // ✅ setter
        this.reminderDate = reminderDate;
    }
}
