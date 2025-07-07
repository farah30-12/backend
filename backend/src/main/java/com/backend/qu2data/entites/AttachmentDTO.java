package com.backend.qu2data.entites;

public class AttachmentDTO {
    private String filename;
    private byte[] fileBytes;

    public AttachmentDTO(String filename, byte[] fileBytes) {
        this.filename = filename;
        this.fileBytes = fileBytes;
    }

    public String getFilename() {
        return filename;
    }

    public byte[] getFileBytes() {
        return fileBytes;
    }
}
