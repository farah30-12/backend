package com.backend.qu2data.entites;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;

import com.backend.qu2data.service.AttachmentService;

import jakarta.persistence.*;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "content", nullable = false)
    private String content;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted;

    @Column(name = "is_updated", nullable = false)
    private Boolean isUpdated;
    @ManyToOne
    @JoinColumn(name = "group_id")
    private Group group;

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
    }

    @ManyToOne
    @JoinColumn(name = "sent_by")
    private Users sentBy;
    
    @ManyToOne
    @JoinColumn(name = "received_by")
    private Users receivedBy;

    // ✅ Corrigé : une seule déclaration
    @OneToMany(mappedBy = "message", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Attachment> attachments = new ArrayList<>();



    public Message() {
        this.isDeleted = false;
        this.isUpdated = false;
    }



    public Message(String content, Users sentBy, Users receivedBy) {
        this.content = content;
        this.sentBy = sentBy;
        this.receivedBy = receivedBy;
        this.isDeleted = false;
        this.isUpdated = false;
        this.timestamp = LocalDateTime.now(); // Set timestamp to current time when the message is created
    }
    // Getters et Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public Boolean getIsUpdated() {
        return isUpdated;
    }

    public void setIsUpdated(Boolean isUpdated) {
        this.isUpdated = isUpdated;
    }

    public Users getSentBy() {
        return sentBy;
    }

    public void setSentBy(Users sentBy) {
        this.sentBy = sentBy;
    }

    public Users getReceivedBy() {
        return receivedBy;
    }

    public void setReceivedBy(Users receivedBy) {
        this.receivedBy = receivedBy;
    }

    public List<Attachment> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<Attachment> attachments) {
        this.attachments = attachments;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    @ManyToMany
    @JoinTable(
      name = "message_seen_by",
      joinColumns = @JoinColumn(name = "message_id"),
      inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<Users> seenBy = new HashSet<>();
    private String senderName;  // Field to store the sender's full name

    // Getters and Setters for senderName
    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

	public Set<Users> getSeenBy() {
		return seenBy;
	}

	public void setSeenBy(Set<Users> seenBy) {
		this.seenBy = seenBy;
	}

}

