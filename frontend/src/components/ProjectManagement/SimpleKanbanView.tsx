import React, { useState } from 'react';
import { Paper, Text, Group, Badge, Avatar, ActionIcon, Box, Title, Button, Grid, Divider } from '@mantine/core';
import { IconPlus, IconClock, IconTag, IconUser, IconCalendar, IconEdit, IconTrash } from '@tabler/icons-react';
import TaskForm from './TaskForm';

// Interface Task complète
interface Task {
  id: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  projectId?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Extended Task interface with additional properties
interface ExtendedTask {
  id: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  projectId?: number;
  project?: { id: number };
  createdAt?: string;
  updatedAt?: string;
  assignees?: string[];
  tags?: string[];
  estimatedTime?: number;
  projectName?: string; // Ajout du nom du projet
  createdBy?: { id: number; firstName?: string; lastName?: string; };
  assignedTo?: { id: number; firstName?: string; lastName?: string; };
  isPersonalTodo?: boolean;
}

interface KanbanViewProps {
  tasks: ExtendedTask[];
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  deleteTask?: (taskId: string) => void;
  editTask?: (task: ExtendedTask) => void;
}

export default function SimpleKanbanView({ tasks, updateTask, addTask, deleteTask, editTask }: KanbanViewProps) {
  // État pour le formulaire de tâche
  const [taskFormOpened, setTaskFormOpened] = useState(false);
  const [taskInitialStatus, setTaskInitialStatus] = useState<'todo' | 'in-progress' | 'done'>('todo');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Afficher toutes les tâches, qu'elles soient associées à un projet ou non
  const filteredTasks = tasks;

  // Afficher les statuts des tâches pour le débogage
  console.log("Statuts des tâches:", filteredTasks.map(task => ({
    id: task.id,
    title: task.title,
    status: task.status,
    statusType: typeof task.status
  })));

  // Organiser les tâches par statut avec vérification stricte et non stricte
  console.log("Vérification des statuts de toutes les tâches:", filteredTasks.map(task => ({
    id: task.id,
    title: task.title,
    status: task.status,
    statusType: typeof task.status,
    statusEquals: {
      todo: task.status === 'todo',
      todoLoose: task.status?.toLowerCase?.() === 'todo',
      inProgress: task.status === 'in-progress',
      inProgressLoose: task.status?.toLowerCase?.() === 'in-progress',
      done: task.status === 'done',
      doneLoose: task.status?.toLowerCase?.() === 'done'
    }
  })));

  // Utiliser une comparaison plus souple pour les statuts
  const todoTasks = filteredTasks.filter(task =>
    task.status === 'todo' ||
    task.status?.toLowerCase?.() === 'todo' ||
    task.status?.toLowerCase?.() === 'à faire'
  );

  const inProgressTasks = filteredTasks.filter(task =>
    task.status === 'in-progress' ||
    task.status?.toLowerCase?.() === 'in-progress' ||
    task.status?.toLowerCase?.() === 'en cours'
  );

  const doneTasks = filteredTasks.filter(task =>
    task.status === 'done' ||
    task.status?.toLowerCase?.() === 'done' ||
    task.status?.toLowerCase?.() === 'terminée'
  );

  // Afficher le nombre de tâches par statut pour le débogage
  console.log("Nombre de tâches par statut:", {
    total: filteredTasks.length,
    todo: todoTasks.length,
    inProgress: inProgressTasks.length,
    done: doneTasks.length
  });

  // Regrouper les tâches par projet
  const groupTasksByProject = (taskList: ExtendedTask[]) => {
    // Créer un groupe pour chaque projet
    const groupedTasks: { [key: string]: ExtendedTask[] } = {};

    // Regrouper les tâches par projet
    taskList.forEach(task => {
      const projectId = task.projectId?.toString() || 'personal';
      if (!groupedTasks[projectId]) {
        groupedTasks[projectId] = [];
      }
      groupedTasks[projectId].push(task);
    });

    return groupedTasks;
  };

  // Tâches regroupées par projet pour chaque statut
  const todoTasksByProject = groupTasksByProject(todoTasks);
  const inProgressTasksByProject = groupTasksByProject(inProgressTasks);
  const doneTasksByProject = groupTasksByProject(doneTasks);

  // Fonction pour obtenir la couleur de priorité
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  // Fonction pour ouvrir le formulaire d'ajout de tâche
  const handleAddTask = (status: 'todo' | 'in-progress' | 'done') => {
    setTaskInitialStatus(status);
    setTaskFormOpened(true);
  };

  // Fonction pour gérer la soumission du formulaire de tâche
  const handleTaskSubmit = (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    console.log("Soumission du formulaire de tâche:", newTask);

    // S'assurer que le statut est correct
    if (newTask.status) {
      console.log("Statut avant soumission:", newTask.status);
    }

    addTask(newTask);
    setTaskFormOpened(false);
  };

  // Fonction pour changer le statut d'une tâche
  const handleChangeStatus = (taskId: number, newStatus: 'todo' | 'in-progress' | 'done') => {
    console.log(`Changement de statut de la tâche ${taskId} vers ${newStatus}`);
    console.log(`Type de taskId: ${typeof taskId}`);

    // Vérifier si l'ID est valide
    if (!taskId || isNaN(Number(taskId))) {
      console.error(`ID de tâche invalide: ${taskId}`);
      return;
    }

    // Afficher les IDs de toutes les tâches disponibles pour le débogage
    console.log("IDs des tâches disponibles:", tasks.map(t => `${t.id} (${typeof t.id})`));

    // Mapper les statuts internes aux statuts de l'API
    let apiStatus: string = newStatus;
    if (newStatus === 'todo') apiStatus = 'À faire';
    if (newStatus === 'in-progress') apiStatus = 'En cours';
    if (newStatus === 'done') apiStatus = 'Terminée';

    // Utiliser l'ID comme nombre pour s'assurer qu'il est correctement formaté
    const numericId = Number(taskId);
    console.log(`Envoi de la mise à jour avec ID: ${numericId} (${typeof numericId})`);

    updateTask(numericId.toString(), { status: apiStatus });
  };

  // État pour le glisser-déposer
  const [draggedTask, setDraggedTask] = useState<ExtendedTask | null>(null);

  // Fonctions pour le glisser-déposer
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: ExtendedTask) => {
    setDraggedTask(task);
    e.dataTransfer.setData('text/plain', task.id.toString());
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
    setDraggedTask(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.backgroundColor = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: 'todo' | 'in-progress' | 'done') => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '';

    if (draggedTask) {
      console.log(`Déplacement de la tâche ${draggedTask.id} vers la colonne ${status}`);
      console.log(`Type de draggedTask.id: ${typeof draggedTask.id}`);

      // Vérifier si l'ID est valide
      if (!draggedTask.id || isNaN(Number(draggedTask.id))) {
        console.error(`ID de tâche invalide: ${draggedTask.id}`);
        return;
      }

      // Utiliser l'ID comme nombre pour s'assurer qu'il est correctement formaté
      const numericId = Number(draggedTask.id);
      console.log(`Envoi de la mise à jour avec ID: ${numericId} (${typeof numericId})`);

      handleChangeStatus(numericId, status);
    }
  };

  // Rendu d'une carte de tâche
  const renderTaskCard = (task: ExtendedTask) => (
    <Paper
      key={task.id}
      shadow="sm"
      p="md"
      mb="sm"
      draggable
      onDragStart={(e) => handleDragStart(e, task)}
      onDragEnd={handleDragEnd}
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        borderLeft: `3px solid ${getPriorityColor(task.priority || 'low')}`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'grab'
      }}
      sx={() => ({
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }
      })}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' }}>
        <Text weight={600} size="md" style={{ color: '#2c3e50', flex: 1 }}>{task.title}</Text>

        <div style={{ display: 'flex', gap: '5px' }}>
          <ActionIcon
            size="xs"
            color="blue"
            variant="subtle"
            onClick={(e) => {
              e.stopPropagation();
              if (editTask) {
                editTask(task);
              } else {
                alert(`Fonction de modification non disponible pour la tâche: ${task.title}`);
              }
            }}
            title="Modifier"
          >
            <IconEdit size={14} />
          </ActionIcon>

          <ActionIcon
            size="xs"
            color="red"
            variant="subtle"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Êtes-vous sûr de vouloir supprimer la tâche "${task.title}" ?`)) {
                if (deleteTask && task.id) {
                  deleteTask(task.id.toString());
                } else {
                  alert(`Fonction de suppression non disponible pour la tâche: ${task.title}`);
                }
              }
            }}
            title="Supprimer"
          >
            <IconTrash size={14} />
          </ActionIcon>
        </div>
      </div>

      <Text size="sm" color="dimmed" lineClamp={2} mb={10} style={{ fontStyle: 'italic' }}>
        {task.description || 'Aucune description'}
      </Text>

      {/* Afficher le nom du projet dans la carte de tâche */}
      {task.projectName && (
        <Badge
          size="sm"
          variant="outline"
          color="indigo"
          mb={10}
          styles={{
            root: {
              textTransform: 'none',
              fontWeight: 500
            }
          }}
        >
          {task.projectName}
        </Badge>
      )}

      <Group position="apart" mt="xs">
        {task.priority && (
          <Badge
            color={getPriorityColor(task.priority)}
            variant="filled"
            size="sm"
            radius="md"
            styles={{
              root: {
                textTransform: 'none',
                padding: '3px 8px'
              }
            }}
          >
            {task.priority === 'high' ? 'Priorité élevée' :
             task.priority === 'medium' ? 'Priorité moyenne' : 'Priorité basse'}
          </Badge>
        )}

        {task.tags && task.tags.length > 0 && (
          <Group spacing={5}>
            <IconTag size={14} color="#5c7cfa" />
            {task.tags.slice(0, 2).map(tag => (
              <Badge
                key={tag}
                size="xs"
                variant="dot"
                color="indigo"
                styles={{
                  root: {
                    textTransform: 'none',
                    fontWeight: 500
                  }
                }}
              >
                {tag}
              </Badge>
            ))}
            {task.tags.length > 2 && (
              <Badge
                size="xs"
                variant="filled"
                color="gray"
                radius="xl"
              >
                +{task.tags.length - 2}
              </Badge>
            )}
          </Group>
        )}
      </Group>

      <Group position="apart" mt="xs">
        {task.dueDate && (
          <Group spacing={5} style={{
            backgroundColor: '#e9ecef',
            padding: '3px 8px',
            borderRadius: '12px'
          }}>
            <IconCalendar size={14} color="#495057" />
            <Text size="xs" weight={500} color="#495057">
              {new Date(task.dueDate).toLocaleDateString()}
            </Text>
          </Group>
        )}

        {task.estimatedTime && (
          <Group spacing={5} style={{
            backgroundColor: '#e9ecef',
            padding: '3px 8px',
            borderRadius: '12px'
          }}>
            <IconClock size={14} color="#495057" />
            <Text size="xs" weight={500} color="#495057">{task.estimatedTime}h</Text>
          </Group>
        )}
      </Group>

      {task.assignees && task.assignees.length > 0 && (
        <Group position="left" mt="xs">
          <IconUser size={14} color="#4263eb" />
          <Avatar.Group spacing="sm">
            {task.assignees.map((assignee, i) => (
              <Avatar key={i} size="sm" radius="xl" color="blue">{assignee.charAt(0).toUpperCase()}</Avatar>
            ))}
          </Avatar.Group>
        </Group>
      )}

      {/* Boutons pour changer le statut */}
      <Divider my="sm" variant="dashed" />
      <Group position="center" mt="xs" spacing="xs">
        <Button
          size="xs"
          variant={task.status === 'todo' ? 'filled' : 'outline'}
          color="red"
          onClick={() => handleChangeStatus(task.id, 'todo')}
          radius="md"
          compact
          style={{
            flex: 1,
            transition: 'all 0.2s ease',
            opacity: task.status === 'todo' ? 1 : 0.7,
            fontWeight: task.status === 'todo' ? 'bold' : 'normal'
          }}
          sx={{
            '&:hover': {
              transform: 'translateY(-2px)',
              opacity: 1
            }
          }}
        >
          À faire
        </Button>
        <Button
          size="xs"
          variant={task.status === 'in-progress' ? 'filled' : 'outline'}
          color="orange"
          onClick={() => handleChangeStatus(task.id, 'in-progress')}
          radius="md"
          compact
          style={{
            flex: 1,
            transition: 'all 0.2s ease',
            opacity: task.status === 'in-progress' ? 1 : 0.7,
            fontWeight: task.status === 'in-progress' ? 'bold' : 'normal'
          }}
          sx={{
            '&:hover': {
              transform: 'translateY(-2px)',
              opacity: 1
            }
          }}
        >
          En cours
        </Button>
        <Button
          size="xs"
          variant={task.status === 'done' ? 'filled' : 'outline'}
          color="green"
          onClick={() => handleChangeStatus(task.id, 'done')}
          radius="md"
          compact
          style={{
            flex: 1,
            transition: 'all 0.2s ease',
            opacity: task.status === 'done' ? 1 : 0.7,
            fontWeight: task.status === 'done' ? 'bold' : 'normal'
          }}
          sx={{
            '&:hover': {
              transform: 'translateY(-2px)',
              opacity: 1
            }
          }}
        >
          Terminé
        </Button>
      </Group>
    </Paper>
  );

  // Fonction pour rendre les tâches regroupées par projet
  const renderTasksByProject = (tasksByProject: { [key: string]: ExtendedTask[] }, status: 'todo' | 'in-progress' | 'done') => {
    return Object.entries(tasksByProject).map(([groupId, tasks]) => {
      // Obtenir le nom du projet à partir de la première tâche
      const projectName = tasks[0]?.projectName || (groupId === 'personal' ? 'Tâches personnelles' : `Projet #${groupId}`);

      return (
        <Box key={groupId} mb="lg">
          <Group position="apart" mb="sm">
            {/* Afficher le nom du projet */}
            <Text weight={600} size="sm" color="#495057">
              {projectName}
            </Text>

            <ActionIcon
              variant="light"
              color="blue"
              size="sm"
              radius="md"
              onClick={() => {
                setTaskInitialStatus(status);
                setSelectedProjectId(groupId !== 'personal' ? groupId : null);
                setTaskFormOpened(true);
              }}
              style={{
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease'
              }}
              sx={{
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 3px 5px rgba(0,0,0,0.1)'
                }
              }}
            >
              <IconPlus size={14} />
            </ActionIcon>
          </Group>
          {tasks.map(task => renderTaskCard(task))}
        </Box>
      );
    });
  };

  return (
    <>
      <TaskForm
        opened={taskFormOpened}
        onClose={() => setTaskFormOpened(false)}
        onSubmit={handleTaskSubmit}
        initialStatus={taskInitialStatus}
        projectId={selectedProjectId || tasks[0]?.projectId || 0}
      />

      <Grid columns={3} gutter="md" style={{ height: '100%' }}>
        <Grid.Col span={1}>
          <Paper
            shadow="xs"
            p="md"
            style={{
              backgroundColor: '#f0f0f0',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
            sx={{
              '&:hover': {
                boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.1)',
              }
            }}
          >
            <Group position="apart" mb="md">
              <Title order={5}>À FAIRE <Badge size="sm">{todoTasks.length}</Badge></Title>
              <ActionIcon
                variant="filled"
                color="blue"
                onClick={() => handleAddTask('todo')}
              >
                <IconPlus size={16} />
              </ActionIcon>
            </Group>

            <Box
              style={{ overflowY: 'auto', flexGrow: 1 }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'todo')}
            >
              {Object.keys(todoTasksByProject).length > 0 ? (
                renderTasksByProject(todoTasksByProject, 'todo')
              ) : (
                <Button
                  variant="subtle"
                  fullWidth
                  leftIcon={<IconPlus size={16} />}
                  onClick={() => handleAddTask('todo')}
                >
                  Ajouter Tâche
                </Button>
              )}
            </Box>
          </Paper>
        </Grid.Col>

        <Grid.Col span={1}>
          <Paper
            shadow="xs"
            p="md"
            style={{
              backgroundColor: '#e0e7ff',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
            sx={{
              '&:hover': {
                boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.1)',
              }
            }}
          >
            <Group position="apart" mb="md">
              <Title order={5}>EN COURS <Badge size="sm">{inProgressTasks.length}</Badge></Title>
              <ActionIcon
                variant="filled"
                color="blue"
                onClick={() => handleAddTask('in-progress')}
              >
                <IconPlus size={16} />
              </ActionIcon>
            </Group>

            <Box
              style={{ overflowY: 'auto', flexGrow: 1 }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'in-progress')}
            >
              {Object.keys(inProgressTasksByProject).length > 0 ? (
                renderTasksByProject(inProgressTasksByProject, 'in-progress')
              ) : (
                <Button
                  variant="subtle"
                  fullWidth
                  leftIcon={<IconPlus size={16} />}
                  onClick={() => handleAddTask('in-progress')}
                >
                  Ajouter Tâche
                </Button>
              )}
            </Box>
          </Paper>
        </Grid.Col>

        <Grid.Col span={1}>
          <Paper
            shadow="xs"
            p="md"
            style={{
              backgroundColor: '#d1fae5',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
            sx={{
              '&:hover': {
                boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.1)',
              }
            }}
          >
            <Group position="apart" mb="md">
              <Title order={5}>ACHEVÉ <Badge size="sm">{doneTasks.length}</Badge></Title>
              <ActionIcon
                variant="filled"
                color="blue"
                onClick={() => handleAddTask('done')}
              >
                <IconPlus size={16} />
              </ActionIcon>
            </Group>

            <Box
              style={{ overflowY: 'auto', flexGrow: 1 }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'done')}
            >
              {Object.keys(doneTasksByProject).length > 0 ? (
                renderTasksByProject(doneTasksByProject, 'done')
              ) : (
                <Button
                  variant="subtle"
                  fullWidth
                  leftIcon={<IconPlus size={16} />}
                  onClick={() => handleAddTask('done')}
                >
                  Ajouter Tâche
                </Button>
              )}
            </Box>
          </Paper>
        </Grid.Col>
      </Grid>
    </>
  );
}
