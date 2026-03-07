package edu.cit.mando.vetclinic.controller;

import edu.cit.mando.vetclinic.dto.LoginRequest;
import edu.cit.mando.vetclinic.dto.RegisterRequest;
import edu.cit.mando.vetclinic.entity.User;
import edu.cit.mando.vetclinic.service.AuthService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthService authService;

    // REGISTER USER
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = authService.register(request);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body("Registration failed: " + e.getMessage());
        }
    }

    // LOGIN USER
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = authService.login(request);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body("Login failed: " + e.getMessage());
        }
    }
}