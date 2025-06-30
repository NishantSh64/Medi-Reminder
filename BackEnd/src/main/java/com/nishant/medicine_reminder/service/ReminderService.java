package com.nishant.medicine_reminder.service;

import com.nishant.medicine_reminder.model.Medicine;
import com.nishant.medicine_reminder.model.Reminder;
import com.nishant.medicine_reminder.model.User;
import com.nishant.medicine_reminder.repository.MedicineRepository;
import com.nishant.medicine_reminder.repository.ReminderRepository;
import com.nishant.medicine_reminder.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReminderService {

    @Autowired
    private ReminderRepository reminderRepository;

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private UserRepository userRepository;

    public Reminder saveReminder(Reminder reminder) {
        if (reminder.getMedicine() == null || reminder.getMedicine().getMedicineId() == null) {
            throw new IllegalArgumentException("Medicine ID cannot be null");
        }

        Medicine medicine = medicineRepository.findById(reminder.getMedicine().getMedicineId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid Medicine ID"));

        User user = userRepository.findById(reminder.getUser().getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid User ID"));

        reminder.setMedicine(medicine);
        reminder.setUser(user);
        return reminderRepository.save(reminder);
    }

    public List<Reminder> getAllReminders() {
        return reminderRepository.findAll();
    }

    public Reminder getReminderById(Long id) {
        return reminderRepository.findById(id).orElse(null);
    }

    public boolean deleteReminder(Long id) {
        if (reminderRepository.existsById(id)) {
            reminderRepository.deleteById(id);
            return true;
        }
        return false;
    }
    public List<Reminder> getRemindersByUserId(Long userId) {
        try {
            System.out.println("🔄 Service: Fetching reminders for userId: " + userId);

            if (userId == null) {
                throw new IllegalArgumentException("User ID cannot be null");
            }

            // ✅ You'll need to add this method to your ReminderRepository
            List<Reminder> reminders = reminderRepository.findByUser_UserId(userId);

            System.out.println("✅ Service: Found " + reminders.size() + " reminders");
            return reminders;
        } catch (Exception e) {
            System.err.println("❌ Service error fetching reminders: " + e.getMessage());
            throw e;
        }
    }
    public Reminder updateReminder(Long id, Reminder updatedReminder) {
        return reminderRepository.findById(id).map(existingReminder -> {
            existingReminder.setTime(updatedReminder.getTime());
            existingReminder.setStatus(updatedReminder.getStatus());
            existingReminder.setNotified(updatedReminder.getNotified());

            if (updatedReminder.getMedicine() != null && updatedReminder.getMedicine().getMedicineId() != null) {
                Medicine medicine = medicineRepository.findById(updatedReminder.getMedicine().getMedicineId())
                        .orElseThrow(() -> new IllegalArgumentException("Invalid Medicine ID"));
                existingReminder.setMedicine(medicine);
            }

            if (updatedReminder.getUser() != null && updatedReminder.getUser().getUserId() != null) {
                User user = userRepository.findById(updatedReminder.getUser().getUserId())
                        .orElseThrow(() -> new IllegalArgumentException("Invalid User ID"));
                existingReminder.setUser(user);
            }

            return reminderRepository.save(existingReminder);
        }).orElseThrow(() -> new RuntimeException("Reminder not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<Reminder> getTodayReminders(Long userId) {
        LocalDate today = LocalDate.now();
        List<Reminder> reminders = reminderRepository.findByUserUserIdAndReminderDate(userId, today);

        // Force loading of medicine data
        reminders.forEach(reminder -> {
            if (reminder.getMedicine() != null) {
                reminder.getMedicine().getName(); // This triggers lazy loading
            }
        });

        return reminders;
    }

    public Reminder updateStatus(Long id, String status) {
        Reminder reminder = reminderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reminder not found"));
        reminder.setStatus(Reminder.ReminderStatus.valueOf(status.toUpperCase()));
        return reminderRepository.save(reminder);
    }

    public Reminder snoozeReminder(Long id) {
        Reminder reminder = reminderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reminder not found"));
        reminder.setReminderTime(reminder.getTime().plusMinutes(10));
        return reminderRepository.save(reminder);
    }

    public List<LocalDate> getReminderDatesForMonth(Long userId, int month, int year) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return reminderRepository.findDistinctReminderDatesByUserUserIdAndReminderDateBetween(userId, start, end);
    }

    public Map<String, Object> getWeeklyAdherenceSummary(Long userId, LocalDate weekStart) {
        LocalDate weekEnd = weekStart.plusDays(6);
        List<Reminder> reminders = reminderRepository.findByUserUserIdAndReminderDateBetween(userId, weekStart, weekEnd);

        long total = reminders.size();
        long taken = reminders.stream()
                .filter(r -> "TAKEN".equalsIgnoreCase(r.getStatus().name()))
                .count();

        double percentage = total == 0 ? 0 : (taken * 100.0 / total);

        Map<String, Object> response = new HashMap<>();
        response.put("percentage", percentage);
        response.put("totalReminders", total);
        response.put("takenReminders", taken);

        return response;
    }

    public List<Reminder> getFullReport(Long userId, LocalDate from, LocalDate to) {
        return reminderRepository.findByUserUserIdAndReminderDateBetween(userId, from, to);
    }

}
