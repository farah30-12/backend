package com.backend.qu2data.service;


import org.keycloak.representations.account.UserRepresentation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import com.backend.qu2data.entites.Project;
import com.backend.qu2data.entites.Task;
import com.backend.qu2data.entites.TaskCreationDto;
import com.backend.qu2data.entites.TaskCreationResponseDto;
import com.backend.qu2data.entites.TaskDTO;
import com.backend.qu2data.entites.Users;
import com.backend.qu2data.repository.ProjectRepository;
import com.backend.qu2data.repository.TaskRepository;
import com.backend.qu2data.repository.UsersRepository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class TaskService {

	  @Autowired
	    private TaskRepository taskRepository;

	    @Autowired
	    private UsersRepository usersRepository;

	    @Autowired
	    private ProjectRepository projectRepository;
	  

	    public TaskCreationResponseDto createTaskAndReturnDto(TaskCreationDto dto) {
	        Task task = createTask(dto); // utilise ta méthode existante
	        return new TaskCreationResponseDto(task);
	    }

	    public Task createTask(TaskCreationDto dto) {
	        Task task = new Task();

	        task.setTitle(dto.getTitle());
	        task.setDescription(dto.getDescription());
	        task.setStatus(dto.getStatus());
	        task.setPriority(dto.getPriority());

	        // ✅ Conversion des dates String -> LocalDate
	        if (dto.getStartDate() != null)
	            task.setStartDate(LocalDate.parse(dto.getStartDate()));
	        if (dto.getEndDate() != null)
	            task.setEndDate(LocalDate.parse(dto.getEndDate()));

	        // ✅ Récupérer le créateur (obligatoire)
	        Users createdBy = usersRepository.findById(dto.getCreatedById())
	                .orElseThrow(() -> new RuntimeException("Créateur introuvable"));
	        task.setCreatedBy(createdBy);

	        // ✅ Récupérer l'utilisateur assigné (si fourni)
	        if (dto.getAssignedUserId() != null) {
	            Users assigned = usersRepository.findById(dto.getAssignedUserId())
	                    .orElseThrow(() -> new RuntimeException("Utilisateur assigné introuvable"));
	            task.setAssignedTo(assigned);
	        }

	        // ✅ Récupérer le projet (si fourni)
	        if (dto.getProjectId() != null) {
	            Project project = projectRepository.findById(dto.getProjectId())
	                    .orElseThrow(() -> new RuntimeException("Projet introuvable"));
	            task.setProject(project);
	        }

	        // ✅ Définir tâche personnelle si aucun assignedUser
	        task.setIsPersonalTodo(dto.getAssignedUserId() == null);

	        return taskRepository.save(task);
	    }
	

    public Task getTaskById(Long id) {
        return taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Tâche non trouvée"));
    }

    public List<Task> getTasksByUser(Users user) {
        return taskRepository.findByCreatedBy(user);
    }

    public List<Task> getPersonalTasksByUser(Users user) {
        return taskRepository.findByCreatedByAndIsPersonalTodoTrue(user);
    }
    public List<Task> getTasksByProject(Long projectId) {
        return taskRepository.findByProjectId(projectId);
    }

 /*   public List<TaskDTO> getAllTasks() {
        List<Task> tasks = taskRepository.findAll();
        List<TaskDTO> taskDTOs = new ArrayList<>();

        for (Task task : tasks) {
            String createdByName = "";
            String assignedToName = "";

            if (task.getCreatedBy() != null) {
                Users createdBy = task.getCreatedBy();
                createdByName = createdBy.getFirstName() + " " + createdBy.getLastName();
            }

            if (task.getAssignedTo() != null) {
                Users assignedTo = task.getAssignedTo();
                assignedToName = assignedTo.getFirstName() + " " + assignedTo.getLastName();
            }

            taskDTOs.add(new TaskDTO(task, createdByName, assignedToName));
        }

        return taskDTOs;
    }
*/
    public Task updateTask(Long id, Task updatedTask) {
        Task task = getTaskById(id);

        task.setTitle(updatedTask.getTitle());
        task.setDescription(updatedTask.getDescription());
        task.setStartDate(updatedTask.getStartDate());
        task.setEndDate(updatedTask.getEndDate());
        task.setStatus(updatedTask.getStatus());
        task.setAssignedTo(updatedTask.getAssignedTo());
        task.setIsPersonalTodo(updatedTask.getIsPersonalTodo());

        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        Task task = getTaskById(id);
        taskRepository.delete(task);
    }
}
