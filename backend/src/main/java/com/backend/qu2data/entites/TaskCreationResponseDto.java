package com.backend.qu2data.entites;
import com.backend.qu2data.entites.Task;

public class TaskCreationResponseDto {
    private String title;
    private String description;
    private String status;
    private String priority;
    private String startDate;
    private String endDat;
    private Long projectId;
    private Long createdById;
    private Long assignedUserId;

    private String assignedToFirstName;
    private String assignedToLastName;
	private Object endDate;

    public TaskCreationResponseDto(Task task) {
        this.title = task.getTitle();
        this.description = task.getDescription();
        this.status = task.getStatus();
        this.priority = task.getPriority();
        this.startDate = task.getStartDate() != null ? task.getStartDate().toString() : null;
        this.endDate = task.getEndDate() != null ? task.getEndDate().toString() : null;

        this.projectId = task.getProject() != null ? task.getProject().getId() : null;
        this.createdById = task.getCreatedBy() != null ? task.getCreatedBy().getId() : null;
        this.assignedUserId = task.getAssignedTo() != null ? task.getAssignedTo().getId() : null;

        if (task.getAssignedTo() != null) {
            this.assignedToFirstName = task.getAssignedTo().getFirstName();
            this.assignedToLastName = task.getAssignedTo().getLastName();
        }
    }

    // ✅ Ajoute tes getters (ou utilise Lombok avec @Getter)
}
