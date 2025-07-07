package com.backend.qu2data.service;

import java.time.LocalDate;

import java.util.List;
import com.backend.qu2data.repository.ProspectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.qu2data.entites.Action;
import com.backend.qu2data.entites.Prospect;
import com.backend.qu2data.repository.ActionRepository;

@Service
public class ActionService {
	@Autowired
	private EmailService emailService;
    @Autowired
    private ActionRepository actionRepository;
    @Autowired
    private ProspectRepository prospectRepository;
    public List<Action> getAll() {
        return actionRepository.findAll();
    }

    public Action getById(Long id) {
        return actionRepository.findById(id).orElseThrow(() -> new RuntimeException("Action non trouvée"));
    }

    public Action create(Action action) {
        return actionRepository.save(action);
    }
    public List<Action> getTemplates() {
        return actionRepository.findByIsProgrammableTrue();
    }

    public Action update(Long id, Action updated) {
        Action action = getById(id);
        action.setObjet(updated.getObjet());
        action.setStatut(updated.getStatut());
        action.setDateEcheance(updated.getDateEcheance());
        action.setDateRappel(updated.getDateRappel());
        action.setDescription(updated.getDescription());
        action.setContact(updated.getContact());
        action.setProspect(updated.getProspect());
        return actionRepository.save(action);
    }

    public void delete(Long id) {
        actionRepository.deleteById(id);
    }
    public void dupliquerEtEnvoyerPourProspect(Long prospectId) {
        Prospect prospect = prospectRepository.findById(prospectId)
            .orElseThrow(() -> new RuntimeException("Prospect non trouvé"));

        List<Action> templates = actionRepository.findByIsProgrammableTrue();

        for (Action template : templates) {
            Action copie = new Action();
            copie.setObjet(template.getObjet());
            copie.setDescription(template.getDescription());
            copie.setIsProgrammable(true);
            copie.setStatut("non_commence");
            copie.setDateEcheance(LocalDate.now().plusDays(1));
            copie.setParentAction(template);
            copie.setProspect(prospect);
            copie.setContact(prospect.getFirstName() + " " + prospect.getLastName());
            copie.setManagerEmail(template.getManagerEmail());

            actionRepository.save(copie);

            // 🔁 Envoi automatique en fonction de l'objet de l'action
            try {
                switch (template.getObjet().toLowerCase()) {
                    case "email de qualification":
                        emailService.sendQualificationEmail(
                            prospect.getEmail(),
                            prospect.getFirstName(),
                            prospect.getSociete()
                        );
                        break;

                    case "proposition commerciale":
                        // Tu peux générer un PDF dynamique ou utiliser un fichier mock
                        emailService.sendOfferEmailWithPdf(
                            prospect.getEmail(),
                            prospect.getFirstName() + " " + prospect.getLastName(),
                            prospect.getSociete(),
                            List.of(/* Liste de AttachmentDTO ici */)
                        );
                        break;

                    case "closing":
                        emailService.sendClosingEmailWithFile(
                            prospect.getEmail(),
                            prospect.getFirstName() + " " + prospect.getLastName(),
                            prospect.getSociete(),
                            List.of(/* Liste de fichiers */)
                        );
                        break;
                }
            } catch (Exception e) {
                System.err.println("Erreur d'envoi d'email : " + e.getMessage());
            }
        }
    }
}
