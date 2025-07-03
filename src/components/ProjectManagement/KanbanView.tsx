import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Paper, Text, Group, Badge, Avatar, ActionIcon, Box, Title, Button } from '@mantine/core';
import { IconPlus, IconClock, IconTag, IconUser, IconCalendar } from '@tabler/icons-react';
import { Task } from './ProjectPage';

// Extended Task interface with additional properties
interface ExtendedTask extends Task {
  assignees?: string[];
}

interface KanbanViewProps {
  tasks: ExtendedTask[];
  updateTask: (taskId: string, updatedTask: Partial<ExtendedTask>) => void;
  addTask: (task: Omit<ExtendedTask, 'id' | 'createdAt'>) => void;
}

interface Column {
  id: string;
  title: string;
  taskIds: string[];
  color: string;
}

// Define DropResult interface
interface DropResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  };
}

export default function KanbanView({ tasks, updateTask, addTask }: KanbanViewProps) {
  // Organiser les tâches par statut
  const initialColumns: { [key: string]: Column } = {
    'todo': {
      id: 'todo',
      title: 'À FAIRE',
      taskIds: tasks.filter(task => task.status === 'todo').map(task => task.id?.toString() || ''),
      color: '#f0f0f0'
    },
    'in-progress': {
      id: 'in-progress',
      title: 'EN COURS',
      taskIds: tasks.filter(task => task.status === 'in-progress').map(task => task.id?.toString() || ''),
      color: '#e0e7ff'
    },
    'done': {
      id: 'done',
      title: 'ACHEVÉ',
      taskIds: tasks.filter(task => task.status === 'done').map(task => task.id?.toString() || ''),
      color: '#d1fae5'
    }
  };

  const [columns, setColumns] = useState(initialColumns);

  // Fonction pour gérer le drag and drop
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Si pas de destination (drop en dehors d'une zone valide)
    if (!destination) return;

    // Si la source et la destination sont identiques
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Récupérer les colonnes source et destination
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];

    // Si on déplace dans la même colonne
    if (sourceColumn.id === destColumn.id) {
      const newTaskIds = Array.from(sourceColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...sourceColumn,
        taskIds: newTaskIds,
      };

      setColumns({
        ...columns,
        [newColumn.id]: newColumn,
      });
    } else {
      // Si on déplace vers une autre colonne
      const sourceTaskIds = Array.from(sourceColumn.taskIds);
      sourceTaskIds.splice(source.index, 1);

      const destTaskIds = Array.from(destColumn.taskIds);
      destTaskIds.splice(destination.index, 0, draggableId);

      const newSourceColumn = {
        ...sourceColumn,
        taskIds: sourceTaskIds,
      };

      const newDestColumn = {
        ...destColumn,
        taskIds: destTaskIds,
      };

      setColumns({
        ...columns,
        [sourceColumn.id]: newSourceColumn,
        [destColumn.id]: newDestColumn,
      });

      // Mettre à jour le statut de la tâche
      updateTask(draggableId, { status: destination.droppableId as 'todo' | 'in-progress' | 'done' });
    }
  };

  // Fonction pour obtenir la couleur de priorité
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  // Fonction pour ajouter une nouvelle tâche à une colonne
  const handleAddTask = (columnId: string) => {
    const newTask: Omit<ExtendedTask, 'id' | 'createdAt'> = {
      title: `Nouvelle tâche`,
      description: '',
      status: columnId as 'todo' | 'in-progress' | 'done',
      priority: '',
      assignees: [],
      tags: [],
      projectId: tasks[0]?.projectId || 0,
    };

    addTask(newTask);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Group align="flex-start" spacing="md" style={{ height: '100%' }} noWrap>
        {Object.values(columns).map(column => (
          <Box key={column.id} style={{ width: '33%', height: '100%' }}>
            <Paper
              shadow="xs"
              p="md"
              style={{
                backgroundColor: column.color,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '8px'
              }}
            >
              <Group position="apart" mb="md">
                <Title order={5}>{column.title} <Badge size="sm">{column.taskIds.length}</Badge></Title>
                <ActionIcon
                  variant="filled"
                  color="blue"
                  onClick={() => handleAddTask(column.id)}
                >
                  <IconPlus size={16} />
                </ActionIcon>
              </Group>

              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{
                      minHeight: '100px',
                      flexGrow: 1,
                      overflowY: 'auto'
                    }}
                  >
                    {column.taskIds.map((taskId, index) => {
                      const task = tasks.find(t => t.id?.toString() === taskId);
                      if (!task) return null;

                      return (
                        <Draggable key={taskId} draggableId={taskId} index={index}>
                          {(provided) => (
                            <Paper
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              ref={provided.innerRef}
                              shadow="sm"
                              p="md"
                              mb="sm"
                              style={{
                                ...provided.draggableProps.style,
                                backgroundColor: 'white',
                                borderRadius: '6px'
                              }}
                            >
                              <Text weight={500} mb={5}>{task.title}</Text>
                              <Text size="sm" color="dimmed" lineClamp={2} mb={10}>
                                {task.description || 'Aucune description'}
                              </Text>

                              <Group position="apart" mt="xs">
                                {task.priority && (
                                  <Badge color={getPriorityColor(task.priority)} variant="filled" size="sm">
                                    {task.priority}
                                  </Badge>
                                )}

                                {task.tags.length > 0 && (
                                  <Group spacing={5}>
                                    <IconTag size={14} />
                                    {task.tags.slice(0, 2).map(tag => (
                                      <Badge key={tag} size="xs" variant="outline">{tag}</Badge>
                                    ))}
                                    {task.tags.length > 2 && <Badge size="xs">+{task.tags.length - 2}</Badge>}
                                  </Group>
                                )}
                              </Group>

                              <Group position="apart" mt="xs">
                                {task.dueDate && (
                                  <Group spacing={5}>
                                    <IconCalendar size={14} />
                                    <Text size="xs">
                                      {new Date(task.dueDate).toLocaleDateString()}
                                    </Text>
                                  </Group>
                                )}

                                {task.estimatedTime && (
                                  <Group spacing={5}>
                                    <IconClock size={14} />
                                    <Text size="xs">{task.estimatedTime}h</Text>
                                  </Group>
                                )}
                              </Group>

                              {task.assignees.length > 0 && (
                                <Group position="left" mt="xs">
                                  <IconUser size={14} />
                                  <Avatar.Group spacing="sm">
                                    {task.assignees.map((assignee, i) => (
                                      <Avatar key={i} size="sm" radius="xl" color="blue">{assignee.charAt(0).toUpperCase()}</Avatar>
                                    ))}
                                  </Avatar.Group>
                                </Group>
                              )}
                            </Paper>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}

                    {column.taskIds.length === 0 && (
                      <Button
                        variant="subtle"
                        fullWidth
                        leftIcon={<IconPlus size={16} />}
                        onClick={() => handleAddTask(column.id)}
                      >
                        Ajouter Tâche
                      </Button>
                    )}
                  </div>
                )}
              </Droppable>
            </Paper>
          </Box>
        ))}
      </Group>
    </DragDropContext>
  );
}
