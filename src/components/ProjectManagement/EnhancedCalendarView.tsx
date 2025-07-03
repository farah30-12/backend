import React, { useState, useMemo } from 'react';
import { Calendar, Views, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Box, Paper, Text, Group, SegmentedControl, ActionIcon, Modal, Button } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconCalendar } from '@tabler/icons-react';
import { Task } from './ProjectPage';
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Importer le CSS personnalisé pour le calendrier

// Fonction pour formater les dates avec date-fns
const formatDate = (date: Date, formatStr: string) => {
  return format(date, formatStr, { locale: fr });
};

// Créer un localizer pour le calendrier avec date-fns
const locales = {
  'fr': fr,
};

// Créer un localizer pour React Big Calendar
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: fr }),
  getDay,
  locales,
});

// Fonction pour obtenir la couleur en fonction du statut de la tâche
const getStatusColor = (status: string) => {
  switch (status) {
    case 'todo':
      return '#228be6'; // Bleu
    case 'in-progress':
      return '#fd7e14'; // Orange
    case 'done':
      return '#40c057'; // Vert
    default:
      return '#868e96'; // Gris
  }
};

// Fonction pour obtenir la couleur en fonction de la priorité de la tâche
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return '#fa5252'; // Rouge
    case 'medium':
      return '#fd7e14'; // Orange
    case 'low':
      return '#40c057'; // Vert
    default:
      return '#868e96'; // Gris
  }
};

interface EnhancedCalendarViewProps {
  tasks: Task[];
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
  onTaskClick?: (task: Task) => void;
}

export default function EnhancedCalendarView({ tasks, updateTask, onTaskClick }: EnhancedCalendarViewProps) {
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Convertir les tâches en événements pour le calendrier
  const events = useMemo(() => {
    return tasks.map(task => {
      // Utiliser dueDate comme date de fin, et créer une date de début 1 jour avant
      const dueDate = task.dueDate ? new Date(task.dueDate) : new Date();
      const startDate = task.createdAt ? new Date(task.createdAt) : addDays(dueDate, -1);

      return {
        id: task.id || Math.floor(Math.random() * 10000),
        title: task.title || 'Sans titre',
        start: startDate,
        end: dueDate,
        allDay: true,
        resource: task,
        status: task.status || 'todo',
        priority: task.priority || '',
      };
    });
  }, [tasks]);

  // Gestionnaire pour le changement de vue
  const handleViewChange = (newView: string) => {
    setView(newView);
  };

  // Gestionnaire pour le changement de date
  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY' | 'DATE') => {
    const newDate = new Date(date);

    switch (action) {
      case 'PREV':
        if (view === 'month') {
          newDate.setMonth(newDate.getMonth() - 1);
        } else if (view === 'week') {
          newDate.setDate(newDate.getDate() - 7);
        } else if (view === 'day') {
          newDate.setDate(newDate.getDate() - 1);
        }
        break;
      case 'NEXT':
        if (view === 'month') {
          newDate.setMonth(newDate.getMonth() + 1);
        } else if (view === 'week') {
          newDate.setDate(newDate.getDate() + 7);
        } else if (view === 'day') {
          newDate.setDate(newDate.getDate() + 1);
        }
        break;
      case 'TODAY':
        return setDate(new Date());
      default:
        return;
    }

    setDate(newDate);
  };

  // Gestionnaire pour le clic sur un événement
  const handleEventClick = (event: any) => {
    const task = event.resource;
    setSelectedTask(task);
    setModalOpen(true);
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  // Style personnalisé pour les événements
  const eventStyleGetter = (event: any) => {
    const style = {
      backgroundColor: getStatusColor(event.status),
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: `2px solid ${getPriorityColor(event.priority)}`,
      display: 'block',
      fontWeight: 'bold',
    };

    // Ajouter des classes CSS pour les priorités et les statuts
    const className = `
      priority-${event.priority || 'none'}
      status-${event.status || 'none'}
    `;

    return {
      style,
      className,
    };
  };

  // Composant personnalisé pour l'en-tête du calendrier
  const CustomToolbar = () => (
    <Group position="apart" mb="md" style={{ padding: '0 10px' }}>
      <Group>
        <ActionIcon onClick={() => handleNavigate('PREV')} variant="filled">
          <IconChevronLeft size={16} />
        </ActionIcon>
        <ActionIcon onClick={() => handleNavigate('TODAY')} variant="filled">
          <IconCalendar size={16} />
        </ActionIcon>
        <ActionIcon onClick={() => handleNavigate('NEXT')} variant="filled">
          <IconChevronRight size={16} />
        </ActionIcon>
        <Text weight={500}>
          {view === 'month'
            ? formatDate(date, 'MMMM yyyy')
            : view === 'week'
            ? `Semaine du ${formatDate(startOfWeek(date, { locale: fr }), 'dd MMMM yyyy')}`
            : formatDate(date, 'EEEE dd MMMM yyyy')
          }
        </Text>
      </Group>

      <SegmentedControl
        value={view}
        onChange={handleViewChange}
        data={[
          { label: 'Mois', value: 'month' },
          { label: 'Semaine', value: 'week' },
          { label: 'Jour', value: 'day' },
          { label: 'Agenda', value: 'agenda' },
        ]}
      />
    </Group>
  );

  return (
    <Box>
      <Paper p="md" radius="md" shadow="sm">
        <CustomToolbar />

        <Box style={{ height: 700 }}>
          <Calendar
            localizer={localizer as any}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            views={{
              month: true,
              week: true,
              day: true,
              agenda: true,
            }}
            view={view as any}
            date={date}
            onNavigate={(newDate) => setDate(newDate)}
            onView={(newView) => setView(newView)}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleEventClick}
            popup
            messages={{
              today: "Aujourd'hui",
              previous: "Précédent",
              next: "Suivant",
              month: "Mois",
              week: "Semaine",
              day: "Jour",
              agenda: "Agenda",
              date: "Date",
              time: "Heure",
              event: "Événement",
              noEventsInRange: "Aucune tâche dans cette période",
              showMore: (total) => `+ ${total} autres`,
            }}
          />
        </Box>
      </Paper>

      {/* Modal pour afficher les détails de la tâche */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={<Text weight={700} size="lg">{selectedTask?.title}</Text>}
        size="md"
      >
        {selectedTask && (
          <Box>
            <Text weight={500} mb={5}>Description:</Text>
            <Text mb={15}>{selectedTask.description || 'Aucune description'}</Text>

            <Group mb={10}>
              <Text weight={500}>Statut:</Text>
              <Text style={{ color: getStatusColor(selectedTask.status) }}>
                {selectedTask.status === 'todo' ? 'À faire' :
                 selectedTask.status === 'in-progress' ? 'En cours' : 'Terminé'}
              </Text>
            </Group>

            <Group mb={10}>
              <Text weight={500}>Priorité:</Text>
              <Text style={{ color: getPriorityColor(selectedTask.priority) }}>
                {selectedTask.priority === 'high' ? 'Élevée' :
                 selectedTask.priority === 'medium' ? 'Moyenne' :
                 selectedTask.priority === 'low' ? 'Basse' : 'Non définie'}
              </Text>
            </Group>

            <Group mb={10}>
              <Text weight={500}>Date de création:</Text>
              <Text>{selectedTask.createdAt ? formatDate(new Date(selectedTask.createdAt), 'dd MMMM yyyy') : 'Non définie'}</Text>
            </Group>

            <Group mb={10}>
              <Text weight={500}>Date d'échéance:</Text>
              <Text>{selectedTask.dueDate ? formatDate(new Date(selectedTask.dueDate), 'dd MMMM yyyy') : 'Non définie'}</Text>
            </Group>

            {selectedTask.assignedTo && (
              <Group mb={10}>
                <Text weight={500}>Assigné à:</Text>
                <Text>{selectedTask.assignedTo.id}</Text>
              </Group>
            )}

            <Group position="right" mt={20}>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Fermer</Button>
            </Group>
          </Box>
        )}
      </Modal>
    </Box>
  );
}
