package com.nishant.medicine_reminder.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reminder_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReminderPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "preference_id")
    private Long preferenceId;

    @Column(nullable = false)
    private boolean notificationsEnabled;

    @Column(nullable = false)
    private boolean dailyTipsEnabled;

    @Column(nullable = false)
    private String reminderSound;

    // Mapping to User (One-to-One)
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ✅ Get userId from associated User
    public long getUserId() {
        return (user != null ? user.getUserId() : null);
    }

    // ✅ Set userId by creating a User reference
    public void setUserId(long userId) {
        if (this.user == null) {
            this.user = new User();
        }
        this.user.setUserId((userId));
    }
}

