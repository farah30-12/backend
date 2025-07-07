package com.backend.qu2data.controller;

import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import com.backend.qu2data.controller.UserDto;
import com.backend.qu2data.entites.Users;
import com.backend.qu2data.service.KeycloakService;
import com.backend.qu2data.service.UsersService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final KeycloakService keycloakService;
    private final UsersService usersService;

    public UserController(KeycloakService keycloakService, UsersService usersService) {
        this.keycloakService = keycloakService;
        this.usersService = usersService;
    }

    // ✅ Liste combinée de tous les utilisateurs
    @GetMapping
    
    public ResponseEntity<List<Users>> getAllUsers() {
        List<Users> users = usersService.getAllUsersPostgresOnly();
        return ResponseEntity.ok(users);
    }

    // ✅ Récupérer l’utilisateur connecté à partir de son id_keycloak
    @GetMapping("/keycloak/{idKeycloak}")

    public ResponseEntity<?> getUserByKeycloakId(@PathVariable String idKeycloak) {
        Users user = usersService.getUserByKeycloakId(idKeycloak);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(404).body(Map.of("message", "Utilisateur introuvable"));
        }
    }
    @GetMapping("/by-postgres/{id}")
    public ResponseEntity<UserDto> getUserByPostgresId(@PathVariable Long id) {
        return usersService.getUserByPostgresId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }


    // ✅ Ajouter un utilisateur
    @PostMapping("/add")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> addUser(@RequestBody UserDto userDto) {
        try {
            logger.info("📥 Données reçues: {}", userDto);

            if (userDto.getUserName() == null || userDto.getEmail() == null || userDto.getPassword() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Erreur : username, email et password sont obligatoires."));
            }

            String userId = keycloakService.createUserInKeycloak(userDto);
            if (userId == null) {
                return ResponseEntity.status(500).body(Map.of("message", "Erreur lors de la création de l'utilisateur dans Keycloak"));
            }

            if (userDto.getRole() != null && !userDto.getRole().isEmpty()) {
                boolean roleAssigned = keycloakService.assignRoleToUser(userId, userDto.getRole());
                if (!roleAssigned) {
                    return ResponseEntity.status(500).body(Map.of("message", "Erreur: Impossible d'assigner le rôle."));
                }
            }

            userDto.setId_keycloak(userId);
            Users createdUser = usersService.createUser(userDto);

            return ResponseEntity.status(201).body(Map.of(
                "message", "✅ Utilisateur créé avec succès",
                "id_keycloak", createdUser.getIdKeycloak(),
                "jobTitle", createdUser.getJobTitle(),
                "phoneNumber", createdUser.getPhoneNumber()
            ));

        } catch (Exception e) {
            logger.error("❌ Erreur lors de la création de l'utilisateur: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Erreur", "error", e.getMessage()));
        }
    }
}
