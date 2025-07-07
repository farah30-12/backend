package com.backend.qu2data.controller;

import lombok.Data;
import java.util.List;

@Data
public class GroupCreationDto {
    private String name;
    private String description;
    private Boolean isClosed;
    private List<GroupUserDto> members;

    // Getters & Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsClosed() {
        return isClosed;
    }

    public void setIsClosed(Boolean isClosed) {
        this.isClosed = isClosed;
    }

    public List<GroupUserDto> getMembers() {
        return members;
    }

    public void setMembers(List<GroupUserDto> members) {
        this.members = members;
    }
}