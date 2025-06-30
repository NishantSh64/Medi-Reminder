package com.nishant.medicine_reminder.service;

import com.nishant.medicine_reminder.exception.BadRequestException;
import com.nishant.medicine_reminder.exception.ResourceNotFoundException;
import com.nishant.medicine_reminder.model.Medicine;
import com.nishant.medicine_reminder.model.User;
import com.nishant.medicine_reminder.repository.MedicineRepository;
import com.nishant.medicine_reminder.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MedicineService {

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private UserRepository userRepository;



    public Medicine saveMedicine(Medicine medicine) {
        if (medicine.getUser() == null || medicine.getUser().getUserId() == null) {
            throw new BadRequestException("User ID must not be null.");
        }

        Long userId = medicine.getUser().getUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User with ID " + userId + " not found."));

        medicine.setUser(user);
        return medicineRepository.save(medicine);
    }



    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }

    public Medicine getMedicineById(Long id) {
        return medicineRepository.findById(id).orElse(null);
    }

    public boolean deleteMedicine(Long id) {
        if (medicineRepository.existsById(id)) {
            medicineRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Medicine updateMedicine(Long id, Medicine updatedMedicine) {
        Optional<Medicine> optionalMedicine = medicineRepository.findById(id);
        if (optionalMedicine.isPresent()) {
            Medicine medicine = optionalMedicine.get();
            medicine.setName(updatedMedicine.getName());
            medicine.setDescription(updatedMedicine.getDescription());
            medicine.setStartDate(updatedMedicine.getStartDate());
            medicine.setEndDate(updatedMedicine.getEndDate());
            medicine.setFrequency(updatedMedicine.getFrequency());

            if (updatedMedicine.getUser() != null && updatedMedicine.getUser().getUserId() != null) {
                Long userId = updatedMedicine.getUser().getUserId();
                User user = userRepository.findByUserId(userId).orElse(null);
                if (user == null) {
                    throw new RuntimeException("User with ID " + userId + " not found.");
                }
                medicine.setUser(user); // attach managed user
            }

            return medicineRepository.save(medicine);
        }
        return null;
    }

}
