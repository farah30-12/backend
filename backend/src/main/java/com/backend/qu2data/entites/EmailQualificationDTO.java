package com.backend.qu2data.entites;

//📁 src/main/java/com/backend/qu2data/dto/EmailQualificationDTO.jav

public class EmailQualificationDTO {
 private String recipient;
 private String firstName;
 private String companyName;

 // Getters & Setters
 public String getRecipient() {
     return recipient;
 }

 public void setRecipient(String recipient) {
     this.recipient = recipient;
 }

 public String getFirstName() {
     return firstName;
 }

 public void setFirstName(String firstName) {
     this.firstName = firstName;
 }

 public String getCompanyName() {
     return companyName;
 }

 public void setCompanyName(String companyName) {
     this.companyName = companyName;
 }
}
