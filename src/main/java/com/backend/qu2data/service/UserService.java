package com.backend.qu2data.service;
import org.springframework.beans.factory.annotation.Autowired;
/*
import org.springframework.stereotype.Service;

import com.backend.entity.User;
import com.backend.qu2data.repository.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public User createUser(User user) {
        return userRepository.save(user);
    }

    // Autres méthodes comme findById, findAll, etc.
}
*/



/*
@Service
public class UserService {

    @Autowired
    private KeycloakService keycloakService;

    @Autowired
    private UserRepository userRepository;

    // Synchroniser un utilisateur depuis Keycloak vers PostgreSQL
    public User synchronizeUserToDatabase(UserRepresentation keycloakUser) {
        User user = new User();
        user.setUserName(keycloakUser.getUsername());
        user.setEmail(keycloakUser.getEmail());
        user.setFirstName(keycloakUser.getFirstName());
        user.setLastName(keycloakUser.getLastName());
        user.setRole("user");  // Par défaut, on peut affecter un rôle ici

        // Sauvegarder l'utilisateur dans PostgreSQL
        return userRepository.save(user);
    }

    // Synchroniser un utilisateur depuis PostgreSQL vers Keycloak
    public UserRepresentation synchronizeUserToKeycloak(User user) {
        UserRepresentation keycloakUser = new UserRepresentation();
        keycloakUser.setUsername(user.getUserName());
        keycloakUser.setEmail(user.getEmail());
        keycloakUser.setFirstName(user.getFirstName());
        keycloakUser.setLastName(user.getLastName());
        // Ajout des autres attributs nécessaires pour Keycloak

        // Appeler Keycloak pour créer un utilisateur
        return keycloakService.createUserInKeycloak(keycloakUser);
    }
}*/
