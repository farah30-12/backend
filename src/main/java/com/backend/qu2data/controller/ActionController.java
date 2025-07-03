package com.backend.qu2data.controller;

import java.util.ArrayList;
import java.util.List;

import org.keycloak.representations.idm.UserRepresentation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.backend.qu2data.entites.Action;
import com.backend.qu2data.entites.AttachmentDTO;
import com.backend.qu2data.entites.EmailQualificationDTO;
import com.backend.qu2data.entites.OfferRequestDTO;
import com.backend.qu2data.service.ActionService;
import com.backend.qu2data.service.EmailService;
import com.backend.qu2data.service.KeycloakService;
import com.backend.qu2data.service.PdfService;

@RestController
@RequestMapping("/api/actions")
@CrossOrigin(origins = "http://localhost:3000")
public class ActionController {
	@Autowired
	private PdfService pdfService;
    @Autowired
    private EmailService emailService;
    @Autowired
    private ActionService actionService;

    @Autowired
    private KeycloakService keycloakService;

    @PostMapping
    public ResponseEntity<?> createAction(@RequestBody Action action) {
        try {
            // 🔍 Récupération de l'utilisateur Keycloak par email
            UserRepresentation keycloakUser = keycloakService.getUserByEmail(action.getManagerEmail());
            if (keycloakUser == null) {
                return ResponseEntity.status(404).body("Aucun utilisateur Keycloak trouvé avec cet email.");
            }

            // ✅ Stocker l’email (et non l’ID) dans le champ managerEmail
            action.setManagerEmail(keycloakUser.getEmail());

            // 💾 Sauvegarde
            Action saved = actionService.create(action);

            // ✅ SI l'action est "Email de qualification", envoyer l'email automatiquement
            if ("Email de qualification".equalsIgnoreCase(action.getObjet())) {
                if (action.getProspect() != null && action.getProspect().getEmail() != null) {
                    emailService.sendQualificationEmail(
                        action.getProspect().getEmail(),
                        action.getProspect().getFirstName(),
                        action.getProspect().getSociete()
                    );
                }
            }

            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur création action : " + e.getMessage());
        }
    }

    @PostMapping("/templates")
    public ResponseEntity<?> createActionTemplate(@RequestBody Action action) {
        try {
            action.setIsProgrammable(true); // ✅ C'est un modèle
            action.setProspect(null);       // ❌ Aucun prospect lié
            action.setParentAction(null);   // ❌ Pas de parent car c’est un modèle

            Action saved = actionService.create(action);
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur création modèle : " + e.getMessage());
        }
    }
    @PostMapping("/duplicate/{templateId}")
    public ResponseEntity<?> duplicateActionTemplate(
            @PathVariable Long templateId,
            @RequestBody Action actionData
    ) {
        try {
            Action template = actionService.getById(templateId);
            if (!template.getIsProgrammable()) {
                return ResponseEntity.badRequest().body("Ce n'est pas une action modèle.");
            }

            // Copier les données du modèle
            Action newAction = new Action();
            newAction.setObjet(template.getObjet());
            newAction.setDescription(template.getDescription());
            newAction.setContact(actionData.getContact());
            newAction.setManagerEmail(actionData.getManagerEmail());
            newAction.setDateEcheance(actionData.getDateEcheance());
            newAction.setDateRappel(actionData.getDateRappel());
            newAction.setStatut(actionData.getStatut());
            newAction.setIsProgrammable(false);
            newAction.setProspect(actionData.getProspect());
            newAction.setParentAction(template);

            Action saved = actionService.create(newAction);

            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur duplication : " + e.getMessage());
        }
    }
    @PostMapping("/duplicate-and-send/{prospectId}")
    public ResponseEntity<String> duplicateAndSend(@PathVariable Long prospectId) {
        try {
            actionService.dupliquerEtEnvoyerPourProspect(prospectId);
            return ResponseEntity.ok("✅ Actions dupliquées et emails envoyés.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("❌ Erreur : " + e.getMessage());
        }
    }

    @GetMapping("/templates")
    public List<Action> getActionTemplates() {
        return actionService.getTemplates(); // on va le coder juste après dans le service
    }

    @GetMapping
    public List<Action> getAll() {
        return actionService.getAll();
    }

    @GetMapping("/{id}")
    public Action getById(@PathVariable Long id) {
        return actionService.getById(id);
    }

    @PutMapping("/{id}")
    public Action update(@PathVariable Long id, @RequestBody Action action) {
        return actionService.update(id, action);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        actionService.delete(id);
    }
    @PostMapping("/send-email-qualification")
    public ResponseEntity<?> sendQualificationEmail(@RequestBody EmailQualificationDTO dto) {
        try {
            emailService.sendQualificationEmail(dto.getRecipient(), dto.getFirstName(), dto.getCompanyName());
            return ResponseEntity.ok("📩 Email envoyé avec succès !");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur lors de l'envoi de l'email : " + e.getMessage());
        }
    }
    @PostMapping(value = "/send-multiple-files-offer", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> sendOfferWithMultipleFiles(
        @RequestParam("files") List<MultipartFile> files,
        @RequestParam("recipient") String recipient,
        @RequestParam("fullName") String fullName,
        @RequestParam("company") String company
    ) {
        try {
            List<AttachmentDTO> attachments = new ArrayList<>();
            for (MultipartFile file : files) {
                attachments.add(new AttachmentDTO(file.getOriginalFilename(), file.getBytes()));
            }

            emailService.sendOfferEmailWithPdf(recipient, fullName, company, attachments);
            return ResponseEntity.ok("✅ Proposition commerciale envoyée avec plusieurs fichiers !");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("❌ Erreur : " + e.getMessage());
        }
    }



    @PostMapping(value = "/send-multiple-files-closing", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> sendClosingWithMultipleFiles(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("clientName") String clientName,
            @RequestParam("clientEmail") String clientEmail,
            @RequestParam("companyName") String companyName
    ) {
        try {
            List<AttachmentDTO> attachments = new ArrayList<>();
            for (MultipartFile file : files) {
                attachments.add(new AttachmentDTO(file.getOriginalFilename(), file.getBytes()));
            }

            emailService.sendClosingEmailWithFile(clientEmail, clientName, companyName, attachments);
            return ResponseEntity.ok("✅ Email de closing envoyé avec plusieurs fichiers !");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("❌ Erreur : " + e.getMessage());
        }
    }

}
