package com.backend.qu2data.service;

import com.backend.qu2data.entites.Client;
import com.backend.qu2data.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ClientService {

    @Autowired
    private ClientRepository clientRepository;

    public Client createClient(Client client) {
        // Si aucune date de conversion n’est précisée, on met aujourd’hui
        if (client.getDateConversion() == null) {
            client.setDateConversion(LocalDate.now());
        }
        return clientRepository.save(client);
    }

    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    public Client getClientById(Long id) {
        return clientRepository.findById(id).orElse(null);
    }

    public void deleteClient(Long id) {
        clientRepository.deleteById(id);
    }
   

        public Client updateClient(Long id, Client updatedClient) {
            Optional<Client> existingOpt = clientRepository.findById(id);
            if (existingOpt.isEmpty()) {
                return null;
            }

            Client existing = existingOpt.get();

            // Vérifie si l’email est changé et s’il est déjà utilisé par un autre client
            if (!existing.getEmail().equals(updatedClient.getEmail())) {
                Optional<Client> emailCheck = clientRepository.findByEmail(updatedClient.getEmail());
                if (emailCheck.isPresent() && !emailCheck.get().getId().equals(id)) {
                    throw new IllegalArgumentException("Cet email est déjà utilisé par un autre client.");
                }
            }

            // Mise à jour des champs
            existing.setFirstName(updatedClient.getFirstName());
            existing.setLastName(updatedClient.getLastName());
            existing.setEmail(updatedClient.getEmail());
            existing.setPhone(updatedClient.getPhone());
            existing.setSociete(updatedClient.getSociete());
            existing.setVille(updatedClient.getVille());
            existing.setPays(updatedClient.getPays());
            existing.setStatut(updatedClient.getStatut());
            existing.setCodePostal(updatedClient.getCodePostal());
            existing.setDescription(updatedClient.getDescription());
            existing.setOrigine(updatedClient.getOrigine());
            existing.setSecteur(updatedClient.getSecteur());
            existing.setGestionnaire(updatedClient.getGestionnaire());

            return clientRepository.save(existing);
        }
    }




