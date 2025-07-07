package com.backend.qu2data.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;


import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.backend.qu2data.entites.Attachment;

@Service
public class FileStorageService {

    public Attachment saveFile(MultipartFile file) {
        try {
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get("uploads", filename);

            Files.createDirectories(filePath.getParent());
            Files.write(filePath, file.getBytes());

            Attachment attachment = new Attachment();
            attachment.setPath("/uploads/" + filename); // ✅ correspond à ton champ `path`
            attachment.setName(filename);
            attachment.setType(file.getContentType());
            attachment.setSize((int) file.getSize()); // ou chemin absolu selon ton app
            attachment.setType(file.getContentType());

            return attachment;

        } catch (IOException e) {
            throw new RuntimeException("Erreur sauvegarde fichier", e);
        }
    }
}

