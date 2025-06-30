package com.nishant.medicine_reminder.repository;

import com.nishant.medicine_reminder.model.ReminderPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReminderPreferenceRepository extends JpaRepository<ReminderPreference, Long> {
    Optional<ReminderPreference> findByUserUserId(Long userId);
}
