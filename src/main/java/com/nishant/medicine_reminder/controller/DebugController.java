package com.nishant.medicine_reminder.controller;

import com.nishant.medicine_reminder.model.Medicine;
import com.nishant.medicine_reminder.service.MedicineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/debug-api")
public class DebugController {

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Debug API is working!");
    }
}
