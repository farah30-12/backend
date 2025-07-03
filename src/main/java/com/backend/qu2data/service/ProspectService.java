package com.backend.qu2data.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.backend.qu2data.entites.Client;
import com.backend.qu2data.entites.Prospect;
import com.backend.qu2data.repository.ClientRepository;
import com.backend.qu2data.repository.ProspectRepository;

@Service
public class ProspectService {

    private final ProspectRepository prospectRepository;
    private final ClientRepository clientRepository;

    public ProspectService(ProspectRepository prospectRepository, ClientRepository clientRepository) {
        this.prospectRepository = prospectRepository;
        this.clientRepository = clientRepository;
    }

    public Prospect save(Prospect prospect) {
        return prospectRepository.save(prospect);
    }

    public List<Prospect> findAll() {
        return prospectRepository.findAll();
    }

    public Optional<Prospect> findById(Long id) {
        return prospectRepository.findById(id);
    }

    public void delete(Long id) {
        prospectRepository.deleteById(id);
    }

    // ✅ MÉTHODE DE CONVERSION
    public Client convertToClient(Long prospectId) {
        Prospect prospect = prospectRepository.findById(prospectId)
                .orElseThrow(() -> new RuntimeException("Prospect introuvable"));

        Client client = new Client(
            prospect.getId(),
            prospect.getGestionnaire(),
            prospect.getFirstName(),
            prospect.getLastName(),
            prospect.getPhone(),
            prospect.getSecteur(),
            prospect.getSociete(),
            prospect.getEmail(),
            prospect.getStatut(),
            prospect.getPays(),
            prospect.getVille(),
            prospect.getCodePostal(),
            prospect.getDescription(),
            prospect.getOrigine(),
            LocalDate.now(),         // ✅ Date de conversion
            false                    // ✅ Pas une création directe
        );

        return clientRepository.save(client);
    }

}
