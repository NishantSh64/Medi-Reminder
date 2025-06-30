package com.nishant.medicine_reminder.controller;

import com.nishant.medicine_reminder.model.Medicine;
import com.nishant.medicine_reminder.repository.MedicineRepository;
import com.nishant.medicine_reminder.service.MedicineService;
import com.nishant.medicine_reminder.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController

@CrossOrigin(origins = "http://192.168.60.181:8080")
@RequestMapping("/medicines")
public class MedicineController {

    @Autowired
    private MedicineService medicineService;
    @Autowired
    private UserService userService;
    @Autowired
    private MedicineRepository medicineRepository;

    @GetMapping("/test")
    public String test() {
        return "Medicine Reminder API is working!";
    }

    @PostMapping
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
        return medicine != null ? ResponseEntity.ok(medicine) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Medicine> updateMedicine(@PathVariable Long id, @RequestBody Medicine updatedMedicine) {
        Medicine updated = medicineService.updateMedicine(id, updatedMedicine);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMedicine(@PathVariable Long id) {
        return medicineService.deleteMedicine(id)
                ? ResponseEntity.ok("Medicine deleted successfully!")
                : ResponseEntity.notFound().build();
    }
    @GetMapping("/my-medicines")
    public List<Medicine> getMedicinesForCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userService.getUserByEmail(userDetails.getUsername())
                .map(user -> user.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return medicineRepository.findByUserId(userId);
    }
}
