package com.backend.qu2data.controller;

import com.backend.qu2data.entites.Users;
import com.backend.qu2data.repository.UsersRepository;
import com.backend.qu2data.service.KeycloakService;
import com.backend.qu2data.service.UsersService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/test/keycloak")
public class TestCont {

    @Autowired
    private UsersService usersService;

    @Autowired
    private KeycloakService keycloakService;

    @Autowired
    private UsersRepository usersRepository;

    private static final Logger logger = LoggerFactory.getLogger(TestCont.class);

    // ✅ Créer un utilisateur
    @PostMapping("/create")
    public ResponseEntity<?> createUser(@RequestBody UserDto userDto) {
        try {
            if (userDto.getUserName() == null || userDto.getEmail() == null || userDto.getPassword() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Erreur : username, email et password sont obligatoires."));
            }

            String keycloakUserId = keycloakService.createUserInKeycloak(userDto);
            if (keycloakUserId == null) {
                return ResponseEntity.status(500).body(Map.of("message", "Erreur: Impossible de créer l'utilisateur dans Keycloak."));
            }

            if (userDto.getRole() != null && !userDto.getRole().isEmpty()) {
                boolean roleAssigned = keycloakService.assignRoleToUser(keycloakUserId, userDto.getRole());
                if (!roleAssigned) {
                    return ResponseEntity.status(500).body(Map.of("message", "Erreur: Impossible d'assigner le rôle."));
                }
            }

            userDto.setId_keycloak(keycloakUserId);
            Users user = usersService.createUser(userDto);

            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "message", "Erreur lors de la création de l'utilisateur",
                "error", e.getMessage()
            ));
        }
    }

    // ✅ Récupérer tous les utilisateurs
    @GetMapping("/all-users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        try {
            List<UserRepresentation> keycloakUsers = keycloakService.getUsersFromKeycloak();
            List<Map<String, Object>> combinedUsers = new ArrayList<>();

            for (UserRepresentation keycloakUser : keycloakUsers) {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", keycloakUser.getId());
                userMap.put("username", keycloakUser.getUsername());
                userMap.put("email", keycloakUser.getEmail());
                userMap.put("firstName", keycloakUser.getFirstName());
                userMap.put("lastName", keycloakUser.getLastName());

                Optional<Users> postgresUser = usersRepository.findByIdKeycloak(keycloakUser.getId());
                if (postgresUser.isPresent()) {
                    userMap.put("jobTitle", postgresUser.get().getJobTitle());
                    userMap.put("phoneNumber", postgresUser.get().getPhoneNumber());
                    userMap.put("postgresId", postgresUser.get().getId()); // ✅ AJOUTÉ
                } else {
                    userMap.put("jobTitle", "N/A");
                    userMap.put("phoneNumber", "N/A");
                    userMap.put("postgresId", null); // ✅ Pour éviter undefined côté front
                }

                Set<String> roles = keycloakService.getUserRoles(keycloakUser.getId());
                userMap.put("roles", String.join(", ", roles));

                combinedUsers.add(userMap);
            }

            return ResponseEntity.ok(combinedUsers);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Collections.emptyList());
        }
    }


    // ✅ (MODIFIÉ) Récupérer un utilisateur PostgreSQL via id_keycloak
    @GetMapping("/user/by-keycloak/{idKeycloak}")
    public ResponseEntity<?> getUserByKeycloakId(@PathVariable String idKeycloak) {
        Users user = usersRepository.findByIdKeycloak(idKeycloak).orElse(null);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(404).body(Map.of("message", "Utilisateur introuvable"));
        }
    }

    // ✅ (MODIFIÉ) Récupérer un utilisateur depuis Keycloak uniquement
    @GetMapping("/user/keycloak/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable String userId) {
        try {
            UserRepresentation user = keycloakService.getUserByIdFromKeycloak(userId);
            if (user != null) {
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.status(404).body(Map.of("message", "Utilisateur introuvable"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "message", "Erreur lors de la récupération de l'utilisateur",
                "error", e.getMessage()
            ));
        }
    }

    // ✅ Mettre à jour un utilisateur
    @PutMapping("/update/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable String userId, @RequestBody UserDto userDto) {
        try {
            logger.info("📝 Requête de mise à jour de l'utilisateur avec ID: {}", userId);

            boolean updatedInKeycloak = keycloakService.updateUserInKeycloak(userId, userDto);
            if (!updatedInKeycloak) {
                return ResponseEntity.status(500).body(Map.of("message", "Erreur lors de la mise à jour dans Keycloak"));
            }

            Users updatedUser = usersService.updateUser(userId, userDto);

            return ResponseEntity.ok(Map.of("message", "Utilisateur mis à jour avec succès"));
        } catch (Exception e) {
            logger.error("❌ Erreur lors de la mise à jour de l'utilisateur: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                "message", "Erreur lors de la mise à jour de l'utilisateur",
                "error", e.getMessage()
            ));
        }
    }

    // ✅ Supprimer un utilisateur
    @DeleteMapping("/delete/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable String userId) {
        try {
            String result = usersService.deleteUser(userId);
            return ResponseEntity.ok(Map.of("message", result));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "message", "Erreur lors de la suppression de l'utilisateur",
                "error", e.getMessage()
            ));
        }
    }
}
