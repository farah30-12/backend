package com.backend.qu2data.controller;
import jakarta.transaction.Transactional;
import com.backend.qu2data.entites.Client;
import com.backend.qu2data.entites.Prospect;
import com.backend.qu2data.entites.Prospect.Statut;
import com.backend.qu2data.repository.ActionRepository;
import com.backend.qu2data.repository.ProspectRepository;
import com.backend.qu2data.service.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/clients")
 // autoriser le frontend à accéder à l’API
public class ClientController {
	@Autowired
	private ProspectRepository prospectRepository;

	@Autowired
	private ActionRepository actionRepository;
    @Autowired
    private ClientService clientService;
  
    
    @PostMapping
    public ResponseEntity<Client> createClient(@RequestBody Client client) {
        return ResponseEntity.ok(clientService.createClient(client));
    }
    @PutMapping("/{id}")
    public ResponseEntity<Client> updateClient(@PathVariable Long id, @RequestBody Client updatedClient) {
        Client client = clientService.updateClient(id, updatedClient);
        return client != null ? ResponseEntity.ok(client) : ResponseEntity.notFound().build();
    }

    @GetMapping("/clients")
    public List<Prospect> getClients() {
        return prospectRepository.findAllClients();
    }
    @GetMapping("/{id}")
    public ResponseEntity<Client> getClientById(@PathVariable Long id) {
        Client client = clientService.getClientById(id);
        return client != null ? ResponseEntity.ok(client) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/clients/{id}")
    @Transactional
    public ResponseEntity<?> deleteProspectById(@PathVariable Long id) {
        Optional<Prospect> opt = prospectRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Supprimer les actions liées
        actionRepository.deleteByProspectId(id);

        // Puis supprimer le prospect
        prospectRepository.deleteById(id);
        return ResponseEntity.ok("Prospect supprimé avec succès.");
    }

}
