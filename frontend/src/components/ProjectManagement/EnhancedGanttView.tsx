import React, { useState, useCallback } from 'react';
import { Box, Paper, Group, Text, Select, Button, ActionIcon, Modal, TextInput, Textarea, Grid, Badge, Tooltip } from '@mantine/core';
import {
  IconRefresh,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconFlag,
  IconCircleCheck,
  IconCircleDashed,
  IconCircleDotted,
  IconUser,
  IconUsers,
  IconX,
  IconListCheck,
  IconFilter
} from '@tabler/icons-react';
import { Task } from 'pages/projects';
import { format, differenceInDays, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

// Définir les types pour les tâches Gantt
interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  dependencies: string[];
  status: string;
  priority: string;
  assignee?: string;
  custom_class?: string;
  type: 'task' | 'milestone' | 'group';
  description?: string;
  duration?: number;
  parentId?: string;
  children?: string[];
  barColor?: string;
}

interface EnhancedGanttViewProps {
  tasks: Task[];
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
}

export default function EnhancedGanttView({ tasks, updateTask }: EnhancedGanttViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: [] as string[],
    priority: [] as string[],
    assignee: [] as string[],
    type: [] as string[],
  });
  // État pour le modal de détails de tâche

  // Obtenir la couleur en fonction du statut - Couleurs plus vives et distinctes
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
      case 'À faire':
        return '#dc3545';      // Rouge pour "À faire"
      case 'in-progress':
      case 'En cours':
        return '#fd7e14';      // Orange pour "En cours"
      case 'done':
      case 'Achevé':
      case 'Terminé':
        return '#28a745';      // Vert pour "Terminé"
      default:
        return '#868e96';      // Gris neutre pour les autres statuts
    }
  };

  // Obtenir la couleur en fonction de la priorité - Couleurs plus distinctes
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#fa5252';      // Rouge vif pour priorité élevée
      case 'medium': return '#fd7e14';    // Orange pour priorité moyenne
      case 'low': return '#20c997';       // Vert-bleu pour priorité basse
      default: return '#adb5bd';          // Gris clair pour priorité non définie
    }
  };

  // Obtenir le texte du statut - Noms plus clairs
  const getStatusText = (status: string) => {
    switch (status) {
      case 'todo':
      case 'À faire':
        return '📋 À FAIRE';
      case 'in-progress':
      case 'En cours':
        return '🔄 EN COURS';
      case 'done':
      case 'Achevé':
      case 'Terminé':
        return '✅ TERMINÉ';
      default:
        return status.toUpperCase();
    }
  };

  // Obtenir le texte de la priorité - Noms plus clairs
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴 Élevée';
      case 'medium': return '🟠 Moyenne';
      case 'low': return '🟢 Basse';
      default: return '⚫ Non définie';
    }
  };

  // Fonction pour déterminer si une tâche est un jalon (milestone)
  const isMilestone = (task: Task): boolean => {
    // Une tâche est considérée comme un jalon si elle a un tag spécifique
    // ou si sa durée est courte (1 jour)
    if (!task.dueDate) return false;

    // Utiliser createdAt comme date de début, ou dueDate - 1 jour si createdAt n'est pas défini
    const start = task.createdAt ? new Date(task.createdAt) : new Date(new Date(task.dueDate).getTime() - 86400000);
    const end = new Date(task.dueDate);
    const diffDays = differenceInDays(end, start);

    return diffDays <= 1 || (task.tags && task.tags.includes('milestone'));
  };

  // Fonction pour déterminer si une tâche est un groupe
  const isGroup = (task: Task): boolean => {
    // Une tâche est considérée comme un groupe si elle a un tag spécifique
    // ou si elle a des sous-tâches (à implémenter si cette information est disponible)
    return task.tags && task.tags.includes('group');
  };

  // Fonction pour obtenir le projet parent d'une tâche (supprimée car nous n'affichons plus les projets)

  // Fonction pour obtenir les dépendances d'une tâche (toujours vide pour cette version simplifiée)
  const getTaskDependencies = (): string[] => {
    return [];
  };

  // Ajouter des dates par défaut aux tâches qui n'en ont pas
  const tasksWithDates = tasks.map(task => {
    if (!task.dueDate) {
      // Si pas de date d'échéance, ajouter une date d'échéance par défaut (aujourd'hui + 7 jours)
      return {
        ...task,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
    }
    return task;
  });

  // Convertir les tâches en format Gantt
  const ganttTasks = tasksWithDates
    .map(task => {
      // Utiliser createdAt comme date de début, ou dueDate - 7 jours si createdAt n'est pas défini
      const endDate = new Date(task.dueDate);
      const startDate = task.createdAt ? new Date(task.createdAt) : new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Déterminer le type de tâche
      const taskType = isMilestone(task) ? 'milestone' : isGroup(task) ? 'group' : 'task';

      // Déterminer la classe CSS en fonction du statut, de la priorité et du type
      let customClass = `status-${task.status || 'todo'} ${taskType}`;
      if (task.priority) {
        customClass += ` priority-${task.priority}`;
      }

      // Calculer la durée en jours
      const duration = differenceInDays(endDate, startDate) + 1;

      // Obtenir les dépendances
      const dependencies = getTaskDependencies();

      return {
        id: task.id?.toString() || '',
        name: task.title || 'Sans titre',
        start: startDate,
        end: endDate,
        progress: task.status === 'done' ? 100 : task.status === 'in-progress' ? 50 : 0,
        dependencies,
        status: task.status || 'todo',
        priority: task.priority || '',
        assignee: task.assignedTo?.id.toString() || '',
        custom_class: customClass,
        type: taskType,
        description: task.description || '',
        duration,
        parentId: undefined, // À implémenter si cette information est disponible
        children: [] // À implémenter si cette information est disponible
      } as GanttTask;
    });

  // Filtrer les tâches en fonction des filtres
  const filteredTasks = ganttTasks.filter(task => {
    if (filters.status.length > 0 && !filters.status.includes(task.status)) {
      return false;
    }
    if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
      return false;
    }
    if (filters.assignee.length > 0 && !filters.assignee.includes(task.assignee || '')) {
      return false;
    }
    if (filters.type.length > 0 && !filters.type.includes(task.type)) {
      return false;
    }
    return true;
  });

  // Fonction simplifiée pour regrouper les tâches
  const groupTasks = useCallback((tasks: GanttTask[]): GanttTask[] => {
    // Toujours retourner les tâches triées par date de début
    return [...tasks].sort((a, b) => a.start.getTime() - b.start.getTime());
  }, []);

  // Appliquer le regroupement aux tâches filtrées
  const groupedAndFilteredTasks = groupTasks(filteredTasks);

  // Afficher des informations de débogage dans la console
  console.log('Tâches reçues:', tasks.length);
  console.log('Tâches avec dates:', tasksWithDates.length);
  console.log('Tâches converties en format Gantt:', ganttTasks.length);
  console.log('Tâches filtrées:', filteredTasks.length);
  console.log('Tâches groupées et filtrées:', groupedAndFilteredTasks.length);

  // Générer les dates pour l'en-tête du diagramme
  const getDates = () => {
    let start: Date;
    let end: Date;

    // Vue par semaine: afficher 12 semaines
    start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay()); // Début de la semaine
    end = new Date(start);
    end.setDate(end.getDate() + 83); // 12 semaines = 84 jours

    return eachDayOfInterval({ start, end });
  };

  // Obtenir les dates pour l'affichage
  const dates = getDates();

  // Naviguer dans le temps
  const navigate = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'prev') {
      // Vue par semaine: reculer de 12 semaines
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setDate(newDate.getDate() - 7 * 12);
        return newDate;
      });
    } else if (direction === 'next') {
      // Vue par semaine: avancer de 12 semaines
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setDate(newDate.getDate() + 7 * 12);
        return newDate;
      });
    } else {
      // Aujourd'hui
      setCurrentDate(new Date());
    }
  };

  // Ouvrir le modal de détails d'une tâche
  const openTaskDetails = (task: Task) => {
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



  // Obtenir tous les assignés uniques pour les filtres
  const uniqueAssignees = tasks
    .filter(task => task.assignedTo?.id)
    .map(task => task.assignedTo?.id.toString() || '')
    .filter((value, index, self) => self.indexOf(value) === index);

  return (
    <Box>
      {/* Barre d'outils moderne */}
      <Paper p="md" mb="md" radius="md" shadow="sm" style={{
        background: 'linear-gradient(to right, #f8f9fa, #e9ecef)',
        borderBottom: '3px solid #4dabf7'
      }}>
        <Group position="apart">
          <Group>
            <Group spacing={8} style={{
              background: 'white',
              padding: '5px 10px',
              borderRadius: '30px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}>
              <ActionIcon variant="transparent" color="blue" onClick={() => navigate('prev')}>
                <IconChevronLeft size={18} />
              </ActionIcon>
              <ActionIcon variant="filled" color="blue" radius="xl" onClick={() => navigate('today')}>
                <IconCalendar size={16} />
              </ActionIcon>
              <ActionIcon variant="transparent" color="blue" onClick={() => navigate('next')}>
                <IconChevronRight size={18} />
              </ActionIcon>
            </Group>

            <Text weight={700} size="lg" style={{
              marginLeft: 15,
              background: '#e7f5ff',
              padding: '10px 20px',
              borderRadius: '20px',
              boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
              color: '#1c7ed6',
              border: '1px solid #d0ebff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>📅</span>
              <span>Période: {format(dates[0], 'dd MMM', { locale: fr })} - {format(dates[dates.length - 1], 'dd MMM yyyy', { locale: fr })}</span>
            </Text>
          </Group>

          <Group>
            <Group spacing={15}>
              <Group spacing={8}>
                <Tooltip label="Actualiser">
                  <ActionIcon
                    variant="light"
                    color="blue"
                    radius="xl"
                    size="lg"
                    onClick={() => navigate('today')}
                    style={{ boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                  >
                    <IconRefresh size={18} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          </Group>
        </Group>


      </Paper>

      {/* Diagramme de Gantt ultra-simplifié */}
      <Paper p="xl" radius="lg" shadow="sm" style={{
        overflow: 'hidden',
        border: '1px solid #e9ecef',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        backgroundColor: 'white'
      }}>
        <Text size="xl" weight={700} mb="lg" style={{ color: '#2c3e50' }}>
          Diagramme de Gantt - Planning des tâches
        </Text>

        <Text size="sm" mb="xl" style={{ color: '#495057', maxWidth: '800px', fontWeight: 500 }}>
          Ce diagramme montre la planification des tâches dans le temps. Chaque barre représente une tâche et sa longueur indique la durée.
        </Text>

        <div style={{
          display: 'flex',
          borderTop: '1px solid #dee2e6',
          borderLeft: '1px solid #dee2e6',
          borderRight: '1px solid #dee2e6',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          backgroundColor: '#e9ecef',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          {/* En-tête avec les noms des colonnes */}
          <div style={{
            width: '250px',
            padding: '15px',
            fontWeight: 700,
            borderRight: '1px solid #dee2e6',
            color: '#343a40',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '18px' }}>📝</span> Tâche
          </div>
          <div style={{
            flex: 1,
            padding: '15px',
            fontWeight: 700,
            color: '#343a40',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '18px' }}>📅</span> Calendrier
          </div>
        </div>

        {/* Corps du diagramme */}
        <div style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #e9ecef', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
          {groupedAndFilteredTasks.map((task, index) => {
            // Calculer la position et la largeur de la barre
            const startDate = new Date(task.start);
            const endDate = new Date(task.end);

            // Calculer la durée en jours
            const durationDays = Math.max(1, differenceInDays(endDate, startDate) + 1);

            // Calculer le pourcentage de progression
            const progress = task.progress;

            return (
              <div key={task.id} style={{
                display: 'flex',
                borderBottom: index < groupedAndFilteredTasks.length - 1 ? '1px solid #e9ecef' : 'none',
                backgroundColor: selectedTask && selectedTask.id?.toString() === task.id ? '#edf2ff' : index % 2 === 0 ? 'white' : '#f8f9fa',
                transition: 'background-color 0.2s ease'
              }}>
                {/* Colonne du nom de la tâche */}
                <div style={{
                  width: '250px',
                  padding: '15px',
                  borderRight: '1px solid #e9ecef',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px'
                }}>
                  <Group spacing={8} noWrap style={{
                    backgroundColor: '#fff',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: (task as any).barColor || getStatusColor(task.status),

                      flexShrink: 0,
                      border: '2px solid white',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}></div>

                    <Text
                      truncate
                      weight={700}
                      size="sm"
                      style={{
                        color: '#343a40',
                        flexGrow: 1
                      }}
                    >
                      {task.name}
                    </Text>
                  </Group>

                  <Text size="sm" weight={600} style={{
                    color: '#1c7ed6',
                    backgroundColor: '#e7f5ff',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    border: '1px solid #d0ebff'
                  }}>
                    <span style={{ fontSize: '16px' }}>🗓️</span>
                    {format(startDate, 'dd/MM/yyyy', { locale: fr })} - {format(endDate, 'dd/MM/yyyy', { locale: fr })}
                  </Text>
                </div>

                {/* Colonne du diagramme */}
                <div style={{
                  flex: 1,
                  padding: '15px',
                  position: 'relative',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  const originalTask = tasks.find(t => t.id?.toString() === task.id);
                  if (originalTask) {
                    openTaskDetails(originalTask);
                  }
                }}>
                  {/* Barre de progression */}
                  <div style={{
                    height: '36px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '8px',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid #dee2e6',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
                  }}>
                    {/* Barre de la tâche */}
                    <div style={{
  position: 'absolute',
  top: '2px',
  left: '2px',
  height: 'calc(100% - 4px)',
  width: 'calc(100% - 4px)',
  backgroundColor: getStatusColor(task.status),
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '12px',
  paddingRight: '12px',
  boxSizing: 'border-box',
  boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
  border: '1px solid rgba(0,0,0,0.2)' // ✅ foncé pour renforcer
  // backgroundImage supprimé
}}>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%'
                      }}>
                        <Text size="sm" weight={700} color="white" style={{
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                          letterSpacing: '0.5px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span style={{ fontSize: '16px' }}>
                            {task.status === 'todo' ? '📋' : task.status === 'in-progress' ? '🔄' : '✅'}
                          </span>
                          <span style={{
                            backgroundColor: 'rgba(255,255,255,0.3)',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '15px',
                            fontWeight: 'bold',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255,255,255,0.4)'
                          }}>
                            {durationDays} jour{durationDays > 1 ? 's' : ''}
                          </span>
                        </Text>

                        <span style={{
                          fontSize: '16px',
                          backgroundColor: task.priority ? 'rgba(255,255,255,0.2)' : 'rgba(173,181,189,0.4)',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          border: task.priority ? 'none' : '1px solid rgba(173,181,189,0.8)',
                          boxShadow: task.priority ? 'none' : '0 1px 3px rgba(0,0,0,0.2)'
                        }}>
                          {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟠' : task.priority === 'low' ? '🟢' : '⚫'}
                        </span>
                      </div>
                    </div>

                    {/* Indicateur de progression */}
                    {progress < 100 && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        height: '100%',
                        width: `${100 - progress}%`,
                        backgroundColor: 'rgba(255, 255, 255, 0.85)',
                        borderTopRightRadius: '6px',
                        borderBottomRightRadius: '6px',
                        borderLeft: '2px dashed rgba(255, 255, 255, 0.9)'
                      }}></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Message si aucune tâche */}
          {groupedAndFilteredTasks.length === 0 && (
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <Text size="lg" weight={500} color="dimmed">Aucune tâche à afficher</Text>
              <Text size="sm" color="dimmed" mt="md">Ajoutez des tâches ou modifiez vos filtres pour voir le diagramme</Text>
            </div>
          )}
        </div>
      </Paper>

      {/* Modal de détails de tâche moderne */}
      <Modal
        opened={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        title={
          <Group position="apart" style={{ width: '100%' }}>
            <Text weight={700} size="lg" style={{ color: '#228be6' }}>
              {selectedTask?.status === 'done' ? (
                <span style={{ color: '#40c057' }}>✓ Tâche terminée</span>
              ) : selectedTask?.status === 'in-progress' ? (
                <span style={{ color: '#228be6' }}>⟳ Tâche en cours</span>
              ) : (
                <span>📋 Détails de la tâche</span>
              )}
            </Text>
            {selectedTask?.priority && (
              <Badge
                color={getPriorityColor(selectedTask.priority)}
                size="lg"
                variant="light"
                radius="md"
                style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
              >
                Priorité {getPriorityText(selectedTask.priority).toLowerCase()}
              </Badge>
            )}
          </Group>
        }
        size="lg"
        styles={{
          header: {
            borderBottom: '2px solid #e9ecef',
            paddingBottom: '16px'
          },
          body: {
            padding: '20px'
          }
        }}
        radius="md"
      >
        {selectedTask && (
          <Box>
            <TextInput
              label={<Text weight={600} size="sm" mb={5}>Titre de la tâche</Text>}
              value={editedTask.title || ''}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              mb="md"
              placeholder="Entrez un titre descriptif"
              styles={{
                input: {
                  fontSize: '16px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                }
              }}
            />

            <Textarea
              label={<Text weight={600} size="sm" mb={5}>Description</Text>}
              value={editedTask.description || ''}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              minRows={4}
              mb="md"
              placeholder="Décrivez la tâche en détail..."
              styles={{
                input: {
                  fontSize: '14px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                }
              }}
            />

            <Grid mb="md">
              <Grid.Col span={6}>
                <Text weight={600} size="sm" mb={5}>Statut</Text>
                <Select
                  value={editedTask.status || ''}
                  onChange={(value) => setEditedTask({ ...editedTask, status: value as 'todo' | 'in-progress' | 'done' })}
                  data={[
                    { value: 'todo', label: 'À faire' },
                    { value: 'in-progress', label: 'En cours' },
                    { value: 'done', label: 'Terminé' }
                  ]}
                  styles={{
                    input: {
                      fontSize: '14px',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #dee2e6',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                    },
                    item: {
                      borderRadius: '4px'
                    }
                  }}
                  icon={
                    editedTask.status === 'done' ? (
                      <IconCircleCheck size={18} style={{ color: '#40c057' }} />
                    ) : editedTask.status === 'in-progress' ? (
                      <IconCircleDotted size={18} style={{ color: '#228be6' }} />
                    ) : (
                      <IconCircleDashed size={18} style={{ color: '#adb5bd' }} />
                    )
                  }
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Text weight={600} size="sm" mb={5}>Priorité</Text>
                <Select
                  value={editedTask.priority || ''}
                  onChange={(value) => setEditedTask({ ...editedTask, priority: value as 'low' | 'medium' | 'high' | '' })}
                  data={[
                    { value: '', label: 'Non définie' },
                    { value: 'low', label: 'Basse' },
                    { value: 'medium', label: 'Moyenne' },
                    { value: 'high', label: 'Élevée' }
                  ]}
                  styles={{
                    input: {
                      fontSize: '14px',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #dee2e6',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                    },
                    item: {
                      borderRadius: '4px'
                    }
                  }}
                  icon={
                    editedTask.priority === 'high' ? (
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fa5252' }} />
                    ) : editedTask.priority === 'medium' ? (
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fd7e14' }} />
                    ) : editedTask.priority === 'low' ? (
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#40c057' }} />
                    ) : (
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#adb5bd' }} />
                    )
                  }
                />
              </Grid.Col>
            </Grid>

            <Group position="right" mt="xl" spacing="md">
              <Button
                variant="default"
                onClick={() => setTaskModalOpen(false)}
                size="md"
                radius="md"
                style={{
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  fontWeight: 600
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={saveTaskChanges}
                size="md"
                radius="md"
                style={{
                  background: 'linear-gradient(to right, #228be6, #15aabf)',
                  boxShadow: '0 4px 8px rgba(34, 139, 230, 0.25)',
                  fontWeight: 600
                }}
              >
                Enregistrer les modifications
              </Button>
            </Group>
          </Box>
        )}
      </Modal>

      {/* Modal de filtres moderne */}
      <Modal
        opened={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        title={
          <Group position="apart" style={{ width: '100%' }}>
            <Text weight={700} size="lg" style={{ color: '#228be6' }}>
              <span>🔍 Filtrer les tâches</span>
            </Text>
            <Badge
              color="blue"
              size="lg"
              variant="light"
              radius="md"
              style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
            >
              {Object.values(filters).flat().length} filtre(s) actif(s)
            </Badge>
          </Group>
        }
        size="md"
        styles={{
          header: {
            borderBottom: '2px solid #e9ecef',
            paddingBottom: '16px'
          },
          body: {
            padding: '20px'
          }
        }}
        radius="md"
      >
        <Box>
          <Paper p="md" radius="md" mb="md" style={{
            background: 'linear-gradient(to right, #f8f9fa, #e9ecef)',
            border: '1px solid #dee2e6'
          }}>
            <Text size="sm" weight={600} color="#495057" mb={10}>
              Utilisez les filtres ci-dessous pour affiner l'affichage des tâches dans le diagramme de Gantt.
            </Text>
          </Paper>

          <Grid>
            <Grid.Col span={6}>
              <Text weight={600} size="sm" mb={5}>Statut</Text>
              <Select
                placeholder="Filtrer par statut"
                data={[
                  { value: 'todo', label: 'À faire' },
                  { value: 'in-progress', label: 'En cours' },
                  { value: 'done', label: 'Terminé' }
                ]}
                value={filters.status.length > 0 ? filters.status[0] : null}
                onChange={(value) => setFilters({ ...filters, status: value ? [value] : [] })}
                clearable
                mb="md"
                styles={{
                  input: {
                    fontSize: '14px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                  },
                  item: {
                    borderRadius: '4px'
                  }
                }}
                icon={
                  filters.status[0] === 'done' ? (
                    <IconCircleCheck size={18} style={{ color: '#40c057' }} />
                  ) : filters.status[0] === 'in-progress' ? (
                    <IconCircleDotted size={18} style={{ color: '#228be6' }} />
                  ) : filters.status[0] === 'todo' ? (
                    <IconCircleDashed size={18} style={{ color: '#adb5bd' }} />
                  ) : (
                    <IconCircleDashed size={18} style={{ color: '#adb5bd' }} />
                  )
                }
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <Text weight={600} size="sm" mb={5}>Priorité</Text>
              <Select
                placeholder="Filtrer par priorité"
                data={[
                  { value: 'high', label: 'Élevée' },
                  { value: 'medium', label: 'Moyenne' },
                  { value: 'low', label: 'Basse' },
                  { value: '', label: 'Non définie' }
                ]}
                value={filters.priority.length > 0 ? filters.priority[0] : null}
                onChange={(value) => setFilters({ ...filters, priority: value ? [value] : [] })}
                clearable
                mb="md"
                styles={{
                  input: {
                    fontSize: '14px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                  },
                  item: {
                    borderRadius: '4px'
                  }
                }}
                icon={
                  filters.priority[0] === 'high' ? (
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fa5252' }} />
                  ) : filters.priority[0] === 'medium' ? (
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fd7e14' }} />
                  ) : filters.priority[0] === 'low' ? (
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#40c057' }} />
                  ) : (
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#adb5bd' }} />
                  )
                }
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={6}>
              <Text weight={600} size="sm" mb={5}>Assigné à</Text>
              <Select
                placeholder="Filtrer par assigné"
                data={uniqueAssignees.map(id => ({ value: id, label: `Utilisateur #${id}` }))}
                value={filters.assignee.length > 0 ? filters.assignee[0] : null}
                onChange={(value) => setFilters({ ...filters, assignee: value ? [value] : [] })}
                clearable
                mb="md"
                styles={{
                  input: {
                    fontSize: '14px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                  },
                  item: {
                    borderRadius: '4px'
                  }
                }}
                icon={<IconUser size={18} style={{ color: '#228be6' }} />}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <Text weight={600} size="sm" mb={5}>Type</Text>
              <Select
                placeholder="Filtrer par type"
                data={[
                  { value: 'task', label: 'Tâche' },
                  { value: 'milestone', label: 'Jalon' },
                  { value: 'group', label: 'Groupe' }
                ]}
                value={filters.type.length > 0 ? filters.type[0] : null}
                onChange={(value) => setFilters({ ...filters, type: value ? [value] : [] })}
                clearable
                mb="md"
                styles={{
                  input: {
                    fontSize: '14px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                  },
                  item: {
                    borderRadius: '4px'
                  }
                }}
                icon={
                  filters.type[0] === 'milestone' ? (
                    <IconFlag size={18} style={{ color: '#fd7e14' }} />
                  ) : filters.type[0] === 'group' ? (
                    <IconUsers size={18} style={{ color: '#495057' }} />
                  ) : (
                    <IconFlag size={18} style={{ color: '#adb5bd' }} />
                  )
                }
              />
            </Grid.Col>
          </Grid>

          {/* Afficher les filtres actifs */}
          {(filters.status.length > 0 || filters.priority.length > 0 || filters.assignee.length > 0 || filters.type.length > 0) && (
            <Box mt="md" mb="md" p="md" style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <Text weight={600} mb="xs" color="#495057">Filtres actifs:</Text>
              <Group spacing={8}>
                {filters.status.length > 0 && (
                  <Badge
                    color={filters.status[0] === 'done' ? 'green' : filters.status[0] === 'in-progress' ? 'blue' : 'gray'}
                    size="md"
                    variant="filled"
                    radius="md"
                    className={`status-${filters.status[0]}`}
                    styles={{ root: { boxShadow: '0 2px 4px rgba(0,0,0,0.05)' } }}
                    rightSection={
                      <div
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        onClick={() => setFilters({ ...filters, status: [] })}
                      >
                        <IconX size={14} />
                      </div>
                    }
                  >
                    {getStatusText(filters.status[0])}
                  </Badge>
                )}

                {filters.priority.length > 0 && (
                  <Badge
                    color={getPriorityColor(filters.priority[0])}
                    size="md"
                    variant="light"
                    radius="md"
                    styles={{ root: { boxShadow: '0 2px 4px rgba(0,0,0,0.05)' } }}
                    rightSection={
                      <div
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        onClick={() => setFilters({ ...filters, priority: [] })}
                      >
                        <IconX size={14} />
                      </div>
                    }
                  >
                    {getPriorityText(filters.priority[0])}
                  </Badge>
                )}

                {filters.assignee.length > 0 && (
                  <Badge
                    color="blue"
                    size="md"
                    variant="light"
                    radius="md"
                    styles={{ root: { boxShadow: '0 2px 4px rgba(0,0,0,0.05)' } }}
                    leftSection={<IconUser size={14} />}
                    rightSection={
                      <div
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        onClick={() => setFilters({ ...filters, assignee: [] })}
                      >
                        <IconX size={14} />
                      </div>
                    }
                  >
                    Utilisateur #{filters.assignee[0]}
                  </Badge>
                )}

                {filters.type.length > 0 && (
                  <Badge
                    color={filters.type[0] === 'milestone' ? 'orange' : filters.type[0] === 'group' ? 'dark' : 'gray'}
                    size="md"
                    variant="light"
                    radius="md"
                    styles={{ root: { boxShadow: '0 2px 4px rgba(0,0,0,0.05)' } }}
                    leftSection={
                      filters.type[0] === 'milestone' ? (
                        <IconFlag size={14} />
                      ) : filters.type[0] === 'group' ? (
                        <IconUsers size={14} />
                      ) : (
                        <IconListCheck size={14} />
                      )
                    }
                    rightSection={
                      <div
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        onClick={() => setFilters({ ...filters, type: [] })}
                      >
                        <IconX size={14} />
                      </div>
                    }
                  >
                    {filters.type[0] === 'task' ? 'Tâche' : filters.type[0] === 'milestone' ? 'Jalon' : 'Groupe'}
                  </Badge>
                )}


              </Group>
            </Box>
          )}

          <Group position="right" mt="xl" spacing="md">
            <Button
              variant="default"
              onClick={() => setFilters({
                status: [],
                priority: [],
                assignee: [],
                type: []
              })}
              size="md"
              radius="md"
              style={{
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                fontWeight: 600
              }}
              leftIcon={<IconRefresh size={16} />}
            >
              Réinitialiser
            </Button>
            <Button
              onClick={() => setFilterModalOpen(false)}
              size="md"
              radius="md"
              style={{
                background: 'linear-gradient(to right, #228be6, #15aabf)',
                boxShadow: '0 4px 8px rgba(34, 139, 230, 0.25)',
                fontWeight: 600
              }}
              leftIcon={<IconFilter size={16} />}
            >
              Appliquer les filtres
            </Button>
          </Group>
        </Box>
      </Modal>
    </Box>
  );
}
