package com.nishant.medicine_reminder.controller;

import com.nishant.medicine_reminder.dto.AuthRequest;
import com.nishant.medicine_reminder.dto.RegisterRequest;
import com.nishant.medicine_reminder.model.User;
import com.nishant.medicine_reminder.repository.UserRepository;
import com.nishant.medicine_reminder.security.JwtUtil;
import com.nishant.medicine_reminder.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://192.168.60.181:8080")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest loginRequest) {
        try {

            boolean isAuthenticated = userService.authenticateUser(loginRequest.getEmail(), loginRequest.getPassword());

            if (isAuthenticated) {
                //Get the user after successful authentication
                Optional<User> userOptional = userService.getUserByEmail(loginRequest.getEmail());
                if (userOptional.isPresent()) {
                    User user = userOptional.get(); // Extract the User from Optional

                    // Now you can call methods on the User object
                    String token = jwtUtil.generateToken(user.getEmail(), user.getUserId());

                    Map<String, Object> response = new HashMap<>();
                    response.put("token", token);
                    response.put("userId", user.getUserId());
                    response.put("email", user.getEmail());
                    response.put("username", user.getName()); // Using getName() since you have setName() in service
                    response.put("message", "Login successful");

                    System.out.println("✅ Login successful for user: " + user.getEmail() + " (ID: " + user.getUserId() + ")");

                    return ResponseEntity.ok(response);
                } else {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(Map.of("error", "User not found after authentication"));
                }
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid credentials"));
            }
        } catch (Exception e) {
            System.err.println("❌ Login error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Login failed", "message", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        User user = new User();
        user.setName(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully");
    }
}
