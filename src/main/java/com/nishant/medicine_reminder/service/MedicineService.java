package com.nishant.medicine_reminder.service;

import com.nishant.medicine_reminder.model.Medicine;
import com.nishant.medicine_reminder.repository.MedicineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MedicineService {

    @Autowired
    private MedicineRepository medicineRepository;

    public Medicine saveMedicine(Medicine medicine) {
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
            return true; // Successfully deleted
        }
        return false; // Medicine not found
    }

    public Medicine updateMedicine(Long id, Medicine updatedMedicine) {
        Optional<Medicine> existingMedicine = medicineRepository.findById(id);

        if (((Optional<?>) existingMedicine).isPresent()) {
            Medicine medicine = existingMedicine.get();
            medicine.setName(updatedMedicine.getName());
            medicine.setDescription(updatedMedicine.getDescription());
            medicine.setStartDate(updatedMedicine.getStartDate());
            medicine.setEndDate(updatedMedicine.getEndDate());
            medicine.setFrequency(updatedMedicine.getFrequency());
            medicine.setUser(updatedMedicine.getUser());

            return medicineRepository.save(medicine);
        }
        return null;
    }

}
