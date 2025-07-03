package com.backend.qu2data.controller;

public class MessageGroupDTO {
    private Integer senderId;
    private Integer groupId;
    private String content;

    public MessageGroupDTO() {
    }

    public MessageGroupDTO(Integer senderId, Integer groupId, String content) {
        this.senderId = senderId;
        this.groupId = groupId;
        this.content = content;
    }

    public Integer getSenderId() {
        return senderId;
    }

    public void setSenderId(Integer senderId) {
        this.senderId = senderId;
    }

    public Integer getGroupId() {
        return groupId;
    }

    public void setGroupId(Integer groupId) {
        this.groupId = groupId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}