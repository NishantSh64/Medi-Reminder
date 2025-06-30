package com.nishant.medicine_reminder.controller;

import com.nishant.medicine_reminder.model.ReminderPreference;
import com.nishant.medicine_reminder.service.ReminderPreferenceService;
import com.nishant.medicine_reminder.service.UserService;
import com.nishant.medicine_reminder.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/preferences")
@CrossOrigin(origins = "http://192.168.60.181:8080")
public class ReminderPreferenceController {

    @Autowired
    private ReminderPreferenceService reminderPreferenceService;
    @Autowired
    private UserService userService;


    @GetMapping
    public ReminderPreference getPreferences(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserIdFromPrincipal(userDetails);
        return reminderPreferenceService.getPreferenceByUserId(userId);
    }

    @PostMapping
    public ReminderPreference updatePreferences(@AuthenticationPrincipal UserDetails userDetails,
                                                @RequestBody ReminderPreference preference) {
        Long userId = getUserIdFromPrincipal(userDetails);
        return reminderPreferenceService.saveOrUpdate(userId, preference);
    }

    private Long getUserIdFromPrincipal(UserDetails userDetails) {
        return userService.getUserByEmail(userDetails.getUsername())
                .map(User::getUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

}
