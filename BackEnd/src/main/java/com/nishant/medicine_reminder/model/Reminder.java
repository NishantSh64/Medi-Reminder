package com.nishant.medicine_reminder.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "reminders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Reminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reminder_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false)
    @JsonIgnoreProperties({"reminders", "user"}) // Ignore back-references
    private Medicine medicine;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"reminders", "medicines"})
    private User user;

    @Column(name = "reminder_date", nullable = false)
    private LocalDate reminderDate;

    @Column(name = "reminder_time", nullable = false)
    private LocalTime time;

    public Long getReminderId() {
        return this.id;
    }
    public Medicine getMedicine(){
        return medicine;
    }

    public enum ReminderStatus {
        PENDING, TAKEN, SKIPPED, MISSED, COMPLETED

    }

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ReminderStatus status = ReminderStatus.PENDING;

    @CreatedDate
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "notified", nullable = false)
    private Boolean notified = false;

    @Column(name = "dosage")
    private String dosage;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = ReminderStatus.PENDING;
        }
        if (notified == null) {
            notified = false;
        }
    }

    // Setter overrides (only if you need them)
    public void setUser(User user) { this.user = user; }
    public void setMedicine(Medicine medicine) { this.medicine = medicine; }
    public void setReminderTime(LocalTime time) { this.time = time; }
    public void setStatus(ReminderStatus status) { this.status = status; }
    public void setNotified(Boolean notified) { this.notified = notified; }
    public void setDosage(String dosage) { this.dosage = dosage; }
    public void setReminderDate(LocalDate reminderDate) { this.reminderDate = reminderDate; }
}
