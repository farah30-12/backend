package com.backend.qu2data.entites;


import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnoreProperties("tasks") // Pour éviter les boucles infinies
    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project; // Peut être NULL si isPersonalTodo = true

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(nullable = false)
    private String status = "À faire"; // "À faire", "En cours", "Terminé"

    private String priority = "Moyenne"; // "Faible", "Moyenne", "Élevée"

    private LocalDate startDate;

    private LocalDate endDate;

    @ManyToOne
    @JoinColumn(name = "created_by_user_id")
    private Users createdBy;

    @ManyToOne
    @JoinColumn(name = "assigned_user_id")
    private Users assignedTo;

    @Column(name = "is_personal_todo")
    private Boolean isPersonalTodo = false;

    private LocalDateTime appointmentTimeStart;

    private LocalDateTime appointmentTimeEnd;

    private String reminder;

    private String note;

    // Getters and Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Users getCreatedBy() { return createdBy; }
    public void setCreatedBy(Users createdBy) { this.createdBy = createdBy; }

    public Users getAssignedTo() { return assignedTo; }
    public void setAssignedTo(Users assignedTo) { this.assignedTo = assignedTo; }

    public Boolean getIsPersonalTodo() { return isPersonalTodo; }
    public void setIsPersonalTodo(Boolean isPersonalTodo) { this.isPersonalTodo = isPersonalTodo; }

    public LocalDateTime getAppointmentTimeStart() { return appointmentTimeStart; }
    public void setAppointmentTimeStart(LocalDateTime appointmentTimeStart) { this.appointmentTimeStart = appointmentTimeStart; }

    public LocalDateTime getAppointmentTimeEnd() { return appointmentTimeEnd; }
    public void setAppointmentTimeEnd(LocalDateTime appointmentTimeEnd) { this.appointmentTimeEnd = appointmentTimeEnd; }

    public String getReminder() { return reminder; }
    public void setReminder(String reminder) { this.reminder = reminder; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
