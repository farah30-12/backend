import React, { useState } from 'react';
import { Paper, Text, Group, Badge, Box, Grid, Button, ActionIcon } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { Task } from './ProjectPage';

interface CalendarViewProps {
  tasks: Task[];
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
}

export default function CalendarView({ tasks, updateTask }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Fonction pour obtenir le premier jour du mois
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  // Fonction pour obtenir le dernier jour du mois
  const getLastDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  // Fonction pour obtenir le nombre de jours dans le mois
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Fonction pour obtenir le jour de la semaine (0-6, 0 étant dimanche)
  const getDayOfWeek = (date: Date) => {
    return date.getDay();
  };

  // Fonction pour obtenir le mois précédent
  const getPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  // Fonction pour obtenir le mois suivant
  const getNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  // Fonction pour obtenir la semaine précédente
  const getPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  // Fonction pour obtenir la semaine suivante
  const getNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  // Fonction pour vérifier si une date est aujourd'hui
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Fonction pour obtenir les tâches d'une journée spécifique
  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      
      const dueDate = new Date(task.dueDate);
      return dueDate.getDate() === day.getDate() &&
        dueDate.getMonth() === day.getMonth() &&
        dueDate.getFullYear() === day.getFullYear();
    });
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

  // Génération du calendrier mensuel
  const renderMonthCalendar = () => {
    const firstDay = getFirstDayOfMonth(currentDate);
    const lastDay = getLastDayOfMonth(currentDate);
    const daysInMonth = getDaysInMonth(currentDate);
    const startingDayOfWeek = getDayOfWeek(firstDay);
    
    // Noms des jours de la semaine
    const weekDays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    
    // Tableau pour stocker tous les jours à afficher
    const calendarDays = [];
    
    // Ajouter les jours du mois précédent pour compléter la première semaine
    const prevMonth = new Date(currentDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      const day = daysInPrevMonth - startingDayOfWeek + i + 1;
      const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day);
      calendarDays.push({ date, isCurrentMonth: false });
    }
    
    // Ajouter les jours du mois courant
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      calendarDays.push({ date, isCurrentMonth: true });
    }
    
    // Ajouter les jours du mois suivant pour compléter la dernière semaine
    const remainingDays = 7 - (calendarDays.length % 7);
    if (remainingDays < 7) {
      const nextMonth = new Date(currentDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i);
        calendarDays.push({ date, isCurrentMonth: false });
      }
    }
    
    // Diviser les jours en semaines
    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }
    
    return (
      <Box>
        <Grid columns={7} gutter="xs">
          {weekDays.map((day, index) => (
            <Grid.Col key={index} span={1}>
              <Text align="center" weight={500} size="sm">
                {day}
              </Text>
            </Grid.Col>
          ))}
          
          {weeks.map((week, weekIndex) => (
            <React.Fragment key={weekIndex}>
              {week.map(({ date, isCurrentMonth }, dayIndex) => {
                const dayTasks = getTasksForDay(date);
                const isCurrentDay = isToday(date);
                
                return (
                  <Grid.Col key={`${weekIndex}-${dayIndex}`} span={1}>
                    <Paper
                      p="xs"
                      style={{
                        height: '120px',
                        backgroundColor: isCurrentMonth ? 'white' : '#f9f9f9',
                        border: isCurrentDay ? '2px solid #228be6' : '1px solid #e9ecef',
                        opacity: isCurrentMonth ? 1 : 0.5,
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      <Text
                        align="right"
                        weight={isCurrentDay ? 700 : 400}
                        color={isCurrentDay ? 'blue' : undefined}
                        size="sm"
                      >
                        {date.getDate()}
                      </Text>
                      
                      <Box style={{ marginTop: '5px', overflow: 'auto', maxHeight: '85px' }}>
                        {dayTasks.map(task => (
                          <Paper
                            key={task.id}
                            p={5}
                            mb={5}
                            style={{
                              backgroundColor: getStatusColor(task.status),
                              opacity: 0.8,
                              borderRadius: '4px'
                            }}
                          >
                            <Text size="xs" color="white" lineClamp={1}>
                              {task.title}
                            </Text>
                          </Paper>
                        ))}
                      </Box>
                      
                      {dayTasks.length > 3 && (
                        <Badge
                          size="xs"
                          style={{
                            position: 'absolute',
                            bottom: '5px',
                            right: '5px'
                          }}
                        >
                          +{dayTasks.length - 3}
                        </Badge>
                      )}
                    </Paper>
                  </Grid.Col>
                );
              })}
            </React.Fragment>
          ))}
        </Grid>
      </Box>
    );
  };

  // Génération du calendrier hebdomadaire
  const renderWeekCalendar = () => {
    // Obtenir le premier jour de la semaine (lundi)
    const firstDayOfWeek = new Date(currentDate);
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // Ajuster quand le jour est dimanche
    firstDayOfWeek.setDate(diff);
    
    // Générer les 7 jours de la semaine
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDayOfWeek);
      date.setDate(date.getDate() + i);
      weekDays.push(date);
    }
    
    // Noms des jours de la semaine
    const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    
    return (
      <Box>
        <Grid columns={7} gutter="xs">
          {dayNames.map((dayName, index) => (
            <Grid.Col key={index} span={1}>
              <Paper p="xs" style={{ backgroundColor: '#f9f9f9', textAlign: 'center' }}>
                <Text weight={500}>{dayName}</Text>
                <Text size="sm">
                  {weekDays[index].getDate()}/{weekDays[index].getMonth() + 1}
                </Text>
              </Paper>
            </Grid.Col>
          ))}
          
          <Grid.Col span={7}>
            <Paper p="md" style={{ height: '500px' }}>
              {weekDays.map((date, dateIndex) => {
                const dayTasks = getTasksForDay(date);
                return (
                  <Box key={dateIndex} mb="md">
                    <Text weight={500} mb="xs">
                      {dayNames[dateIndex]} {date.getDate()}/{date.getMonth() + 1}
                      {isToday(date) && <Badge ml="xs" color="blue">Aujourd'hui</Badge>}
                    </Text>
                    
                    {dayTasks.length > 0 ? (
                      dayTasks.map(task => (
                        <Paper
                          key={task.id}
                          p="sm"
                          mb="xs"
                          style={{
                            borderLeft: `4px solid ${getStatusColor(task.status)}`,
                            backgroundColor: '#f9f9f9'
                          }}
                        >
                          <Group position="apart">
                            <Text weight={500}>{task.title}</Text>
                            {task.priority && (
                              <Badge color={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                            )}
                          </Group>
                          <Text size="sm" color="dimmed" lineClamp={2}>
                            {task.description || 'Aucune description'}
                          </Text>
                        </Paper>
                      ))
                    ) : (
                      <Text color="dimmed" size="sm">Aucune tâche</Text>
                    )}
                  </Box>
                );
              })}
            </Paper>
          </Grid.Col>
        </Grid>
      </Box>
    );
  };

  return (
    <Box>
      <Group position="apart" mb="md">
        <Group>
          <ActionIcon onClick={viewMode === 'month' ? getPreviousMonth : getPreviousWeek} variant="filled">
            <IconChevronLeft size={16} />
          </ActionIcon>
          <Text weight={500}>
            {viewMode === 'month' 
              ? currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
              : `Semaine du ${new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1)).toLocaleDateString('fr-FR')}`
            }
          </Text>
          <ActionIcon onClick={viewMode === 'month' ? getNextMonth : getNextWeek} variant="filled">
            <IconChevronRight size={16} />
          </ActionIcon>
        </Group>
        
        <Group>
          <Button 
            variant={viewMode === 'month' ? 'filled' : 'outline'} 
            onClick={() => setViewMode('month')}
            size="xs"
          >
            Mois
          </Button>
          <Button 
            variant={viewMode === 'week' ? 'filled' : 'outline'} 
            onClick={() => setViewMode('week')}
            size="xs"
          >
            Semaine
          </Button>
        </Group>
      </Group>
      
      {viewMode === 'month' ? renderMonthCalendar() : renderWeekCalendar()}
    </Box>
  );
}
