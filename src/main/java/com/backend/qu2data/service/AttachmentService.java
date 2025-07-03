package com.backend.qu2data.service;

import com.backend.qu2data.entites.Attachment;
import com.backend.qu2data.entites.Message;
import com.backend.qu2data.repository.AttachmentRepository;
import com.backend.qu2data.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
public class AttachmentService {

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Autowired
    private MessageRepository messageRepository;

    public List<Attachment> getAllAttachments() {
        return attachmentRepository.findAll();
    }

    public Attachment saveAttachment(Attachment attachment) {
        return attachmentRepository.save(attachment);
    }

    public void deleteAttachment(Integer id) {
        attachmentRepository.deleteById(id);
    }

    public File saveFile(MultipartFile file) {
        try {
            String uploadDir = "uploads";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path path = Paths.get(uploadDir, fileName);

            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            return path.toFile();
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'enregistrement du fichier", e);
        }
    }

    public Attachment saveAttachment(String contentType, MultipartFile file, Message message) {
        File savedFile = saveFile(file);

        Attachment attachment = new Attachment();
        attachment.setName(savedFile.getName());
        attachment.setType(contentType);
        attachment.setSize((int) file.getSize());
        attachment.setPath(savedFile.getAbsolutePath());
        attachment.setMessage(message);

        return attachmentRepository.save(attachment);
    }
}
