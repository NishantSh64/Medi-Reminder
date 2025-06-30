package com.nishant.medicine_reminder.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String message;
    public AuthResponse(String token) { this.token = token; }
    public String getToken() { return token; }
}
