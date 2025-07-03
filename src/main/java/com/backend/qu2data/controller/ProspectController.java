package com.backend.qu2data.controller;

import java.util.List;

import org.keycloak.representations.idm.UserRepresentation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.qu2data.entites.Client;
import com.backend.qu2data.entites.Prospect;
import com.backend.qu2data.repository.ProspectRepository;
import com.backend.qu2data.service.KeycloakService;
import com.backend.qu2data.service.ProspectService;

@RestController
@RequestMapping("/api/prospects")
@CrossOrigin
public class ProspectController {
	@Autowired
	private KeycloakService keycloakService;
    private final ProspectService service;
    @Autowired
    private ProspectRepository prospectRepository;
    public ProspectController(ProspectService service) {
        this.service = service;
    }
    @GetMapping
    public List<Prospect> getAllProspects() {
        return prospectRepository.findAllNonClients();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Prospect> getById(@PathVariable Long id) {
        return prospectRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    @PostMapping
    public ResponseEntity<?> createProspect(@RequestBody Prospect prospect) {
        try {
            // 🔍 Récupérer l'utilisateur par email
            UserRepresentation keycloakUser = keycloakService.getUserByEmail(prospect.getGestionnaire());
            if (keycloakUser == null) {
                return ResponseEntity.status(404).body("Aucun utilisateur Keycloak trouvé avec cet email.");
            }

            // ✅ Associer l'ID Keycloak au champ gestionnaire
            prospect.setGestionnaire(keycloakUser.getId());

            // 💾 Sauvegarder
            Prospect saved = prospectRepository.save(prospect);
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur création prospect : " + e.getMessage());
        }
    }


    @PostMapping("/{id}/convert")
    public ResponseEntity<?> convertToClient(@PathVariable Long id) {
        try {
            Client client = service.convertToClient(id);
            return ResponseEntity.ok(client);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur lors de la conversion : " + e.getMessage());
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<Prospect> update(@PathVariable Long id, @RequestBody Prospect updated) {
        return service.findById(id).map(p -> {
            updated.setId(id);
            return ResponseEntity.ok(service.save(updated));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}