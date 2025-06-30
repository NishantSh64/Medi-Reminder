package com.nishant.medicine_reminder.controller;

import com.nishant.medicine_reminder.model.Allergy;
import com.nishant.medicine_reminder.service.AllergyService;
import com.nishant.medicine_reminder.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/allergies")
@CrossOrigin(origins = "http://192.168.60.181:8080")
public class AllergyController {

    @Autowired
    private AllergyService allergyService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<Allergy>> getAllergies(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userService.getUserByEmail(userDetails.getUsername())
                .map(user -> user.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Allergy> allergies = allergyService.getAllergiesByUserId(userId);
        return ResponseEntity.ok(allergies);
    }

    @PostMapping
    public ResponseEntity<Allergy> addOrUpdateAllergy(@AuthenticationPrincipal UserDetails userDetails,
                                                      @RequestBody Allergy allergy) {
        Long userId = userService.getUserByEmail(userDetails.getUsername())
                .map(user -> user.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Allergy savedAllergy = allergyService.addOrUpdateAllergy(userId, allergy);
        return ResponseEntity.ok(savedAllergy);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAllergy(@PathVariable("id") Long allergyId) {
        allergyService.deleteAllergy(allergyId);
        return ResponseEntity.ok("Allergy deleted successfully.");
    }
}
