package com.backend.qu2data.controller;


import com.backend.qu2data.entites.Attachment;
import com.backend.qu2data.service.AttachmentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attachments")
public class AttachmentController {

    @Autowired
    private AttachmentService attachmentService;

    @GetMapping
    public List<Attachment> getAllAttachments() {
        return attachmentService.getAllAttachments();
    }

    @PostMapping
    public Attachment saveAttachment(@RequestBody Attachment attachment) {
        return attachmentService.saveAttachment(attachment);
    }

    @DeleteMapping("/{id}")
    public void deleteAttachment(@PathVariable Integer id) {
        attachmentService.deleteAttachment(id);
    }
}
