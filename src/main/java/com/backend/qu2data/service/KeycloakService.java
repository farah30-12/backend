package com.backend.qu2data.service;

import com.backend.qu2data.controller.UserDto;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.admin.client.resource.ClientResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.ws.rs.core.Response;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class KeycloakService {
    private static final Logger logger = LoggerFactory.getLogger(KeycloakService.class);

    @Autowired
    private Keycloak keycloak;

    private final String realm = "qu2data-realm";

    /**
     * ✅ Créer un utilisateur dans Keycloak
     */
    public String createUserInKeycloak(UserDto userDto) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UsersResource usersResource = realmResource.users();

            UserRepresentation newUser = new UserRepresentation();
            newUser.setUsername(userDto.getUserName());
            newUser.setEmail(userDto.getEmail());
            newUser.setFirstName(userDto.getFirstName());
            newUser.setLastName(userDto.getLastName());
            newUser.setEnabled(true);
            newUser.setEmailVerified(true); // ✅ Cette ligne est cruciale

            CredentialRepresentation passwordCred = new CredentialRepresentation();
            passwordCred.setTemporary(false);
            passwordCred.setType(CredentialRepresentation.PASSWORD);
            passwordCred.setValue(userDto.getPassword());
            newUser.setCredentials(Collections.singletonList(passwordCred));

            Response response = usersResource.create(newUser);
            if (response.getStatus() != 201) {
                logger.error("❌ Error creating user: {}", response.getStatusInfo().getReasonPhrase());
                return null;
            }

            String locationHeader = response.getHeaderString("Location");
            if (locationHeader == null) {
                logger.error("❌ Impossible de récupérer l'ID utilisateur depuis la réponse.");
                return null;
            }

            String userId = locationHeader.substring(locationHeader.lastIndexOf("/") + 1);
            logger.info("✅ User created successfully with ID: {}", userId);
            return userId;

        } catch (Exception e) {
            logger.error("❌ Exception while creating user: {}", e.getMessage());
            return null;
        }
    }

    /**
     * ✅ Attribuer un rôle à un utilisateur dans Keycloak
     */
    public boolean assignRoleToUser(String userId, String roleName) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UsersResource usersResource = realmResource.users();

            // Vérifier si l'utilisateur existe
            UserRepresentation user = usersResource.get(userId).toRepresentation();
            if (user == null) {
                logger.error("❌ Utilisateur avec l'ID '{}' introuvable dans Keycloak.", userId);
                return false;
            }

            // Vérifier si le rôle est un rôle de Realm (niveau global)
            RoleRepresentation realmRole = realmResource.roles().get(roleName).toRepresentation();
            if (realmRole != null) {
                usersResource.get(userId).roles().realmLevel().add(Collections.singletonList(realmRole));
                logger.info("✅ Rôle de Realm '{}' attribué avec succès à l'utilisateur ID: {}", roleName, userId);
                return true;
            }

            // Vérifier si le rôle est un rôle de Client (niveau client)
            String clientId = keycloak.realm(realm).clients().findByClientId("qu2data-client").get(0).getId();
            ClientResource clientResource = realmResource.clients().get(clientId);
            RoleRepresentation clientRole = clientResource.roles().get(roleName).toRepresentation();
            if (clientRole != null) {
                usersResource.get(userId).roles().clientLevel(clientId).add(Collections.singletonList(clientRole));
                logger.info("✅ Rôle de Client '{}' attribué avec succès à l'utilisateur ID: {}", roleName, userId);
                return true;
            }

            logger.error("❌ Le rôle '{}' n'existe ni en tant que rôle de Realm ni en tant que rôle de Client.", roleName);
            return false;
        } catch (Exception e) {
            logger.error("❌ Erreur lors de l'attribution du rôle '{}' à l'utilisateur ID '{}': {}", roleName, userId, e.getMessage());
            return false;
        }
    }
    public UserRepresentation getUserByEmail(String email) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UsersResource usersResource = realmResource.users();

            logger.info("🔍 Recherche utilisateur par email (query = {}):", email);

            List<UserRepresentation> users = usersResource.search(email, 0, 50); // ✅ sans filtre strict

            logger.info("➡️ {} utilisateur(s) potentiellement trouvés.", users.size());

            for (UserRepresentation user : users) {
                logger.info("🧪 Vérification : {}", user.getEmail());
                if (user.getEmail() != null && user.getEmail().equalsIgnoreCase(email)) {
                    logger.info("✅ Utilisateur correspondant trouvé : {}", user.getId());
                    return user;
                }
            }

            logger.warn("❌ Aucun utilisateur exact trouvé pour l'email : {}", email);
            return null;
        } catch (Exception e) {
            logger.error("❌ Erreur lors de la recherche de l'utilisateur par email : {}", e.getMessage());
            return null;
        }
    }
    /**
     * ✅ Lire (récupérer) tous les utilisateurs de Keycloak
     */
    public List<UserRepresentation> getUsersFromKeycloak() {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UsersResource usersResource = realmResource.users();
            List<UserRepresentation> users = usersResource.list();
            logger.info("✅ Récupération des utilisateurs réussie : {}", users.size());
            return users;
        } catch (Exception e) {
            logger.error("❌ Erreur lors de la récupération des utilisateurs : {}", e.getMessage());
            return Collections.emptyList();
        }
    }
    public Set<String> getUserRoles(String userId) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UsersResource usersResource = realmResource.users();
            List<RoleRepresentation> roles = usersResource.get(userId).roles().realmLevel().listEffective();
            return roles.stream().map(RoleRepresentation::getName).collect(Collectors.toSet());
        } catch (Exception e) {
            logger.error("❌ Erreur lors de la récupération des rôles de l'utilisateur: {}", e.getMessage());
            return Collections.emptySet();
        }
    }
    @Value("${keycloak.backend-url}") // ajouter dans application.properties
    private String keycloakBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> getUserById(String keycloakId, String token) {
        String url = keycloakBaseUrl + "/admin/realms/" + realm + "/users/" + keycloakId;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.set("Content-Type", "application/json");

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            Map<String, Object> responseBody = response.getBody();

            System.out.println("🧪 Infos Keycloak de " + keycloakId + " : " + responseBody);

            return responseBody;
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la récupération de l'utilisateur Keycloak : " + e.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("firstName", "Inconnu");
            fallback.put("lastName", "Utilisateur");
            return fallback;
        }
    }


    /**
     * ✅ Lire (récupérer) un utilisateur par ID
     */
    public UserRepresentation getUserByIdFromKeycloak(String userId) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UsersResource usersResource = realmResource.users();
            UserRepresentation user = usersResource.get(userId).toRepresentation();
            logger.info("✅ Utilisateur trouvé avec l'ID : {}", userId);
            return user;
        } catch (Exception e) {
            logger.error("❌ Erreur lors de la récupération de l'utilisateur avec l'ID {}: {}", userId, e.getMessage());
            return null;
        }
    }
    /**
     * ✅ Mettre à jour un utilisateur dans Keycloak
     */
 // ✅ Mise à jour de l'utilisateur dans Keycloak
 // ✅ Mise à jour de l'utilisateur dans Keycloak
    public boolean updateUserInKeycloak(String userId, UserDto userDto) {
        try {
            // 🔍 Log pour identifier l'action
            logger.info("🔄 Mise à jour de l'utilisateur dans Keycloak avec ID: {}", userId);

            RealmResource realmResource = keycloak.realm(realm);
            UsersResource usersResource = realmResource.users();
            UserRepresentation user = usersResource.get(userId).toRepresentation();

            if (user == null) {
                logger.error("🚫 Utilisateur introuvable dans Keycloak avec ID: {}", userId);
                return false;
            }

            user.setFirstName(userDto.getFirstName());
            user.setLastName(userDto.getLastName());
            user.setEmail(userDto.getEmail());
            user.setUsername(userDto.getUserName());

            usersResource.get(userId).update(user);
            logger.info("✅ Utilisateur mis à jour dans Keycloak avec succès: {}", userId);
            return true;
        } catch (Exception e) {
            logger.error("❌ Erreur lors de la mise à jour de l'utilisateur dans Keycloak: {}", e.getMessage());
            return false;
        }
    }





    /**
     * ✅ Supprimer un utilisateur dans Keycloak
     */
    public String deleteUserInKeycloak(String userId) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UsersResource usersResource = realmResource.users();

            // Supprimer l'utilisateur de Keycloak
            usersResource.get(userId).remove();
            logger.info("✅ Utilisateur supprimé avec succès dans Keycloak: {}", userId);
            return "Utilisateur supprimé avec succès";
        } catch (Exception e) {
            logger.error("❌ Erreur lors de la suppression de l'utilisateur dans Keycloak: {}", e.getMessage());
            return "Erreur lors de la suppression de l'utilisateur: " + e.getMessage();
        }
    }



    /**
     * ✅ Instancier Keycloak avec les informations d'authentification
     */
    @PostConstruct
    @Bean
    public static Keycloak getKeycloakInstance() {
        return KeycloakBuilder.builder()
                .serverUrl("http://localhost:8080")
                .realm("qu2data-realm")
                .clientId("qu2data-client")
                .clientSecret("q8eCXqHnzBMuon4lkRjAAfbRhsGsXPdP")
                .grantType("client_credentials")
                .username("yassine")
                .password("222")
                .build();
    }
}
