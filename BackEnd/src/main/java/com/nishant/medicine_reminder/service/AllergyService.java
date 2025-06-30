package com.nishant.medicine_reminder.service;

import com.nishant.medicine_reminder.model.Allergy;
import com.nishant.medicine_reminder.model.User;
import com.nishant.medicine_reminder.repository.AllergyRepository;
import com.nishant.medicine_reminder.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AllergyService {

    @Autowired
    private AllergyRepository allergyRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Allergy> getAllergiesByUserId(Long userId) {
        return allergyRepository.findByUserUserId(userId);
    }

    public Allergy addOrUpdateAllergy(Long userId, Allergy allergy) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        allergy.setUser(user);
        return allergyRepository.save(allergy);
    }

    public void deleteAllergy(Long allergyId) {
        allergyRepository.deleteById(allergyId);
    }
}
