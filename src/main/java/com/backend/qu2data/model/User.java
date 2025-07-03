package com.backend.qu2data.model;

public class User {
    private String userName;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String role;// Ajoutez ce champ
    private String jobTitle;  // ✅ Ajouté pour PostgreSQL
    private String phoneNumber;

    // Getters et setters
    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public String getRole() { // Ajoutez ce getter
        return role;
    }

    public void setRole(String role) { // Ajoutez ce setter
        this.role = role;
    }
    public String getJobTitle() { return jobTitle; }  // ✅ Ajouté
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; } 

    public String getPhoneNumber() { return phoneNumber; }  // ✅ Ajouté
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; } 
}