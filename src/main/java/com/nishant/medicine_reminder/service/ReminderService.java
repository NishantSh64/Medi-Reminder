package com.nishant.medicine_reminder.service;

import com.nishant.medicine_reminder.model.Reminder;
import com.nishant.medicine_reminder.model.Medicine;
import com.nishant.medicine_reminder.model.User;
import com.nishant.medicine_reminder.repository.ReminderRepository;
import com.nishant.medicine_reminder.repository.UserRepository;
import com.nishant.medicine_reminder.repository.MedicineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReminderService {

    @Autowired
    private ReminderRepository reminderRepository;
    @Autowired
    private MedicineRepository medicineRepository;
    @Autowired
    private UserRepository userRepository;  // Add UserRepository for fetching user
    public Reminder saveReminder(Reminder reminder) {
        if (reminder.getMedicine() == null || reminder.getMedicine().getMedicineId() == null) {
            throw new IllegalArgumentException("Medicine ID cannot be null");
        }

        // Fetch Medicine and User properly before setting
        Medicine medicine = medicineRepository.findById(reminder.getMedicine().getMedicineId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid Medicine ID"));

        User user = userRepository.findById(reminder.getUser().getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid User ID"));

        reminder.setMedicine(medicine);
        reminder.setUser(user);  // Set the User correctly

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
    public Reminder updateReminder(Long id, Reminder updatedReminder) {
        if (reminderRepository.existsById(id)) {
            updatedReminder.setId(id);
            return reminderRepository.save(updatedReminder);
        }
        return null;
    }
}
