package com.nishant.medicine_reminder.controller;

import com.nishant.medicine_reminder.dto.ReminderRequest;
import com.nishant.medicine_reminder.dto.ReminderResponseDTO;
import com.nishant.medicine_reminder.model.Medicine;
import com.nishant.medicine_reminder.model.Reminder;
import com.nishant.medicine_reminder.repository.MedicineRepository;
import com.nishant.medicine_reminder.repository.ReminderRepository;
import com.nishant.medicine_reminder.repository.UserRepository;
import com.nishant.medicine_reminder.security.JwtUtil;
import com.nishant.medicine_reminder.service.MedicineService;
import com.nishant.medicine_reminder.service.ReminderService;
import com.nishant.medicine_reminder.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.*;

@RestController
@RequestMapping("/reminders")
@CrossOrigin(origins = "http://192.168.60.181:8080", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class ReminderController {

    @Autowired
    private ReminderService reminderService;
    @Autowired
    private UserService userService;

    @Autowired
    private ReminderRepository reminderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MedicineRepository medicineRepository;
    @Autowired
    private MedicineService medicineService;
    @Autowired
    private JwtUtil jwtUtil;

    private LocalDate startDate;

    @GetMapping
    public ResponseEntity<List<Reminder>> getAllReminders(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            System.out.println("🔄 Fetching all reminders for authenticated user");

            Long userId = userService.getUserByEmail(userDetails.getUsername())
                    .map(user -> user.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // ✅ Return only user's reminders instead of all reminders
            List<Reminder> reminders = reminderService.getRemindersByUserId(userId);

            System.out.println("✅ Returning " + reminders.size() + " reminders");
            return ResponseEntity.ok(reminders);
        } catch (Exception e) {
            System.err.println("❌ Error fetching reminders: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReminderById(@PathVariable Long id) {
        try {
            Reminder reminder = reminderService.getReminderById(id);
            if (reminder == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Reminder not found with ID: " + id);
            }
            return ResponseEntity.ok(reminder);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching reminder: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReminder(@PathVariable Long id, @RequestBody Reminder updatedReminder) {
        try {
            Reminder reminder = reminderService.updateReminder(id, updatedReminder);
            return ResponseEntity.ok(reminder);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid Input: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating reminder: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReminder(@PathVariable Long id) {
        try {
            boolean isDeleted = reminderService.deleteReminder(id);
            if (!isDeleted) {
                return ResponseEntity.status(404).body("Reminder not found");
            }
            return ResponseEntity.ok("Reminder deleted successfully!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error deleting reminder: " + e.getMessage());
        }
    }

    @GetMapping("/due-today")
    public List<ReminderResponseDTO> getTodayRemindersForFrontend(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userService.getUserByEmail(userDetails.getUsername())
                .map(user -> user.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Reminder> reminders = reminderService.getTodayReminders(userId);

        return reminders.stream()
                .map(ReminderResponseDTO::new)
                .toList();
    }


    @GetMapping("/today")
    public List<Reminder> getTodayReminders(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userService.getUserByEmail(userDetails.getUsername())
                .map(user -> user.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return reminderService.getTodayReminders(userId);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            Reminder updatedReminder = reminderService.updateStatus(id, status);
            return ResponseEntity.ok(updatedReminder);
        } catch (Exception e) {
            System.err.println("Error updating reminder status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update reminder status: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/snooze")
    public ResponseEntity<?> snoozeReminder(@PathVariable Long id) {
        try {
            Reminder snoozedReminder = reminderService.snoozeReminder(id);
            return ResponseEntity.ok(snoozedReminder);
        } catch (Exception e) {
            System.err.println("Error snoozing reminder: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to snooze reminder: " + e.getMessage());
        }
    }

    @GetMapping("/calendar")
    public List<LocalDate> getReminderDates(@AuthenticationPrincipal UserDetails userDetails,
                                            @RequestParam int month, @RequestParam int year) {
        Long userId = userService.getUserByEmail(userDetails.getUsername())
                .map(user -> user.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return reminderService.getReminderDatesForMonth(userId, month, year);
    }

    @GetMapping("/adherence-summary")
    public Map<String, Object> getWeeklyAdherence(@AuthenticationPrincipal UserDetails userDetails,
                                                  @RequestParam String weekStart) {
        Long userId = userService.getUserByEmail(userDetails.getUsername())
                .map(user -> user.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return reminderService.getWeeklyAdherenceSummary(userId, LocalDate.parse(weekStart));
    }

    @GetMapping("/report")
    public List<Reminder> getFullReport(@AuthenticationPrincipal UserDetails userDetails,
                                        @RequestParam String from, @RequestParam String to) {
        Long userId = userService.getUserByEmail(userDetails.getUsername())
                .map(user -> user.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return reminderService.getFullReport(userId, LocalDate.parse(from), LocalDate.parse(to));
    }

    @PostMapping("/createMedicineWithReminder")
    public ResponseEntity<?> createMedicineWithReminder(@RequestBody MedicineReminderRequest request, HttpServletRequest httpRequest) {
        String authHeader = httpRequest.getHeader("Authorization");
        String token = authHeader.substring(7);
        Long tokenUserId = jwtUtil.extractUserId(token);

        // Compare with request user ID
        Long requestUserId = request.getMedicine().getUser().getUserId();

        System.out.println("🔍 Token user ID: " + tokenUserId);
        System.out.println("🔍 Request user ID: " + requestUserId);

        if (!tokenUserId.equals(requestUserId)) {
            System.err.println("❌ User ID mismatch - possible security issue");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", "Access Denied",
                    "message", "You can only create reminders for your own account"
            ));
        }
        try {
            System.out.println("=== CREATE MEDICINE WITH REMINDER REQUEST ===");
            System.out.println("Full request: " + request);
            System.out.println("Medicine name: " + (request.getMedicine() != null ? request.getMedicine().getName() : "null"));
            System.out.println("User ID: " + (request.getMedicine() != null && request.getMedicine().getUser() != null ?
                    request.getMedicine().getUser().getUserId() : "null"));

            // Validate request
            ValidationResult validation = validateMedicineReminderRequest(request);
            if (!validation.isValid()) {
                System.err.println("Validation failed: " + validation.getErrorMessage());
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Validation Error",
                        "message", validation.getErrorMessage()
                ));
            }

            // Find user
            Long userId = request.getMedicine().getUser().getUserId();
            System.out.println("Looking for user with ID: " + userId);

            var user = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        System.err.println("User not found with ID: " + userId);
                        return new IllegalArgumentException("User not found with ID: " + userId);
                    });

            System.out.println("User found: " + user.getEmail());

            // Create Medicine
            Medicine medicine = new Medicine();
            medicine.setName(request.getMedicine().getName().trim());
            medicine.setFrequency(request.getMedicine().getFrequency());

            // Parse start date
            try {
                LocalDate startDate = LocalDate.parse(request.getMedicine().getStartDate());
                medicine.setStartDate(Date.from(startDate.atStartOfDay(ZoneId.systemDefault()).toInstant()));
                System.out.println("Start date parsed: " + startDate);
            } catch (Exception e) {
                System.err.println("Error parsing start date: " + request.getMedicine().getStartDate());
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Invalid Date Format",
                        "message", "Invalid start date format. Expected YYYY-MM-DD format."
                ));
            }

            medicine.setUser(user);

            System.out.println("Saving medicine: " + medicine.getName());
            Medicine savedMedicine = medicineService.saveMedicine(medicine);
            System.out.println("Medicine saved with ID: " + savedMedicine.getMedicineId());

            // Create Reminder
            Reminder reminder = new Reminder();
            reminder.setUser(user);
            reminder.setMedicine(savedMedicine);
            reminder.setDosage(request.getMedicine().getDosage());

            // Parse reminder time
            try {
                LocalTime reminderTime = LocalTime.parse(request.getReminder().getReminderTime());
                reminder.setReminderTime(reminderTime);
                System.out.println("Reminder time parsed: " + reminderTime);
            } catch (DateTimeParseException e) {
                System.err.println("Error parsing reminder time: " + request.getReminder().getReminderTime());
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Invalid Time Format",
                        "message", "Invalid reminder time format. Expected HH:mm format (e.g., '14:30')"
                ));
            }

            // Parse reminder date
            try {
                LocalDate reminderDate = LocalDate.parse(request.getReminder().getReminderDate());
                reminder.setReminderDate(reminderDate);
                System.out.println("Reminder date parsed: " + reminderDate);
            } catch (Exception e) {
                System.err.println("Error parsing reminder date: " + request.getReminder().getReminderDate());
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Invalid Date Format",
                        "message", "Invalid reminder date format. Expected YYYY-MM-DD format."
                ));
            }

            // Set reminder status
            try {
                Reminder.ReminderStatus status = Reminder.ReminderStatus.valueOf(
                        request.getReminder().getStatus().toUpperCase()
                );
                reminder.setStatus(status);
                System.out.println("Reminder status set: " + status);
            } catch (IllegalArgumentException e) {
                System.err.println("Invalid status: " + request.getReminder().getStatus());
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Invalid Status",
                        "message", "Invalid reminder status: " + request.getReminder().getStatus() +
                                ". Valid values are: " + Arrays.toString(Reminder.ReminderStatus.values())
                ));
            }

            reminder.setNotified(request.getReminder().isNotified());

            System.out.println("Saving reminder...");
            Reminder savedReminder = reminderService.saveReminder(reminder);
            System.out.println("Reminder saved with ID: " + savedReminder.getReminderId());

            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("medicine", savedMedicine);
            response.put("reminder", savedReminder);
            response.put("message", "Medicine and reminder created successfully");

            System.out.println("=== SUCCESS ===");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            System.err.println("IllegalArgumentException: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid Input",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            System.err.println("Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Server Error",
                    "message", "An unexpected error occurred: " + e.getMessage()
            ));
        }
    }
    @GetMapping("/user")
    public ResponseEntity<List<Reminder>> getRemindersByUser(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            System.out.println("🔄 Fetching reminders for user: " + userDetails.getUsername());

            Long userId = userService.getUserByEmail(userDetails.getUsername())
                    .map(user -> user.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            System.out.println("🔍 User ID: " + userId);

            // ✅ You'll need to add this method to your ReminderService
            List<Reminder> reminders = reminderService.getRemindersByUserId(userId);

            System.out.println("✅ Found " + reminders.size() + " reminders for user");
            return ResponseEntity.ok(reminders);
        } catch (Exception e) {
            System.err.println("❌ Error fetching user reminders: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createReminder(@RequestBody ReminderRequest request) {
        try {
            ValidationResult validation = validateReminderRequest(request);
            if (!validation.isValid()) {
                return ResponseEntity.badRequest().body(validation.getErrorMessage());
            }

            String dosage = request.getMedicine().getDosage();
            System.out.println("Dosage received from frontend: " + dosage);

            var user = userRepository.findById(request.getUser().getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + request.getUser().getUserId()));

            var medicine = medicineRepository.findById(request.getMedicine().getMedicineId())
                    .orElseThrow(() -> new IllegalArgumentException("Medicine not found with ID: " + request.getMedicine().getMedicineId()));

            Reminder reminder = new Reminder();
            reminder.setUser(user);
            reminder.setMedicine(medicine);

            try {
                reminder.setReminderTime(LocalTime.parse(request.getReminderTime()));
            } catch (DateTimeParseException e) {
                return ResponseEntity.badRequest().body("Invalid reminder time format. Expected HH:mm format (e.g., '14:30')");
            }

            reminder.setReminderDate(request.getReminderDate());

            try {
                reminder.setStatus(Reminder.ReminderStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Invalid reminder status: " + request.getStatus() +
                        ". Valid values are: " + Arrays.toString(Reminder.ReminderStatus.values()));
            }

            reminder.setNotified(request.isNotified());
            reminder.setDosage(dosage);

            Reminder savedReminder = reminderService.saveReminder(reminder);

            return ResponseEntity.status(HttpStatus.CREATED).body(savedReminder);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.err.println("Error creating reminder: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create reminder. Please try again later.");
        }
    }

    @PostMapping("/addMedicine")
    public ResponseEntity<String> addMedicine(@RequestBody Medicine medicine) {
        if (medicine.getStartDate() == null || medicine.getName() == null ||
                medicine.getFrequency() == 0 || medicine.getUser() == null) {
            return ResponseEntity.badRequest().body("Missing required fields!");
        }
        medicineService.saveMedicine(medicine);
        return ResponseEntity.ok("Medicine added successfully!");
    }

    private ValidationResult validateMedicineReminderRequest(MedicineReminderRequest request) {
        if (request == null) {
            return ValidationResult.invalid("Request cannot be null");
        }

        if (request.getMedicine() == null) {
            return ValidationResult.invalid("Medicine information is required");
        }

        if (request.getMedicine().getName() == null || request.getMedicine().getName().trim().isEmpty()) {
            return ValidationResult.invalid("Medicine name is required");
        }

        if (request.getMedicine().getDosage() == null || request.getMedicine().getDosage().trim().isEmpty()) {
            return ValidationResult.invalid("Medicine dosage is required");
        }

        if (request.getMedicine().getFrequency() <= 0) {
            return ValidationResult.invalid("Medicine frequency must be greater than 0");
        }

        if (request.getMedicine().getStartDate() == null || request.getMedicine().getStartDate().trim().isEmpty()) {
            return ValidationResult.invalid("Medicine start date is required");
        }

        if (request.getMedicine().getUser() == null || request.getMedicine().getUser().getUserId() == null) {
            return ValidationResult.invalid("User ID is required");
        }

        if (request.getReminder() == null) {
            return ValidationResult.invalid("Reminder information is required");
        }

        if (request.getReminder().getReminderTime() == null || request.getReminder().getReminderTime().trim().isEmpty()) {
            return ValidationResult.invalid("Reminder time is required");
        }

        if (request.getReminder().getReminderDate() == null || request.getReminder().getReminderDate().trim().isEmpty()) {
            return ValidationResult.invalid("Reminder date is required");
        }

        if (request.getReminder().getStatus() == null || request.getReminder().getStatus().trim().isEmpty()) {
            return ValidationResult.invalid("Reminder status is required");
        }

        return ValidationResult.valid();
    }

    private ValidationResult validateReminderRequest(ReminderRequest request) {
        if (request == null) {
            return ValidationResult.invalid("Request cannot be null");
        }

        if (request.getMedicine() == null || request.getMedicine().getMedicineId() == null) {
            return ValidationResult.invalid("Medicine ID is required");
        }

        if (request.getUser() == null || request.getUser().getUserId() == null) {
            return ValidationResult.invalid("User ID is required");
        }

        if (request.getReminderDate() == null) {
            return ValidationResult.invalid("Reminder date is required");
        }

        if (request.getStatus() == null || request.getStatus().trim().isEmpty()) {
            return ValidationResult.invalid("Reminder status is required");
        }

        if (request.getReminderTime() == null || request.getReminderTime().trim().isEmpty()) {
            return ValidationResult.invalid("Reminder time is required");
        }

        return ValidationResult.valid();
    }

    // Helper class for validation results
    private static class ValidationResult {
        private final boolean valid;
        private final String errorMessage;

        private ValidationResult(boolean valid, String errorMessage) {
            this.valid = valid;
            this.errorMessage = errorMessage;
        }

        public static ValidationResult valid() {
            return new ValidationResult(true, null);
        }

        public static ValidationResult invalid(String message) {
            return new ValidationResult(false, message);
        }

        public boolean isValid() {
            return valid;
        }

        public String getErrorMessage() {
            return errorMessage;
        }
    }

    // Request DTOs
    public static class MedicineReminderRequest {
        private MedicineRequest medicine;
        private ReminderInfo reminder;

        public MedicineRequest getMedicine() { return medicine; }
        public void setMedicine(MedicineRequest medicine) { this.medicine = medicine; }
        public ReminderInfo getReminder() { return reminder; }
        public void setReminder(ReminderInfo reminder) { this.reminder = reminder; }
    }

    public static class MedicineRequest {
        private String name;
        private String dosage;
        private int frequency;
        private String startDate;
        private UserInfo user;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDosage() { return dosage; }
        public void setDosage(String dosage) { this.dosage = dosage; }
        public int getFrequency() { return frequency; }
        public void setFrequency(int frequency) { this.frequency = frequency; }
        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }
        public UserInfo getUser() { return user; }
        public void setUser(UserInfo user) { this.user = user; }
    }

    public static class ReminderInfo {
        private String reminderTime;
        private String reminderDate;
        private String status;
        private boolean notified;

        public String getReminderTime() { return reminderTime; }
        public void setReminderTime(String reminderTime) { this.reminderTime = reminderTime; }
        public String getReminderDate() { return reminderDate; }
        public void setReminderDate(String reminderDate) { this.reminderDate = reminderDate; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public boolean isNotified() { return notified; }
        public void setNotified(boolean notified) { this.notified = notified; }
    }

    public static class UserInfo {
        private Long userId;

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
    }
}