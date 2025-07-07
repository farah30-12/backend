package com.backend.resource;

import com.backend.qu2data.controller.UserDto;
import com.backend.qu2data.service.KeycloakService;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/keycloak")
public class UserResource {

    @Autowired
    private KeycloakService keycloakService;

    // ✅ Récupérer tous les utilisateurs
    @GetMapping("/users")
    public ResponseEntity<List<UserRepresentation>> getUsers() {
        try {
            List<UserRepresentation> users = keycloakService.getUsersFromKeycloak();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // ✅ Créer un utilisateur
    @PostMapping("/user")
    public ResponseEntity<?> createUser(@RequestBody UserDto userDto) {
        try {
            // Vérification des champs obligatoires
            if (userDto.getUserName() == null || userDto.getEmail() == null || userDto.getPassword() == null) {
                return ResponseEntity.badRequest().body("Erreur : username, email et password sont obligatoires.");
            }

            // Création de l'utilisateur dans Keycloak
            String result = keycloakService.createUserInKeycloak(userDto);

            // Vérifier la réponse
            if (result.startsWith("Error")) {
                return ResponseEntity.badRequest().body(result);
            }

            return ResponseEntity.status(201).body("Utilisateur créé avec succès. ID : " + result);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur lors de la création de l'utilisateur : " + e.getMessage());
        }
    }

    // ✅ Mettre à jour un utilisateur
  /*  @PutMapping("/user/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable String userId, @RequestBody UserDto userDto) {
        try {
            String result = keycloakService.updateUserInKeycloak(userId, userDto);
            if (result.startsWith("Error")) {
                return ResponseEntity.badRequest().body(result);
            }
            return ResponseEntity.ok("Utilisateur mis à jour avec succès.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur lors de la mise à jour de l'utilisateur : " + e.getMessage());
        }
    }*/

    // ✅ Supprimer un utilisateur
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable String userId) {
        try {
            String result = keycloakService.deleteUserInKeycloak(userId);
            if (result.startsWith("Error")) {
                return ResponseEntity.badRequest().body(result);
            }
            return ResponseEntity.ok("Utilisateur supprimé avec succès.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur lors de la suppression de l'utilisateur : " + e.getMessage());
        }
    }

    // ✅ Récupérer un utilisateur par son ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable String userId) {
        try {
            UserRepresentation user = keycloakService.getUserByIdFromKeycloak(userId);
            if (user != null) {
                return ResponseEntity.ok(user);
            }
            return ResponseEntity.status(404).body("Utilisateur introuvable.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur lors de la récupération de l'utilisateur : " + e.getMessage());
        }
    }
}
