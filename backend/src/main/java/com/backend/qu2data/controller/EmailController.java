package com.backend.qu2data.controller;
/*
import com.backend.qu2data.service.EmailService;
import com.backend.qu2data.entites.AttachmentDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/emails")
@CrossOrigin(origins = "http://localhost:3000")
public class EmailController {

 @Autowired
 private EmailService emailService;

 @PostMapping(value = "/send", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
 public ResponseEntity<?> sendEmailWithAttachments(
         @RequestParam("to") String to,
         @RequestParam("subject") String subject,
         @RequestParam("body") String body,
         @RequestParam("sender") String sender,
         @RequestParam(value = "files", required = false) List<MultipartFile> files
 ) {
     try {
         List<AttachmentDTO> attachments = new ArrayList<>();
         if (files != null) {
             for (MultipartFile file : files) {
                 attachments.add(new AttachmentDTO(file.getOriginalFilename(), file.getBytes()));
             }
         }

         emailService.sendEmailWithAttachments(to, subject, body, sender, attachments);
         return ResponseEntity.ok("✅ Email avec pièces jointes envoyé !");
     } catch (Exception e) {
         return ResponseEntity.status(500).body("Erreur envoi email : " + e.getMessage());
     }
 }
}
*/