package com.backend.qu2data.controller;

import com.backend.qu2data.entites.Project;
import com.backend.qu2data.entites.Task;
import com.backend.qu2data.entites.TaskCreationDto;
import com.backend.qu2data.entites.TaskDTO;
import com.backend.qu2data.entites.Users;
import com.backend.qu2data.repository.TaskRepository;
import com.backend.qu2data.repository.UsersRepository;
import com.backend.qu2data.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
	   @Autowired
	    private TaskService taskService;

	   @PostMapping
	   public ResponseEntity<?> createTask(@RequestBody TaskCreationDto dto) {
	       try {
	           Task task = taskService.createTask(dto);
	           return ResponseEntity.status(201).body(task);
	       } catch (Exception e) {
	           return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
	       }
	   }
	

    // 🔹 Récupérer toutes les tâches (DTO)
    @GetMapping
  /* public List<TaskDTO> getAllTasks() {
        return taskService.getAllTasks();
    }
*/
    // 🔹 Récupérer une tâche par ID
  /*  @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Task>> getTasksByProject(@PathVariable Long projectId) {
        List<Task> tasks = taskService.getTasksByProject(projectId);
        return ResponseEntity.ok(tasks);
    }
*/
    // 🔹 Mettre à jour une tâche
    @RequestMapping(value = "/{id}", method = RequestMethod.PUT)
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody Task updatedTask) {
        Task task = taskService.updateTask(id, updatedTask);
        return ResponseEntity.ok(task);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        Task task = taskService.getTaskById(id);
        return ResponseEntity.ok(task);
    }

    // 🔹 Supprimer une tâche
    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
    }
}
