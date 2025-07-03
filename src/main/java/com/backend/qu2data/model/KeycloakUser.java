package com.backend.qu2data.model;

public class KeycloakUser {
	  private String userName;
	    private String email;
	    private String password;
	    private String firstName;
	    private String lastName;
	    private String role;
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
		public String getRole() {
			return role;
		}
		public void setRole(String role) {
			this.role = role;
		}
		   public KeycloakUser(User user) {
		        this.userName = user.getUserName();
		        this.email = user.getEmail();
		        this.password = user.getPassword();
		        this.firstName = user.getFirstName();
		        this.lastName = user.getLastName();
		        this.role = user.getRole();
		    }
}
