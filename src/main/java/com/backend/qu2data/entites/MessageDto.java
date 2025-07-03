package com.backend.qu2data.entites;

import java.time.LocalDateTime;

public class MessageDto {
    private String content;
    private Long sentById;
    private Long receivedById;
    private String senderName;
    private LocalDateTime timestamp;  // Added timestamp field

    // Getters and setters
    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Long getSentById() {
        return sentById;
    }

    public void setSentById(Long sentById) {
        this.sentById = sentById;
    }

    public Long getReceivedById() {
        return receivedById;
    }

    public void setReceivedById(Long receivedById) {
        this.receivedById = receivedById;
    }

    // Getter and Setter for senderName
    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    // Getter and Setter for timestamp
    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
