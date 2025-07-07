package com.backend.qu2data.controller;

//package com.backend.qu2data.dto; (ou controller si tu veux le mettre temporairement là)

public class GroupUserDto {
 private Long userId;
 private String nickName;
 private Boolean isAdmin;

 // Getters & Setters
 public Long getUserId() {
     return userId;
 }

 public void setUserId(Long userId) {
     this.userId = userId;
 }

 public String getNickName() {
     return nickName;
 }

 public void setNickName(String nickName) {
     this.nickName = nickName;
 }

 public Boolean getIsAdmin() {
     return isAdmin;
 }

 public void setIsAdmin(Boolean isAdmin) {
     this.isAdmin = isAdmin;
 }
}
