package com.backend.qu2data.entites;

public class TaskDTO {

    private Long id;
    private String title;
    private String status;
    private String priority;
    private String description;
    private Long projectId;
    private String startDate;
    private String endDate;
    private String createdByFullName;
    private String assignedToFullName;
    private Long assignedById;

    public TaskDTO() {}

    public TaskDTO(Task task, String createdByFullName, String assignedToFullName , Long projectId) {
        this.id = task.getId();
        this.title = task.getTitle();
        this.status = task.getStatus();
        this.priority = task.getPriority();
        this.description = task.getDescription();
        this.startDate = task.getStartDate() != null ? task.getStartDate().toString() : null;
        this.endDate = task.getEndDate() != null ? task.getEndDate().toString() : null;
        this.createdByFullName = createdByFullName;
        this.assignedToFullName = assignedToFullName;
        this.projectId = projectId;
        this.assignedById=assignedById;
    }

    // Getters and setters...

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public String getCreatedByFullName() { return createdByFullName; }
    public void setCreatedByFullName(String createdByFullName) { this.createdByFullName = createdByFullName; }

    public String getAssignedToFullName() { return assignedToFullName; }
    public void setAssignedToFullName(String assignedToFullName) { this.assignedToFullName = assignedToFullName; }

	public Long getProjectId() {
		return projectId;
	}

	public void setProjectId(Long projectId) {
		this.projectId = projectId;
	}

	public Long getAssignedById() {
		return assignedById;
	}

	public void setAssignedById(Long assignedById) {
		this.assignedById = assignedById;
	}
}
