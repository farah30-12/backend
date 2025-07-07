package com.backend.qu2data.controller;

import com.backend.qu2data.entites.Users;
import com.backend.qu2data.controller.UserDto;
import com.backend.qu2data.service.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/users")
public class TestController {

    @Autowired
    private UsersService usersService;

    // ✅ Ajouter un utilisateur dans PostgreSQL et Keycloak
    @PostMapping("/create")
    public ResponseEntity<?> createUser(@RequestBody UserDto userDto) {
        try {
            Users createdUser = usersService.createUser(userDto);
            return ResponseEntity.ok(Map.of(
                "message", "User created successfully",
                "id", createdUser.getId(),
                "id_keycloak", createdUser.getIdKeycloak()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "message", "Error creating user",
                "error", e.getMessage()
            ));
        }
    }
}
