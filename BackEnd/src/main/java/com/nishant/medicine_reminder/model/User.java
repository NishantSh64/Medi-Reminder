package com.nishant.medicine_reminder.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private ReminderPreference reminderPreference;
    @OneToMany(mappedBy = "user")
    @JsonIgnore // Completely ignore this field during serialization
    private List<Reminder> reminders;

    @OneToMany(mappedBy = "user")
    @JsonIgnore // Completely ignore this field during serialization
    private List<Medicine> medicines;

    @Column(nullable = false)
    private String name;  // used as username

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Transient
    private String password;

    @Column(name = "created_at", updatable = false, insertable = false)
    private Timestamp createdAt;

    // Use name as username for Spring Security
    public String getUsername() {
        return email;
    }

    public void setName(String name) {
        this.name = name;
    }

    // For password, only getter/setter of hashed password
    public String getPassword() {
        return passwordHash;
    }
    public String getRawPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.passwordHash = password;
    }

    public Long getUserId() {
        return userId;
    }
}