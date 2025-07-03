package com.backend.qu2data.service;

import com.backend.qu2data.model.User;
import com.backend.qu2data.controller.UserDto;
import com.backend.qu2data.entites.Users;
import com.backend.qu2data.repository.UsersRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.keycloak.representations.idm.UserRepresentation;

import java.util.*;

@Service
public class UsersService {

    private static final Logger logger = LoggerFactory.getLogger(UsersService.class);

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private KeycloakService keycloakService;

    private final String keycloakUrl = "http://localhost:8080/admin/realms/qu2data-realm";

    // ✅ Créer un utilisateur dans PostgreSQL et Keycloak
    public Users createUser(UserDto userDto) {
        try {
            Users newUser = new Users();
            newUser.setJobTitle(userDto.getJobTitle());
            newUser.setPhoneNumber(userDto.getPhoneNumber());
            newUser.setIdKeycloak(userDto.getId_keycloak());

            // ✅ Enregistrer l'utilisateur dans PostgreSQL
            Users savedUser = usersRepository.save(newUser);
            logger.info("✅ Utilisateur enregistré dans PostgreSQL avec succès: {}", savedUser.getId());
            return savedUser;
        } catch (Exception e) {
            logger.error("❌ Erreur lors de l'enregistrement de l'utilisateur dans PostgreSQL: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la création de l'utilisateur");
        }
    }
 // ✅ Récupérer tous les utilisateurs PostgreSQL (seulement ceux enregistrés avec id_keycloak)
    public List<Users> getAllUsersPostgresOnly() {
        return usersRepository.findAll().stream()
                .filter(u -> u.getIdKeycloak() != null)
                .toList();
    }

    // ✅ Récupérer un utilisateur par ID Keycloak
    public Users getUserByKeycloakId(String idKeycloak) {
        return usersRepository.findByIdKeycloak(idKeycloak).orElse(null);
    }

    public Optional<UserDto> getUserByPostgresId(Long id) {
        Optional<Users> userOpt = usersRepository.findById(id);

        if (userOpt.isPresent()) {
            Users user = userOpt.get();

            // On récupère aussi depuis Keycloak les infos nom/prénom
            UserDto dto = new UserDto();
            dto.setJobTitle(user.getJobTitle());
            dto.setPhoneNumber(user.getPhoneNumber());
            dto.setId_keycloak(user.getIdKeycloak());

            if (user.getIdKeycloak() != null) {
                try {
                    UserRepresentation keycloakUser = keycloakService.getUserByIdFromKeycloak(user.getIdKeycloak());
                    dto.setUserName(keycloakUser.getUsername());
                    dto.setEmail(keycloakUser.getEmail());
                    dto.setFirstName(keycloakUser.getFirstName());
                    dto.setLastName(keycloakUser.getLastName());
                } catch (Exception e) {
                    // log error mais on ne bloque pas
                }
            }

            return Optional.of(dto);
        }

        return Optional.empty();
    }

    

    // ✅ Récupérer tous les utilisateurs depuis PostgreSQL et Keycloak
    public List<Map<String, Object>> getAllUsers() {
        List<Map<String, Object>> combinedUsers = new ArrayList<>();

        // 🔹 Récupérer les utilisateurs depuis PostgreSQL
        try {
            List<Users> postgresUsers = usersRepository.findAll();
            for (Users user : postgresUsers) {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("id_keycloak", user.getIdKeycloak());
                userMap.put("jobTitle", user.getJobTitle());
                userMap.put("phoneNumber", user.getPhoneNumber());
                userMap.put("source", "PostgreSQL");
                combinedUsers.add(userMap);
            }
            logger.info("✅ Récupération des utilisateurs depuis PostgreSQL réussie: {}", postgresUsers.size());
        } catch (Exception e) {
            logger.error("❌ Erreur lors de la récupération des utilisateurs depuis PostgreSQL: {}", e.getMessage());
        }

        // 🔹 Récupérer les utilisateurs depuis Keycloak
        try {
            List<UserRepresentation> keycloakUsers = keycloakService.getUsersFromKeycloak();
            for (UserRepresentation user : keycloakUsers) {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("username", user.getUsername());
                userMap.put("email", user.getEmail());
                userMap.put("firstName", user.getFirstName());
                userMap.put("lastName", user.getLastName());
                userMap.put("source", "Keycloak");
                combinedUsers.add(userMap);
            }
            logger.info("✅ Récupération des utilisateurs depuis Keycloak réussie: {}", keycloakUsers.size());
        } catch (Exception e) {
            logger.error("❌ Erreur lors de la récupération des utilisateurs depuis Keycloak: {}", e.getMessage());
        }

        return combinedUsers;
    }

 
 // ✅ Mettre à jour un utilisateur dans PostgreSQL
    public Users updateUser(String userId, UserDto userDto) {
        try {
            // ✅ Vérifier si l'utilisateur existe dans PostgreSQL avec l'ID Keycloak
            Optional<Users> existingUserOptional = usersRepository.findByIdKeycloak(userId);
            if (existingUserOptional.isEmpty()) {
                throw new RuntimeException("Utilisateur introuvable dans PostgreSQL avec ID Keycloak: " + userId);
            }

            Users existingUser = existingUserOptional.get();
            existingUser.setJobTitle(userDto.getJobTitle());
            existingUser.setPhoneNumber(userDto.getPhoneNumber());

            // ✅ Ne pas remplacer l'ID Keycloak s'il est déjà défini
            if (userDto.getId_keycloak() != null) {
                existingUser.setIdKeycloak(userDto.getId_keycloak());
            }

            // ✅ Enregistrer les modifications dans PostgreSQL
            Users updatedUser = usersRepository.save(existingUser);
            logger.info("✅ Utilisateur mis à jour dans PostgreSQL avec succès: {}", updatedUser.getId());
            return updatedUser;
        } catch (Exception e) {
            logger.error("❌ Erreur lors de la mise à jour de l'utilisateur dans PostgreSQL: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la mise à jour de l'utilisateur");
        }
    }







    public Users findByKeycloakId(String idKeycloak) {
        try {
            // Utiliser l'instance de usersRepository pour appeler findAll()
            List<Users> usersList = usersRepository.findAll();
            
            // Rechercher l'utilisateur avec l'ID Keycloak
            return usersList.stream()
                    .filter(user -> idKeycloak.equals(user.getIdKeycloak()))
                    .findFirst()
                    .orElse(null);
        } catch (Exception e) {
            logger.error("❌ Erreur lors de la recherche de l'utilisateur par ID Keycloak: {}", e.getMessage());
            return null;
        }
    }




    // ✅ Supprimer l'utilisateur dans PostgreSQL et Keycloak
 // ✅ Supprimer l'utilisateur dans PostgreSQL et Keycloak
    public String deleteUser(String userId) {
        try {
            // 🔹 Rechercher l'utilisateur dans PostgreSQL en utilisant l'ID Keycloak
            Optional<Users> existingUserOptional = usersRepository.findByIdKeycloak(userId);
            if (existingUserOptional.isEmpty()) {
                throw new RuntimeException("Utilisateur introuvable dans PostgreSQL");
            }

            Users existingUser = existingUserOptional.get();

            // ✅ Supprimer l'utilisateur de PostgreSQL
            usersRepository.delete(existingUser);
            logger.info("✅ Utilisateur supprimé de PostgreSQL avec succès: {}", userId);

            // ✅ Supprimer l'utilisateur de Keycloak
            String result = keycloakService.deleteUserInKeycloak(existingUser.getIdKeycloak());
            if (result.startsWith("Erreur")) {
                throw new RuntimeException("Erreur lors de la suppression de l'utilisateur dans Keycloak");
            }

            return "Utilisateur supprimé avec succès";
        } catch (Exception e) {
            logger.error("❌ Erreur lors de la suppression de l'utilisateur dans PostgreSQL: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la suppression de l'utilisateur");
        }
    }


    // ✅ Obtenir un Token JWT valide pour Keycloak
    private String getAccessToken() {
        String tokenUrl = "http://localhost:8080/realms/qu2data-realm/protocol/openid-connect/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        String body = "client_id=qu2data-client"
                + "&client_secret=q8eCXqHnzBMuon4lkRjAAfbRhsGsXPdP"
                + "&grant_type=client_credentials";

        HttpEntity<String> entity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.exchange(tokenUrl, HttpMethod.POST, entity, Map.class);

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            return response.getBody().get("access_token").toString();
        } else {
            throw new RuntimeException("Erreur : Impossible d'obtenir le token JWT de Keycloak.");
        }
    }
}
