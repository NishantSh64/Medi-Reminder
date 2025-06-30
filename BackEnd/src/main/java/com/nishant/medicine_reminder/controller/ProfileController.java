package com.nishant.medicine_reminder.controller;

import com.nishant.medicine_reminder.model.ReminderPreference;
import com.nishant.medicine_reminder.model.User;
import com.nishant.medicine_reminder.service.ReminderPreferenceService;
import com.nishant.medicine_reminder.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://192.168.60.181:8080")
public class ProfileController {

    @Autowired
    private UserService userService;

    @Autowired
    private ReminderPreferenceService preferenceService;

    // ✅ Get Profile: name, email, preferences, and userId
    @GetMapping
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("Unauthorized: UserDetails missing from security context");
        }

        String email = userDetails.getUsername();
        if (email == null) {
            return ResponseEntity.status(401).body("Unauthorized: No username in UserDetails");
        }

        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ReminderPreference preferences = preferenceService.getPreferenceByUserId(user.getUserId());
        if (preferences == null) {
            preferences = new ReminderPreference();
            preferences.setNotificationsEnabled(false);
            preferences.setDailyTipsEnabled(false);
            preferences.setReminderSound("Chime");
            preferences.setUserId(Math.toIntExact(user.getUserId()));
        }

        // ✅ Include userId in the response - this is what the frontend expects
        Map<String, Object> response = new HashMap<>();
        response.put("userId", user.getUserId()); // ✅ Add this line
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("reminderPreference", preferences); // ✅ Match frontend expectation

        System.out.println("✅ Profile response: " + response);
        return ResponseEntity.ok(response);
    }

    // ✅ Update preferences via POST to /api/profile/preferences
    @PostMapping("/preferences")
    public ResponseEntity<?> updatePreferences(@AuthenticationPrincipal UserDetails userDetails,
                                               @RequestBody ReminderPreference preference) {
        try {
            User user = userService.getUserByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // ✅ Ensure the preference has the correct userId
            preference.setUserId(Math.toIntExact(user.getUserId()));

            ReminderPreference updatedPref = preferenceService.saveOrUpdate(user.getUserId(), preference);

            return ResponseEntity.ok(Map.of(
                    "message", "Preferences updated successfully",
                    "preferences", updatedPref
            ));
        } catch (Exception e) {
            System.err.println("❌ Error updating preferences: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to update preferences",
                    "message", e.getMessage()
            ));
        }
    }
}