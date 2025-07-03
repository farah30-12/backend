package com.backend.qu2data.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.qu2data.entites.Task;
import com.backend.qu2data.entites.Users;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // Récupérer toutes les tâches créées par un utilisateur
    List<Task> findByCreatedBy(Users user);

    // Récupérer toutes les tâches assignées à un utilisateur
    List<Task> findByAssignedTo(Users user);

    // Récupérer les tâches personnelles d'un utilisateur
    List<Task> findByCreatedByAndIsPersonalTodoTrue(Users user);

    // Récupérer toutes les tâches d'un projet spécifique
    List<Task> findByProject_Id(Long projectId);
    List<Task> findByProjectId(Long projectId);
}