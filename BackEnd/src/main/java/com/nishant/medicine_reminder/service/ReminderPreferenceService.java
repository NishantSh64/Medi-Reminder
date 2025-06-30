package com.nishant.medicine_reminder.service;

import com.nishant.medicine_reminder.model.ReminderPreference;
import com.nishant.medicine_reminder.model.User;
import com.nishant.medicine_reminder.repository.ReminderPreferenceRepository;
import com.nishant.medicine_reminder.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ReminderPreferenceService {

    @Autowired
    private ReminderPreferenceRepository reminderPreferenceRepository;

    @Autowired
    private UserRepository userRepository;

    public ReminderPreference getPreferenceByUserId(Long userId) {
        return reminderPreferenceRepository.findByUserUserId(userId).orElse(null);
    }

    public ReminderPreference saveOrUpdate(Long userId, ReminderPreference newPref) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return null;

        ReminderPreference existing = reminderPreferenceRepository.findByUserUserId(userId)
                .orElse(new ReminderPreference());

        existing.setUser(userOpt.get());
        existing.setNotificationsEnabled(newPref.isNotificationsEnabled());
        existing.setReminderSound(newPref.getReminderSound());
        existing.setDailyTipsEnabled(newPref.isDailyTipsEnabled());

        return reminderPreferenceRepository.save(existing);
    }
}
