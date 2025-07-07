package com.backend.qu2data.entites;


import java.time.LocalDateTime;




public class UserChatDto {
    private Long postgresId;
    private String idKeycloak;
    private String firstName;
    private String lastName;
    private LocalDateTime lastMessageTime;

    public UserChatDto(Long postgresId, String idKeycloak, String firstName, String lastName, LocalDateTime lastMessageTime) {
        this.postgresId = postgresId;
        this.idKeycloak = idKeycloak; // ✅ camelCase ici aussi
        this.firstName = firstName;
        this.lastName = lastName;
        this.lastMessageTime = lastMessageTime;
    }

    public Long getPostgresId() {
        return postgresId;
    }

    public void setPostgresId(Long postgresId) {
        this.postgresId = postgresId;
    }

    public String getIdKeycloak() {
        return idKeycloak;
    }

    public void setIdKeycloak(String idKeycloak) {
        this.idKeycloak = idKeycloak;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public LocalDateTime getLastMessageTime() {
        return lastMessageTime;
    }

    public void setLastMessageTime(LocalDateTime lastMessageTime) {
        this.lastMessageTime = lastMessageTime;
    }
}





	
