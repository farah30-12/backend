package com.backend.qu2data.controller;

import java.time.LocalDateTime;

public class GroupMessageDTO {
    private Long id;           // ✅ Long
    private Long senderId;     // ✅ Long aussi
    private String firstName;
    private String lastName;
    private String content;
    private LocalDateTime timestamp;

    public GroupMessageDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
