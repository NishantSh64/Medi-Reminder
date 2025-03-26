package com.nishant.medicine_reminder.controller;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.nishant.medicine_reminder.model.Medicine;
import com.nishant.medicine_reminder.service.MedicineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/medicines")
public class MedicineController {

    @Autowired
    private MedicineService medicineService;

    @GetMapping("/test")
    public String test() {
        return "Medicine Reminder API is working!";
    }

    @PostMapping("/add-medicine")
    public ResponseEntity<String> addMedicine(@RequestBody Medicine medicine) {
        if (medicine.getStartDate() == null ||
                medicine.getName() == null ||
                medicine.getFrequency() == 0 ||
                medicine.getUser() == null) {
            return ResponseEntity.badRequest().body("Missing required fields!");
        }
        medicineService.saveMedicine(medicine);
        return ResponseEntity.ok("Medicine added successfully!");
    }

    @GetMapping
    public ResponseEntity<List<Medicine>> getAllMedicines() {
        return ResponseEntity.ok(medicineService.getAllMedicines());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medicine> getMedicineById(@PathVariable Long id) {
        Medicine medicine = medicineService.getMedicineById(id);
        if (medicine == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(medicine);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Medicine> updateMedicine(@PathVariable Long id, @RequestBody Medicine updatedMedicine) {
        Medicine updated = medicineService.updateMedicine(id, updatedMedicine);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMedicine(@PathVariable Long id) {
        boolean isDeleted = medicineService.deleteMedicine(id);
        if (!isDeleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok("Medicine deleted successfully!");
    }
}
