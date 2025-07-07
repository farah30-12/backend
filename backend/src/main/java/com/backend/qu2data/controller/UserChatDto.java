package com.backend.qu2data.controller;

import com.backend.qu2data.entites.Group;

public class UserChatDto {
    private Integer postgresId;
    private String keycloakId;
    private String firstName;
    private String lastName;
    private boolean isGroup;
    private Group group;

    // Constructeurs
    public UserChatDto() {}

    public UserChatDto(Integer postgresId, String keycloakId, String firstName, String lastName) {
        this.postgresId = postgresId;
        this.keycloakId = keycloakId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.isGroup = false;
    }

    public UserChatDto(Integer postgresId, String keycloakId, String firstName, String lastName, boolean isGroup, Group group) {
        this.postgresId = postgresId;
        this.keycloakId = keycloakId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.isGroup = isGroup;
        this.group = group;
    }

    // Getters & Setters
    public Integer getPostgresId() {
        return postgresId;
    }

    public void setPostgresId(Integer postgresId) {
        this.postgresId = postgresId;
    }

    public String getKeycloakId() {
        return keycloakId;
    }

    public void setKeycloakId(String keycloakId) {
        this.keycloakId = keycloakId;
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

    public boolean isGroup() {
        return isGroup;
    }

    public void setGroup(boolean group) {
        isGroup = group;
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
    }
}
