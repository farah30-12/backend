import React, { useState } from 'react';
import { Box, Paper, Group, Text, Select, Button, ActionIcon, Modal, TextInput, Textarea, Grid, Checkbox, Tooltip, Badge } from '@mantine/core';
import {
  IconZoomIn,
  IconZoomOut,
  IconRefresh,
  IconFilter,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconCircleDashed
} from '@tabler/icons-react';
import { Task } from './ProjectPage1';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import '../../styles/gantt-custom.css';

// Extended Task interface with the properties we need
interface ExtendedTask extends Task {
  startDate?: string;
  endDate?: string;
}

interface SimpleEnhancedGanttViewProps {
  tasks: ExtendedTask[];
  updateTask: (taskId: string, updatedTask: Partial<ExtendedTask>) => void;
}

export default function SimpleEnhancedGanttView({ tasks, updateTask }: SimpleEnhancedGanttViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [zoomLevel, setZoomLevel] = useState<'day' | 'week' | 'month'>('week');
  const [selectedTask, setSelectedTask] = useState<ExtendedTask | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<ExtendedTask>>({});

  // Générer les dates pour l'en-tête du diagramme
  const getDates = () => {
    let start, end;

    if (zoomLevel === 'day') {
      // Vue par jour: afficher 30 jours
      start = new Date(currentDate);
      end = new Date(currentDate);
      end.setDate(end.getDate() + 29);
    } else if (zoomLevel === 'week') {
      // Vue par semaine: afficher 12 semaines
      start = new Date(currentDate);
      start.setDate(start.getDate() - start.getDay()); // Début de la semaine
      end = new Date(start);
      end.setDate(end.getDate() + 83); // 12 semaines = 84 jours
    } else {
      // Vue par mois: afficher 6 mois
      start = startOfMonth(currentDate);
      end = endOfMonth(addMonths(currentDate, 5));
    }

    return eachDayOfInterval({ start, end });
  };

  // Obtenir les dates pour l'affichage
  const dates = getDates();

  // Naviguer dans le temps
  const navigate = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'prev') {
      if (zoomLevel === 'day') {
        setCurrentDate(prev => {
          const newDate = new Date(prev);
          newDate.setDate(newDate.getDate() - 30);
          return newDate;
        });
      } else if (zoomLevel === 'week') {
        setCurrentDate(prev => {
          const newDate = new Date(prev);
          newDate.setDate(newDate.getDate() - 7 * 12);
          return newDate;
        });
      } else {
        setCurrentDate(prev => subMonths(prev, 6));
      }
    } else if (direction === 'next') {
      if (zoomLevel === 'day') {
        setCurrentDate(prev => {
          const newDate = new Date(prev);
          newDate.setDate(newDate.getDate() + 30);
          return newDate;
        });
      } else if (zoomLevel === 'week') {
        setCurrentDate(prev => {
          const newDate = new Date(prev);
          newDate.setDate(newDate.getDate() + 7 * 12);
          return newDate;
        });
      } else {
        setCurrentDate(prev => addMonths(prev, 6));
      }
    } else {
      setCurrentDate(new Date());
    }
  };

  // Ouvrir le modal de détails d'une tâche
  const openTaskDetails = (task: ExtendedTask) => {
    setSelectedTask(task);
    setEditedTask({ ...task });
    setTaskModalOpen(true);
  };

  // Sauvegarder les modifications d'une tâche
  const saveTaskChanges = () => {
    if (selectedTask && selectedTask.id) {
      updateTask(selectedTask.id.toString(), editedTask);
      setSelectedTask({ ...selectedTask, ...editedTask });
      setTaskModalOpen(false);
    }
  };

  // Obtenir la position X d'une tâche dans le diagramme
  const getTaskPosition = (task: any) => {
    const taskStart = new Date(task.startDate || task.start);
    const firstDate = dates[0];

    // Calculer le décalage en jours
    const diffTime = Math.abs(taskStart.getTime() - firstDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculer la largeur d'une cellule
    const cellWidth = 40; // Largeur en pixels d'une cellule de jour

    return diffDays * cellWidth;
  };

  // Obtenir la largeur d'une tâche dans le diagramme
  const getTaskWidth = (task: any) => {
    const taskStart = new Date(task.startDate || task.start);
    const taskEnd = new Date(task.endDate || task.end);

    // Calculer la durée en jours
    const diffTime = Math.abs(taskEnd.getTime() - taskStart.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 pour inclure le jour de fin

    // Calculer la largeur d'une cellule
    const cellWidth = 40; // Largeur en pixels d'une cellule de jour

    return diffDays * cellWidth;
  };

  // Obtenir la couleur en fonction du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return '#adb5bd';
      case 'in-progress': return '#228be6';
      case 'done': return '#40c057';
      default: return '#adb5bd';
    }
  };

  // Obtenir la couleur en fonction de la priorité
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#fa5252';
      case 'medium': return '#fd7e14';
      case 'low': return '#40c057';
      default: return '#adb5bd';
    }
  };

  // Obtenir le texte du statut
  const getStatusText = (status: string) => {
    switch (status) {
      case 'todo': return 'À faire';
      case 'in-progress': return 'En cours';
      case 'done': return 'Terminé';
      default: return status;
    }
  };

  // Obtenir le texte de la priorité
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Élevée';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
      default: return 'Non définie';
    }
  };

  // Formater la date selon le niveau de zoom
  const formatDate = (date: Date) => {
    if (zoomLevel === 'day') {
      return format(date, 'dd MMM', { locale: fr });
    } else if (zoomLevel === 'week') {
      // Pour la vue semaine, afficher le numéro de la semaine
      const weekNumber = format(date, 'w', { locale: fr });
      return `S${weekNumber}`;
    } else {
      return format(date, 'MMM yyyy', { locale: fr });
    }
  };

  // Formater la date pour l'affichage dans l'en-tête
  const formatHeaderDate = (date: Date) => {
    if (zoomLevel === 'day') {
      return format(date, 'EEE dd', { locale: fr });
    } else if (zoomLevel === 'week') {
      if (date.getDay() === 1) { // Lundi
        const weekNumber = format(date, 'w', { locale: fr });
        return `S${weekNumber}`;
      }
      return '';
    } else {
      if (date.getDate() === 1) { // Premier jour du mois
        return format(date, 'MMM', { locale: fr });
      }
      return '';
    }
  };

  // Vérifier si une date est aujourd'hui
  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  // Obtenir la classe CSS pour une cellule de date
  const getDateCellClass = (date: Date) => {
    let classes = 'gantt-date-cell';

    if (isWeekend(date)) {
      classes += ' gantt-weekend';
    }

    if (isToday(date)) {
      classes += ' gantt-today';
    }

    return classes;
  };

  return (
    <Box>
      {/* Barre d'outils */}
      <Paper p="md" mb="md" radius="md" shadow="sm" style={{ backgroundColor: '#f8f9fa' }}>
        <Group position="apart">
          <Group>
            <Group spacing={5}>
              <ActionIcon variant="light" color="blue" onClick={() => navigate('prev')}>
                <IconChevronLeft size={16} />
              </ActionIcon>
              <ActionIcon variant="filled" color="blue" onClick={() => navigate('today')}>
                <IconCalendar size={16} />
              </ActionIcon>
              <ActionIcon variant="light" color="blue" onClick={() => navigate('next')}>
                <IconChevronRight size={16} />
              </ActionIcon>
            </Group>

            <Text weight={600} size="md" style={{ marginLeft: 10 }}>
              {zoomLevel === 'day'
                ? `${format(dates[0], 'dd MMM yyyy', { locale: fr })} - ${format(dates[dates.length - 1], 'dd MMM yyyy', { locale: fr })}`
                : zoomLevel === 'week'
                ? `Semaines ${format(dates[0], 'w', { locale: fr })} - ${format(dates[dates.length - 1], 'w', { locale: fr })}, ${format(dates[0], 'yyyy', { locale: fr })}`
                : `${format(dates[0], 'MMMM yyyy', { locale: fr })} - ${format(dates[dates.length - 1], 'MMMM yyyy', { locale: fr })}`
              }
            </Text>
          </Group>

          <Group>
            <Group spacing={8} mr={15}>
              <Text size="sm" weight={500}>Zoom:</Text>
              <Select
                value={zoomLevel}
                onChange={(value) => setZoomLevel(value as 'day' | 'week' | 'month')}
                data={[
                  { value: 'day', label: 'Jour' },
                  { value: 'week', label: 'Semaine' },
                  { value: 'month', label: 'Mois' }
                ]}
                style={{ width: 100 }}
                size="xs"
              />
            </Group>

            <Group spacing={5}>
              <Tooltip label="Zoom avant">
                <ActionIcon variant="light" color="blue" onClick={() => {
                  if (zoomLevel === 'month') setZoomLevel('week');
                  else if (zoomLevel === 'week') setZoomLevel('day');
                }}>
                  <IconZoomIn size={16} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Zoom arrière">
                <ActionIcon variant="light" color="blue" onClick={() => {
                  if (zoomLevel === 'day') setZoomLevel('week');
                  else if (zoomLevel === 'week') setZoomLevel('month');
                }}>
                  <IconZoomOut size={16} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Actualiser">
                <ActionIcon variant="light" color="blue" onClick={() => navigate('today')}>
                  <IconRefresh size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        </Group>

        {/* Légende */}
        <Group position="apart" mt="md" style={{ borderTop: '1px solid #dee2e6', paddingTop: 10 }}>
          <Group spacing={15}>
            <Group spacing={5}>
              <Badge color="gray" size="sm" variant="filled" className="status-todo">À faire</Badge>
              <Badge color="blue" size="sm" variant="filled" className="status-in-progress">En cours</Badge>
              <Badge color="green" size="sm" variant="filled" className="status-done">Terminé</Badge>
            </Group>

            <Group spacing={5}>
              <Badge color="red" size="sm" variant="outline" className="priority-high">Priorité haute</Badge>
              <Badge color="orange" size="sm" variant="outline" className="priority-medium">Priorité moyenne</Badge>
              <Badge color="green" size="sm" variant="outline" className="priority-low">Priorité basse</Badge>
            </Group>
          </Group>
        </Group>
      </Paper>

      {/* Diagramme de Gantt */}
      <Paper p="md" radius="md" shadow="sm">
        <div className="gantt-container">
          {/* En-tête avec les noms des tâches */}
          <div className="gantt-header">
            <div className="gantt-task-list-header">
              <div className="gantt-task-name-header">Tâche</div>
              <div className="gantt-task-dates-header">Dates</div>
            </div>

            <div className="gantt-timeline-header">
              {dates.map((date, index) => (
                <div
                  key={index}
                  className={getDateCellClass(date)}
                  style={{ width: 40 }}
                >
                  {formatHeaderDate(date)}
                </div>
              ))}
            </div>
          </div>

          {/* Corps du diagramme */}
          <div className="gantt-body">
            {/* Liste des tâches */}
            <div className="gantt-task-list">
              {tasks.filter(task => task.startDate && task.endDate).map(task => (
                <div
                  key={task.id}
                  className="gantt-task-row"
                  onClick={() => openTaskDetails(task)}
                >
                  <div className="gantt-task-name">
                    {task.status === 'done' ? (
                      <IconCircleCheck size={16} className="task-icon" style={{ color: getStatusColor(task.status) }} />
                    ) : (
                      <IconCircleDashed size={16} className="task-icon" style={{ color: getStatusColor(task.status) }} />
                    )}
                    <Text truncate>{task.title}</Text>
                  </div>
                  <div className="gantt-task-dates">
                    <Group spacing={5} position="center" noWrap>
                      {task.priority && (
                        <Badge
                          size="xs"
                          variant="dot"
                          color={getPriorityColor(task.priority)}
                          className={`gantt-badge priority-${task.priority}`}
                        >
                          {getPriorityText(task.priority)}
                        </Badge>
                      )}

                      <Text size="xs" color="dimmed" className="date-range">
                        {format(new Date(task.startDate), 'dd/MM', { locale: fr })} - {format(new Date(task.endDate), 'dd/MM', { locale: fr })}
                      </Text>
                    </Group>
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline avec les barres de tâches */}
            <div className="gantt-timeline">
              {tasks.filter(task => task.startDate && task.endDate).map(task => (
                <div key={task.id} className="gantt-timeline-row">
                  <div
                    className={`gantt-task-bar status-${task.status} ${task.priority ? `priority-${task.priority}` : ''}`}
                    style={{
                      left: `${getTaskPosition(task)}px`,
                      width: `${getTaskWidth(task)}px`,
                      backgroundColor: getStatusColor(task.status),
                      borderLeft: task.priority ? `4px solid ${getPriorityColor(task.priority)}` : undefined
                    }}
                    onClick={() => openTaskDetails(task)}
                  >
                    <div className="gantt-task-content">
                      <Text size="xs" color="white" truncate>{task.title}</Text>
                    </div>
                    <div
                      className="gantt-task-progress"
                      style={{
                        width: `${task.status === 'done' ? 100 : task.status === 'in-progress' ? 50 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              ))}

              {/* Ligne verticale pour aujourd'hui */}
              <div
                className="gantt-today-line"
                style={{
                  left: `${getTaskPosition({
                    start: new Date()
                  })}px`
                }}
              ></div>
            </div>
          </div>
        </div>
      </Paper>

      {/* Modal de détails de tâche */}
      <Modal
        opened={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        title={<Text weight={700} size="lg">Détails de la tâche</Text>}
        size="lg"
      >
        {selectedTask && (
          <Box>
            <TextInput
              label="Titre"
              value={editedTask.title || ''}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              mb="md"
            />

            <Textarea
              label="Description"
              value={editedTask.description || ''}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              minRows={3}
              mb="md"
            />

            <Grid mb="md">
              <Grid.Col span={6}>
                <Select
                  label="Statut"
                  value={editedTask.status || ''}
                  onChange={(value) => setEditedTask({ ...editedTask, status: value as 'todo' | 'in-progress' | 'done' })}
                  data={[
                    { value: 'todo', label: 'À faire' },
                    { value: 'in-progress', label: 'En cours' },
                    { value: 'done', label: 'Terminé' }
                  ]}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Priorité"
                  value={editedTask.priority || ''}
                  onChange={(value) => setEditedTask({ ...editedTask, priority: value as 'low' | 'medium' | 'high' | '' })}
                  data={[
                    { value: '', label: 'Non définie' },
                    { value: 'low', label: 'Basse' },
                    { value: 'medium', label: 'Moyenne' },
                    { value: 'high', label: 'Élevée' }
                  ]}
                />
              </Grid.Col>
            </Grid>

            <Group position="right" mt="xl">
              <Button variant="outline" onClick={() => setTaskModalOpen(false)}>Annuler</Button>
              <Button onClick={saveTaskChanges}>Enregistrer</Button>
            </Group>
          </Box>
        )}
      </Modal>
    </Box>
  );
}
