import React, { useState } from 'react';
import {
  Box,
  Checkbox,
  Badge,
  Group,
  Text,
  ActionIcon,
  Menu,
  ScrollArea,
  Avatar,
  Paper,
  Tooltip,
  Divider,
  Button,
  Modal,
  TextInput,
  Select,
  Textarea,
  MultiSelect,
  Grid
} from '@mantine/core';
import {
  IconDots,
  IconPencil,
  IconTrash,
  IconCopy,
  IconArrowUp,
  IconArrowDown,
  IconCalendar,
  IconUser,
  IconTag,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconEye,
  IconCheck,
  IconClock,
  IconAlertCircle,
  IconStar,
  IconStarFilled,
  IconX,
  IconAlignLeft
} from '@tabler/icons-react';
import { Task } from 'pages/projects';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EnhancedListViewProps {
  tasks: Task[];
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
}

export default function EnhancedListView({ tasks, updateTask }: EnhancedListViewProps) {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<keyof Task>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: [] as string[],
    priority: [] as string[],
    tags: [] as string[]
  });

  // Fonction pour gérer la sélection d'une tâche
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Fonction pour gérer la sélection de toutes les tâches
  const toggleAllSelection = () => {
    if (selectedTasks.length === tasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasks.filter(task => task.id !== undefined).map(task => task.id.toString()));
    }
  };

  // Fonction pour trier les tâches
  const sortTasks = (a: Task, b: Task) => {
    if (sortBy === 'dueDate') {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }

    if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1, '': 0 };
      const priorityA = priorityOrder[a.priority] || 0;
      const priorityB = priorityOrder[b.priority] || 0;
      return sortDirection === 'asc' ? priorityA - priorityB : priorityB - priorityA;
    }

    if (sortBy === 'status') {
      const statusOrder = { todo: 1, 'in-progress': 2, done: 3 };
      const statusA = statusOrder[a.status] || 0;
      const statusB = statusOrder[b.status] || 0;
      return sortDirection === 'asc' ? statusA - statusB : statusB - statusA;
    }

    const valueA = a[sortBy] as string;
    const valueB = b[sortBy] as string;

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortDirection === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    return 0;
  };

  // Fonction pour changer le tri
  const handleSort = (column: keyof Task) => {
    if (sortBy === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
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

  // Fonction pour obtenir la couleur de statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'gray';
      case 'in-progress': return 'blue';
      case 'done': return 'green';
      default: return 'gray';
    }
  };

  // Fonction pour obtenir le texte du statut
  const getStatusText = (status: string) => {
    switch (status) {
      case 'todo': return 'À faire';
      case 'in-progress': return 'En cours';
      case 'done': return 'Terminé';
      default: return status;
    }
  };

  // Fonction pour obtenir l'icône du statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo': return <IconAlertCircle size={16} />;
      case 'in-progress': return <IconClock size={16} />;
      case 'done': return <IconCheck size={16} />;
      default: return null;
    }
  };

  // Fonction pour obtenir le texte de la priorité
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Élevée';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
      default: return 'Non définie';
    }
  };

  // Fonction pour obtenir l'icône de la priorité
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <IconStarFilled size={16} />;
      case 'medium': return <IconStar size={16} />;
      case 'low': return <IconStar size={16} style={{ opacity: 0.5 }} />;
      default: return null;
    }
  };

  // Fonction pour ouvrir le modal de détails d'une tâche
  const openTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setEditedTask({ ...task });
    setTaskDetailModalOpen(true);
    setEditMode(false);
  };

  // Fonction pour sauvegarder les modifications d'une tâche
  const saveTaskChanges = () => {
    if (selectedTask && selectedTask.id) {
      updateTask(selectedTask.id.toString(), editedTask);
      setSelectedTask({ ...selectedTask, ...editedTask });
      setEditMode(false);
    }
  };

  // Fonction pour filtrer les tâches
  const filterTasks = (task: Task) => {
    // Si aucun filtre n'est actif, retourner true
    if (filters.status.length === 0 && filters.priority.length === 0 && filters.tags.length === 0) {
      return true;
    }

    // Vérifier les filtres de statut
    const statusMatch = filters.status.length === 0 || filters.status.includes(task.status);

    // Vérifier les filtres de priorité
    const priorityMatch = filters.priority.length === 0 || filters.priority.includes(task.priority);

    // Vérifier les filtres de tags
    const tagsMatch = filters.tags.length === 0 ||
      (task.tags && task.tags.some(tag => filters.tags.includes(tag)));

    return statusMatch && priorityMatch && tagsMatch;
  };

  // Appliquer le tri et le filtrage aux tâches
  const filteredAndSortedTasks = [...tasks]
    .filter(filterTasks)
    .sort(sortTasks);

  // Collecter tous les tags uniques pour les filtres
  const allTags = tasks
    .flatMap(task => task.tags || [])
    .filter((value, index, self) => self.indexOf(value) === index);

  return (
    <Box>
      {/* Barre d'outils */}
      <Paper
        p="md"
        mb="xl"
        radius="lg"
        shadow="sm"
        style={{
          background: 'linear-gradient(to right, #f8f9fa, #e9ecef)',
          borderBottom: '1px solid #dee2e6',
          position: 'relative'
        }}
      >
        <Group position="apart">
          <Group>
            <Checkbox
              onChange={toggleAllSelection}
              checked={selectedTasks.length === tasks.length && tasks.length > 0}
              indeterminate={selectedTasks.length > 0 && selectedTasks.length < tasks.length}
              size="md"
              radius="sm"
              styles={{
                input: {
                  cursor: 'pointer',
                  borderColor: '#ced4da',
                  '&:checked': {
                    backgroundColor: '#4263eb',
                    borderColor: '#4263eb'
                  }
                }
              }}
            />
            <Text
              size="sm"
              weight={600}
              style={{
                color: selectedTasks.length > 0 ? '#4263eb' : '#6c757d',
                background: selectedTasks.length > 0 ? '#e7f5ff' : 'transparent',
                padding: selectedTasks.length > 0 ? '5px 10px' : '5px 0',
                borderRadius: '20px',
                transition: 'all 0.2s ease'
              }}
            >
              {selectedTasks.length > 0
                ? `${selectedTasks.length} tâche${selectedTasks.length > 1 ? 's' : ''} sélectionnée${selectedTasks.length > 1 ? 's' : ''}`
                : 'Sélectionner tout'}
            </Text>
          </Group>

          <Group spacing={10}>
            <Tooltip label="Filtrer les tâches" position="bottom" withArrow>
              <ActionIcon
                variant="light"
                color="indigo"
                onClick={() => setFilterModalOpen(true)}
                size="lg"
                radius="md"
                style={{
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  border: '1px solid #e9ecef',
                  transition: 'all 0.2s ease'
                }}
                sx={(theme) => ({
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    backgroundColor: theme.colors.indigo[0],
                    color: theme.colors.indigo[6]
                  }
                })}
              >
                <IconFilter size={20} />
              </ActionIcon>
            </Tooltip>

            <Menu position="bottom-end" shadow="md" width={200}>
              <Menu.Target>
                <Tooltip label="Trier les tâches" position="bottom" withArrow>
                  <ActionIcon
                    variant="light"
                    color="indigo"
                    size="lg"
                    radius="md"
                    style={{
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      border: '1px solid #e9ecef',
                      transition: 'all 0.2s ease'
                    }}
                    sx={(theme) => ({
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        backgroundColor: theme.colors.indigo[0],
                        color: theme.colors.indigo[6]
                      }
                    })}
                  >
                    {sortDirection === 'asc'
                      ? <IconSortAscending size={20} />
                      : <IconSortDescending size={20} />
                    }
                  </ActionIcon>
                </Tooltip>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#495057',
                  borderBottom: '1px solid #e9ecef',
                  padding: '10px 15px'
                }}>
                  Trier par
                </Menu.Label>
                <Menu.Item
                  icon={sortBy === 'title' && sortDirection === 'asc' ? <IconArrowUp size={16} color="#4263eb" /> :
                        sortBy === 'title' && sortDirection === 'desc' ? <IconArrowDown size={16} color="#4263eb" /> :
                        <div style={{ width: 16 }}></div>}
                  onClick={() => handleSort('title')}
                  styles={{
                    item: {
                      fontWeight: sortBy === 'title' ? 600 : 400,
                      color: sortBy === 'title' ? '#4263eb' : '#495057',
                      backgroundColor: sortBy === 'title' ? '#e7f5ff' : 'transparent',
                      '&:hover': {
                        backgroundColor: '#f1f3f5'
                      }
                    }
                  }}
                >
                  Titre
                </Menu.Item>
                <Menu.Item
                  icon={sortBy === 'status' && sortDirection === 'asc' ? <IconArrowUp size={16} color="#4263eb" /> :
                        sortBy === 'status' && sortDirection === 'desc' ? <IconArrowDown size={16} color="#4263eb" /> :
                        <div style={{ width: 16 }}></div>}
                  onClick={() => handleSort('status')}
                  styles={{
                    item: {
                      fontWeight: sortBy === 'status' ? 600 : 400,
                      color: sortBy === 'status' ? '#4263eb' : '#495057',
                      backgroundColor: sortBy === 'status' ? '#e7f5ff' : 'transparent',
                      '&:hover': {
                        backgroundColor: '#f1f3f5'
                      }
                    }
                  }}
                >
                  Statut
                </Menu.Item>
                <Menu.Item
                  icon={sortBy === 'priority' && sortDirection === 'asc' ? <IconArrowUp size={16} color="#4263eb" /> :
                        sortBy === 'priority' && sortDirection === 'desc' ? <IconArrowDown size={16} color="#4263eb" /> :
                        <div style={{ width: 16 }}></div>}
                  onClick={() => handleSort('priority')}
                  styles={{
                    item: {
                      fontWeight: sortBy === 'priority' ? 600 : 400,
                      color: sortBy === 'priority' ? '#4263eb' : '#495057',
                      backgroundColor: sortBy === 'priority' ? '#e7f5ff' : 'transparent',
                      '&:hover': {
                        backgroundColor: '#f1f3f5'
                      }
                    }
                  }}
                >
                  Priorité
                </Menu.Item>
                <Menu.Item
                  icon={sortBy === 'dueDate' && sortDirection === 'asc' ? <IconArrowUp size={16} color="#4263eb" /> :
                        sortBy === 'dueDate' && sortDirection === 'desc' ? <IconArrowDown size={16} color="#4263eb" /> :
                        <div style={{ width: 16 }}></div>}
                  onClick={() => handleSort('dueDate')}
                  styles={{
                    item: {
                      fontWeight: sortBy === 'dueDate' ? 600 : 400,
                      color: sortBy === 'dueDate' ? '#4263eb' : '#495057',
                      backgroundColor: sortBy === 'dueDate' ? '#e7f5ff' : 'transparent',
                      '&:hover': {
                        backgroundColor: '#f1f3f5'
                      }
                    }
                  }}
                >
                  Échéance
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Paper>

      {/* Liste des tâches */}
      <ScrollArea style={{ height: 'calc(100vh - 250px)' }}>
        {filteredAndSortedTasks.length === 0 ? (
          <Paper p="xl" radius="md" style={{ textAlign: 'center', backgroundColor: '#f9fafb' }}>
            <IconFilter size={48} style={{ color: '#adb5bd', marginBottom: 10 }} />
            <Text size="lg" weight={500} color="dimmed">Aucune tâche trouvée</Text>
            <Text size="sm" color="dimmed" mt={5}>Essayez de modifier vos filtres ou d'ajouter de nouvelles tâches</Text>
          </Paper>
        ) : (
          <Box>
            {filteredAndSortedTasks.map((task) => (
              <Paper
                key={task.id}
                p="md"
                radius="lg"
                mb="md"
                shadow="sm"
                className="task-card"
                style={{
                  borderLeft: `4px solid ${getStatusColor(task.status)}`,
                  cursor: 'pointer',
                  backgroundColor: task.id && selectedTasks.includes(task.id.toString()) ? '#f8f9fa' : 'white',
                  transition: 'all 0.2s ease',
                  transform: task.id && selectedTasks.includes(task.id.toString()) ? 'translateX(5px)' : 'none',
                  boxShadow: task.id && selectedTasks.includes(task.id.toString())
                    ? '0 4px 12px rgba(0, 0, 0, 0.08)'
                    : '0 1px 3px rgba(0, 0, 0, 0.05)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => openTaskDetails(task)}
                sx={(theme) => ({
                  '&:hover': {
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                    transform: 'translateY(-2px)',
                  }
                })}
              >
                {/* Indicateur de statut coloré */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100px',
                  height: '100px',
                  background: `linear-gradient(135deg, transparent 70%, ${getStatusColor(task.status)}30 70%)`,
                  zIndex: 0
                }} />

                <Group position="apart" noWrap style={{ position: 'relative', zIndex: 1 }}>
                  <Group noWrap style={{ flex: 1 }}>
                    <Checkbox
                      checked={task.id ? selectedTasks.includes(task.id.toString()) : false}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (task.id) {
                          toggleTaskSelection(task.id.toString());
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      size="md"
                      radius="sm"
                      styles={{
                        input: { cursor: 'pointer' }
                      }}
                    />

                    <Box style={{ flex: 1 }}>
                      <Group position="apart" mb={10}>
                        <Text weight={700} size="lg" style={{
                          color: '#2c3e50',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                        }}>
                          {task.title}
                        </Text>
                        <Group spacing={10}>
                          <Badge
                            color={getStatusColor(task.status)}
                            variant="filled"
                            size="md"
                            radius="md"
                            leftSection={getStatusIcon(task.status)}
                            className={`badge-status status-${task.status}`}
                            styles={{
                              root: {
                                textTransform: 'none',
                                padding: '0 10px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                              }
                            }}
                          >
                            {getStatusText(task.status)}
                          </Badge>

                          {task.priority && (
                            <Badge
                              color={getPriorityColor(task.priority)}
                              variant="light"
                              size="md"
                              radius="md"
                              leftSection={getPriorityIcon(task.priority)}
                              className={`badge-priority priority-${task.priority}`}
                              styles={{
                                root: {
                                  textTransform: 'none',
                                  padding: '0 10px',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }
                              }}
                            >
                              {getPriorityText(task.priority)}
                            </Badge>
                          )}
                        </Group>
                      </Group>

                      <Paper
                        p="xs"
                        radius="md"
                        style={{
                          backgroundColor: '#f8f9fa',
                          marginBottom: '15px',
                          border: '1px solid #e9ecef'
                        }}
                      >
                        <Text size="sm" color="#495057" lineClamp={2} style={{ fontStyle: 'italic' }}>
                          {task.description || 'Aucune description'}
                        </Text>
                      </Paper>

                      <Group position="apart">
                        <Group spacing={15}>
                          {task.dueDate && (
                            <Group spacing={8} style={{
                              backgroundColor: '#e9ecef',
                              padding: '5px 10px',
                              borderRadius: '20px'
                            }}>
                              <IconCalendar size={16} color="#495057" />
                              <Text size="sm" weight={500} color="#495057">
                                {format(new Date(task.dueDate), 'dd MMM yyyy', { locale: fr })}
                              </Text>
                            </Group>
                          )}

                          {task.assignedTo && (
                            <Group spacing={8} style={{
                              backgroundColor: '#e7f5ff',
                              padding: '5px 10px',
                              borderRadius: '20px'
                            }}>
                              <Avatar size="sm" radius="xl" color="blue">
                                {task.assignedTo.id.toString().charAt(0)}
                              </Avatar>
                              <Text size="sm" weight={500} color="#1c7ed6">
                                Assigné #{task.assignedTo.id}
                              </Text>
                            </Group>
                          )}
                        </Group>

                        {task.tags && task.tags.length > 0 && (
                          <Group spacing={5}>
                            {task.tags.slice(0, 3).map(tag => (
                              <Badge
                                key={tag}
                                size="sm"
                                variant="dot"
                                color="indigo"
                                className="tag-badge"
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
                            {task.tags.length > 3 && (
                              <Badge
                                size="sm"
                                variant="filled"
                                color="gray"
                                className="tag-badge"
                                radius="xl"
                              >
                                +{task.tags.length - 3}
                              </Badge>
                            )}
                          </Group>
                        )}
                      </Group>
                    </Box>
                  </Group>

                  <Menu position="bottom-end" shadow="md">
                    <Menu.Target>
                      <ActionIcon
                        onClick={(e) => e.stopPropagation()}
                        variant="light"
                        color="gray"
                        radius="xl"
                        size="lg"
                        style={{
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                        sx={(theme) => ({
                          '&:hover': {
                            backgroundColor: theme.colors.blue[0],
                            color: theme.colors.blue[6]
                          }
                        })}
                      >
                        <IconDots size={18} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        icon={<IconEye size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          openTaskDetails(task);
                        }}
                      >
                        Voir les détails
                      </Menu.Item>
                      <Menu.Item
                        icon={<IconPencil size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTask(task);
                          setEditedTask({ ...task });
                          setTaskDetailModalOpen(true);
                          setEditMode(true);
                        }}
                      >
                        Modifier
                      </Menu.Item>
                      <Menu.Item
                        icon={<IconCopy size={16} />}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Dupliquer
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item
                        color="red"
                        icon={<IconTrash size={16} />}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Supprimer
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Paper>
            ))}
          </Box>
        )}
      </ScrollArea>

      {/* Modal de détails de tâche */}
      <Modal
        opened={taskDetailModalOpen}
        onClose={() => setTaskDetailModalOpen(false)}
        title={
          <Group spacing={10}>
            {editMode ? (
              <IconPencil size={24} color="#4263eb" />
            ) : (
              <IconEye size={24} color="#4263eb" />
            )}
            <Text size="lg" weight={700} style={{ color: '#2c3e50' }}>
              {editMode ? 'Modifier la tâche' : 'Détails de la tâche'}
            </Text>
          </Group>
        }
        size="lg"
        radius="lg"
        shadow="xl"
        padding="xl"
        styles={{
          header: {
            borderBottom: '1px solid #e9ecef',
            paddingBottom: 15,
            marginBottom: 15
          },
          title: { width: '100%' },
          body: { padding: '0 20px 20px' }
        }}
      >
        {selectedTask && (
          <Box>
            {editMode ? (
              <Box>
                <TextInput
                  label={
                    <Text weight={600} size="sm" mb={5}>Titre de la tâche</Text>
                  }
                  placeholder="Entrez le titre de la tâche"
                  value={editedTask.title || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  required
                  mb="md"
                  size="md"
                  radius="md"
                  styles={{
                    input: {
                      borderColor: '#ced4da',
                      '&:focus': {
                        borderColor: '#4263eb'
                      }
                    }
                  }}
                />

                <Textarea
                  label={
                    <Text weight={600} size="sm" mb={5}>Description</Text>
                  }
                  placeholder="Décrivez la tâche en détail"
                  value={editedTask.description || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  minRows={4}
                  mb="xl"
                  size="md"
                  radius="md"
                  styles={{
                    input: {
                      borderColor: '#ced4da',
                      '&:focus': {
                        borderColor: '#4263eb'
                      }
                    }
                  }}
                />

                <Grid mb="xl" gutter="xl">
                  <Grid.Col span={6}>
                    <Select
                      label={
                        <Group spacing={5}>
                          <div style={{
                            width: 10,
                            height: 10,
                            backgroundColor: getStatusColor(editedTask.status || 'todo'),
                            borderRadius: '50%'
                          }}></div>
                          <Text weight={600} size="sm">Statut</Text>
                        </Group>
                      }
                      placeholder="Sélectionner un statut"
                      value={editedTask.status || ''}
                      onChange={(value) => setEditedTask({ ...editedTask, status: value as 'todo' | 'in-progress' | 'done' })}
                      data={[
                        { value: 'todo', label: 'À faire' },
                        { value: 'in-progress', label: 'En cours' },
                        { value: 'done', label: 'Terminé' }
                      ]}
                      size="md"
                      radius="md"
                      styles={{
                        input: {
                          borderColor: '#ced4da',
                          '&:focus': {
                            borderColor: getStatusColor(editedTask.status || 'todo')
                          }
                        },
                        item: {
                          '&[data-selected]': {
                            backgroundColor: '#e7f5ff',
                            color: '#4263eb'
                          }
                        }
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Select
                      label={
                        <Group spacing={5}>
                          <div style={{
                            width: 10,
                            height: 10,
                            backgroundColor: getPriorityColor(editedTask.priority || ''),
                            borderRadius: '50%'
                          }}></div>
                          <Text weight={600} size="sm">Priorité</Text>
                        </Group>
                      }
                      placeholder="Sélectionner une priorité"
                      value={editedTask.priority || ''}
                      onChange={(value) => setEditedTask({ ...editedTask, priority: value as 'low' | 'medium' | 'high' | '' })}
                      data={[
                        { value: '', label: 'Non définie' },
                        { value: 'low', label: 'Basse' },
                        { value: 'medium', label: 'Moyenne' },
                        { value: 'high', label: 'Élevée' }
                      ]}
                      size="md"
                      radius="md"
                      styles={{
                        input: {
                          borderColor: '#ced4da',
                          '&:focus': {
                            borderColor: getPriorityColor(editedTask.priority || '')
                          }
                        },
                        item: {
                          '&[data-selected]': {
                            backgroundColor: '#fff4e6',
                            color: '#fd7e14'
                          }
                        }
                      }}
                    />
                  </Grid.Col>
                </Grid>

                <MultiSelect
                  label={
                    <Group spacing={5}>
                      <IconTag size={14} color="#5c7cfa" />
                      <Text weight={600} size="sm">Tags</Text>
                    </Group>
                  }
                  placeholder="Ajouter des tags"
                  value={editedTask.tags || []}
                  onChange={(value) => setEditedTask({ ...editedTask, tags: value })}
                  data={allTags.map(tag => ({ value: tag, label: tag }))}
                  searchable
                  creatable
                  getCreateLabel={(query) => `+ Créer "${query}"`}
                  mb="xl"
                  size="md"
                  radius="md"
                  styles={{
                    input: {
                      borderColor: '#ced4da',
                      '&:focus': {
                        borderColor: '#5c7cfa'
                      }
                    },
                    item: {
                      '&[data-selected]': {
                        backgroundColor: '#edf2ff',
                        color: '#5c7cfa'
                      }
                    }
                  }}
                />

                <Divider my="xl" />

                <Group position="right" mt="xl">
                  <Button
                    variant="outline"
                    color="gray"
                    onClick={() => setEditMode(false)}
                    radius="md"
                    size="md"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={saveTaskChanges}
                    color="indigo"
                    radius="md"
                    size="md"
                    leftIcon={<IconCheck size={16} />}
                    styles={{
                      root: {
                        boxShadow: '0 4px 6px rgba(66, 99, 235, 0.2)',
                        '&:hover': {
                          boxShadow: '0 5px 8px rgba(66, 99, 235, 0.3)',
                          transform: 'translateY(-2px)'
                        }
                      }
                    }}
                  >
                    Enregistrer les modifications
                  </Button>
                </Group>
              </Box>
            ) : (
              <Box>
                <Paper
                  p="lg"
                  radius="md"
                  mb="xl"
                  style={{
                    borderLeft: `4px solid ${getStatusColor(selectedTask.status)}`,
                    backgroundColor: '#f8f9fa'
                  }}
                >
                  <Text weight={700} size="xl" style={{ color: '#2c3e50' }}>
                    {selectedTask.title}
                  </Text>
                </Paper>

                <Group mb={30} position="apart">
                  <Group>
                    <Badge
                      color={getStatusColor(selectedTask.status)}
                      variant="filled"
                      size="lg"
                      radius="md"
                      leftSection={getStatusIcon(selectedTask.status)}
                      styles={{
                        root: {
                          textTransform: 'none',
                          padding: '0 15px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }
                      }}
                    >
                      {getStatusText(selectedTask.status)}
                    </Badge>

                    {selectedTask.priority && (
                      <Badge
                        color={getPriorityColor(selectedTask.priority)}
                        variant="light"
                        size="lg"
                        radius="md"
                        leftSection={getPriorityIcon(selectedTask.priority)}
                        styles={{
                          root: {
                            textTransform: 'none',
                            padding: '0 15px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                          }
                        }}
                      >
                        {getPriorityText(selectedTask.priority)}
                      </Badge>
                    )}
                  </Group>

                  <Text size="sm" color="dimmed" style={{ fontStyle: 'italic' }}>
                    Créée le {format(new Date(selectedTask.createdAt || new Date()), 'dd MMMM yyyy', { locale: fr })}
                  </Text>
                </Group>

                <Paper
                  p="lg"
                  radius="md"
                  mb={30}
                  style={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef'
                  }}
                >
                  <Text weight={600} size="md" mb={10} color="#495057">
                    <IconAlignLeft size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Description
                  </Text>
                  <Text style={{ lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {selectedTask.description || 'Aucune description fournie pour cette tâche.'}
                  </Text>
                </Paper>

                <Grid mb={30} gutter="xl">
                  <Grid.Col span={6}>
                    <Paper
                      p="md"
                      radius="md"
                      style={{
                        backgroundColor: '#e7f5ff',
                        border: '1px solid #d0ebff'
                      }}
                    >
                      <Text weight={600} size="sm" mb={10} color="#1c7ed6">
                        <IconCalendar size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                        Date d'échéance
                      </Text>
                      <Text size="md" color="#1c7ed6" weight={500}>
                        {selectedTask.dueDate
                          ? format(new Date(selectedTask.dueDate), 'dd MMMM yyyy', { locale: fr })
                          : 'Non définie'
                        }
                      </Text>
                    </Paper>
                  </Grid.Col>

                  <Grid.Col span={6}>
                    <Paper
                      p="md"
                      radius="md"
                      style={{
                        backgroundColor: '#edf2ff',
                        border: '1px solid #dbe4ff'
                      }}
                    >
                      <Text weight={600} size="sm" mb={10} color="#4263eb">
                        <IconUser size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                        Assigné à
                      </Text>
                      {selectedTask.assignedTo ? (
                        <Group>
                          <Avatar size="md" radius="xl" color="blue">
                            {selectedTask.assignedTo.id.toString().charAt(0)}
                          </Avatar>
                          <div>
                            <Text size="md" color="#4263eb" weight={500}>
                              Utilisateur #{selectedTask.assignedTo.id}
                            </Text>
                          </div>
                        </Group>
                      ) : (
                        <Text color="#4c6ef5" style={{ fontStyle: 'italic' }}>
                          Cette tâche n'est assignée à personne
                        </Text>
                      )}
                    </Paper>
                  </Grid.Col>
                </Grid>

                {selectedTask.tags && selectedTask.tags.length > 0 && (
                  <Paper
                    p="md"
                    radius="md"
                    mb={30}
                    style={{
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #e9ecef'
                    }}
                  >
                    <Text weight={600} size="sm" mb={10} color="#495057">
                      <IconTag size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                      Tags
                    </Text>
                    <Group>
                      {selectedTask.tags.map(tag => (
                        <Badge
                          key={tag}
                          size="md"
                          variant="dot"
                          color="indigo"
                          radius="md"
                          styles={{
                            root: {
                              textTransform: 'none',
                              padding: '0 10px',
                              fontWeight: 500
                            }
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </Group>
                  </Paper>
                )}

                <Divider my={30} />

                <Group position="right">
                  <Button
                    variant="outline"
                    color="gray"
                    onClick={() => setTaskDetailModalOpen(false)}
                    radius="md"
                    size="md"
                    leftIcon={<IconX size={16} />}
                  >
                    Fermer
                  </Button>
                  <Button
                    onClick={() => setEditMode(true)}
                    color="indigo"
                    radius="md"
                    size="md"
                    leftIcon={<IconPencil size={16} />}
                    styles={{
                      root: {
                        boxShadow: '0 4px 6px rgba(66, 99, 235, 0.2)',
                        '&:hover': {
                          boxShadow: '0 5px 8px rgba(66, 99, 235, 0.3)',
                          transform: 'translateY(-2px)'
                        }
                      }
                    }}
                  >
                    Modifier cette tâche
                  </Button>
                </Group>
              </Box>
            )}
          </Box>
        )}
      </Modal>

      {/* Modal de filtres */}
      <Modal
        opened={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        title={
          <Group spacing={10}>
            <IconFilter size={24} color="#4263eb" />
            <Text size="lg" weight={700} style={{ color: '#2c3e50' }}>
              Filtrer les tâches
            </Text>
          </Group>
        }
        size="md"
        radius="lg"
        shadow="xl"
        padding="xl"
        styles={{
          header: {
            borderBottom: '1px solid #e9ecef',
            paddingBottom: 15,
            marginBottom: 15
          },
          title: { width: '100%' },
          body: { padding: '0 20px 20px' }
        }}
      >
        <Box>
          <Paper
            p="md"
            radius="md"
            mb="md"
            style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef'
            }}
          >
            <Text size="sm" color="#6c757d" mb={10}>
              Sélectionnez les critères pour filtrer votre liste de tâches. Vous pouvez combiner plusieurs filtres.
            </Text>
            <Text size="xs" color="#adb5bd">
              {Object.values(filters).flat().length > 0
                ? `${Object.values(filters).flat().length} filtre(s) actif(s)`
                : 'Aucun filtre actif'}
            </Text>
          </Paper>

          <MultiSelect
            label={
              <Group spacing={5}>
                <div style={{
                  width: 12,
                  height: 12,
                  backgroundColor: '#4263eb',
                  borderRadius: '50%'
                }}></div>
                <Text weight={600} size="sm">Statut</Text>
              </Group>
            }
            placeholder="Sélectionner un ou plusieurs statuts"
            data={[
              { value: 'todo', label: 'À faire', group: 'Statuts' },
              { value: 'in-progress', label: 'En cours', group: 'Statuts' },
              { value: 'done', label: 'Terminé', group: 'Statuts' }
            ]}
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
            mb="md"
            searchable
            clearable
            styles={{
              label: { marginBottom: 8 },
              input: {
                borderColor: filters.status.length > 0 ? '#4263eb' : '#ced4da',
                '&:focus': {
                  borderColor: '#4263eb'
                }
              },
              item: {
                '&[data-selected]': {
                  backgroundColor: '#e7f5ff',
                  color: '#4263eb',
                  '&:hover': {
                    backgroundColor: '#dbeafe'
                  }
                }
              }
            }}
          />

          <MultiSelect
            label={
              <Group spacing={5}>
                <div style={{
                  width: 12,
                  height: 12,
                  backgroundColor: '#fd7e14',
                  borderRadius: '50%'
                }}></div>
                <Text weight={600} size="sm">Priorité</Text>
              </Group>
            }
            placeholder="Sélectionner une ou plusieurs priorités"
            data={[
              { value: 'high', label: 'Élevée', group: 'Priorités' },
              { value: 'medium', label: 'Moyenne', group: 'Priorités' },
              { value: 'low', label: 'Basse', group: 'Priorités' },
              { value: '', label: 'Non définie', group: 'Priorités' }
            ]}
            value={filters.priority}
            onChange={(value) => setFilters({ ...filters, priority: value })}
            mb="md"
            searchable
            clearable
            styles={{
              label: { marginBottom: 8 },
              input: {
                borderColor: filters.priority.length > 0 ? '#fd7e14' : '#ced4da',
                '&:focus': {
                  borderColor: '#fd7e14'
                }
              },
              item: {
                '&[data-selected]': {
                  backgroundColor: '#fff4e6',
                  color: '#fd7e14',
                  '&:hover': {
                    backgroundColor: '#ffe8cc'
                  }
                }
              }
            }}
          />

          <MultiSelect
            label={
              <Group spacing={5}>
                <div style={{
                  width: 12,
                  height: 12,
                  backgroundColor: '#5c7cfa',
                  borderRadius: '50%'
                }}></div>
                <Text weight={600} size="sm">Tags</Text>
              </Group>
            }
            placeholder="Sélectionner un ou plusieurs tags"
            data={allTags.map(tag => ({ value: tag, label: tag, group: 'Tags' }))}
            value={filters.tags}
            onChange={(value) => setFilters({ ...filters, tags: value })}
            searchable
            clearable
            mb="md"
            styles={{
              label: { marginBottom: 8 },
              input: {
                borderColor: filters.tags.length > 0 ? '#5c7cfa' : '#ced4da',
                '&:focus': {
                  borderColor: '#5c7cfa'
                }
              },
              item: {
                '&[data-selected]': {
                  backgroundColor: '#edf2ff',
                  color: '#5c7cfa',
                  '&:hover': {
                    backgroundColor: '#dbe4ff'
                  }
                }
              }
            }}
          />

          <Divider my="md" />

          <Group position="apart" mt="xl">
            <Button
              variant="subtle"
              color="gray"
              leftIcon={<IconFilter size={16} stroke={1.5} />}
              onClick={() => setFilters({ status: [], priority: [], tags: [] })}
              styles={{
                root: {
                  '&:hover': {
                    backgroundColor: '#f1f3f5'
                  }
                }
              }}
            >
              Réinitialiser les filtres
            </Button>
            <Button
              onClick={() => setFilterModalOpen(false)}
              color="indigo"
              radius="md"
              size="md"
              styles={{
                root: {
                  boxShadow: '0 4px 6px rgba(66, 99, 235, 0.2)',
                  '&:hover': {
                    boxShadow: '0 5px 8px rgba(66, 99, 235, 0.3)',
                    transform: 'translateY(-2px)'
                  }
                }
              }}
            >
              Appliquer les filtres
            </Button>
          </Group>
        </Box>
      </Modal>
    </Box>
  );
}
