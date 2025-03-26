package com.nishant.medicine_reminder.controller;

import com.nishant.medicine_reminder.model.Medicine;
import com.nishant.medicine_reminder.service.MedicineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/test")
    public String test() {
        return "API is working!";
    }
}
