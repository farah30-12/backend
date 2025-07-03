package com.backend.qu2data.entites;


public class TaskCreationDto {
    private String title;
    private String description;
    private String status;
    private String priority;
    private String startDate;
    private String endDate;
    private Long projectId;

    private Long createdById;     // ID PostgreSQL du créateur
    private Long assignedUserId;  // ID PostgreSQL du destinataire (null si tâche perso)
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public String getPriority() {
		return priority;
	}
	public void setPriority(String priority) {
		this.priority = priority;
	}
	public String getStartDate() {
		return startDate;
	}
	public void setStartDate(String startDate) {
		this.startDate = startDate;
	}
	public String getEndDate() {
		return endDate;
	}
	public void setEndDate(String endDate) {
		this.endDate = endDate;
	}
	public Long getProjectId() {
		return projectId;
	}
	public void setProjectId(Long projectId) {
		this.projectId = projectId;
	}
	public Long getCreatedById() {
		return createdById;
	}
	public void setCreatedById(Long createdById) {
		this.createdById = createdById;
	}
	public Long getAssignedUserId() {
		return assignedUserId;
	}
	public void setAssignedUserId(Long assignedUserId) {
		this.assignedUserId = assignedUserId;
	}

    // Getters et setters
}
