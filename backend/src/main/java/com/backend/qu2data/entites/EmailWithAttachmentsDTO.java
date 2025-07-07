package com.backend.qu2data.entites;

import org.springframework.web.multipart.MultipartFile;

public class EmailWithAttachmentsDTO {
    private String to;
    private String subject;
    private String body;
    private String sender;
	public String getTo() {
		return to;
	}
	public void setTo(String to) {
		this.to = to;
	}
	public String getSubject() {
		return subject;
	}
	public void setSubject(String subject) {
		this.subject = subject;
	}
	public String getBody() {
		return body;
	}
	public void setBody(String body) {
		this.body = body;
	}
	public String getSender() {
		return sender;
	}
	public void setSender(String sender) {
		this.sender = sender;
	}

    // Getters & setters
}
