package com.nishant.medicine_reminder.service;

import com.nishant.medicine_reminder.model.ReminderPreference;
import com.nishant.medicine_reminder.model.User;
import com.nishant.medicine_reminder.repository.ReminderPreferenceRepository;
import com.nishant.medicine_reminder.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    private ReminderPreferenceRepository reminderPreferenceRepository;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void deleteUserById(Long id) {
        userRepository.deleteById(id);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public boolean authenticateUser(String email, String rawPassword) {
        User user = userRepository.findByEmail(email).orElse(null);
        return user != null && passwordEncoder.matches(rawPassword, user.getPasswordHash());
    }

    public User saveUser(User user) {
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            throw new RuntimeException("Password cannot be empty");
        }

        // Encode password
        user.setPasswordHash(passwordEncoder.encode(user.getPassword()));

        // Save user
        User savedUser = userRepository.save(user);

        // Create default preferences for this user
        ReminderPreference defaultPref = new ReminderPreference();
        defaultPref.setUser(savedUser);
        defaultPref.setNotificationsEnabled(false);
        defaultPref.setDailyTipsEnabled(false);
        defaultPref.setReminderSound("default");

        reminderPreferenceRepository.save(defaultPref);

        return savedUser;
    }

    public User updateUser(Long userId, User updatedUser) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Update user details
        existingUser.setName(updatedUser.getName());
        existingUser.setEmail(updatedUser.getEmail());

        // Update password only if a new one is provided
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            existingUser.setPasswordHash(passwordEncoder.encode(updatedUser.getPassword()));
        }

        return userRepository.save(existingUser);
    }
}
