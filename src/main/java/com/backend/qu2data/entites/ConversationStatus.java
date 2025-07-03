package com.backend.qu2data.entites;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "conversation_status")
public class ConversationStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Users user; // utilisateur connecté

    @ManyToOne
    private Users otherUser; // autre utilisateur pour les messages privés

    @ManyToOne
    private Group group; // groupe concerné

    private LocalDateTime lastReadAt;

    // --- Getters & Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Users getUser() {
        return user;
    }

    public void setUser(Users user) {
        this.user = user;
    }

    public Users getOtherUser() {
        return otherUser;
    }

    public void setOtherUser(Users otherUser) {
        this.otherUser = otherUser;
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
    }

    public LocalDateTime getLastReadAt() {
        return lastReadAt;
    }

    public void setLastReadAt(LocalDateTime lastReadAt) {
        this.lastReadAt = lastReadAt;
    }
}
