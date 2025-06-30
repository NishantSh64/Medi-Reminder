package com.nishant.medicine_reminder.dto;

import com.nishant.medicine_reminder.model.Reminder;

import java.time.LocalDate;
import java.time.LocalTime;

public class ReminderResponseDTO {

    private Long reminderId;
    private String medicineName;
    private String dosage;
    private LocalTime reminderTime;
    private LocalDate reminderDate;
    private String status;
    private boolean notified;
    private Long userId;
    private String userEmail;

    // ✅ Constructor from Reminder entity
    public ReminderResponseDTO(Reminder reminder) {
        this.reminderId = (long) reminder.getReminderId();  // casting int to Long
        this.medicineName = reminder.getMedicine() != null ? reminder.getMedicine().getName() : null;
        this.dosage = reminder.getDosage();
        this.reminderTime = reminder.getTime();
        this.reminderDate = reminder.getReminderDate();
        this.status = reminder.getStatus() != null ? reminder.getStatus().name() : null;
        this.notified = reminder.getNotified() != null && reminder.getNotified();
        this.userId = reminder.getUser() != null ? reminder.getUser().getUserId() : null;
        this.userEmail = reminder.getUser() != null ? reminder.getUser().getEmail() : null;
    }

    // ✅ Getters & Setters

    public Long getReminderId() {
        return reminderId;
    }

    public void setReminderId(Long reminderId) {
        this.reminderId = reminderId;
    }

    public String getMedicineName() {
        return medicineName;
    }

    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
    }

    public String getDosage() {
        return dosage;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    public LocalTime getReminderTime() {
        return reminderTime;
    }

    public void setReminderTime(LocalTime reminderTime) {
        this.reminderTime = reminderTime;
    }

    public LocalDate getReminderDate() {
        return reminderDate;
    }

    public void setReminderDate(LocalDate reminderDate) {
        this.reminderDate = reminderDate;
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

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }
}
