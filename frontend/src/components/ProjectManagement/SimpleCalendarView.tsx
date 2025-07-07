import React, { useState } from 'react';
import { Paper, Text, Group, Badge, Box, Grid, Button, ActionIcon } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { Task } from './ProjectPage';

interface CalendarViewProps {
  tasks: Task[];
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
}

export default function SimpleCalendarView({ tasks, updateTask }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Fonction pour obtenir le nombre de jours dans le mois
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Fonction pour obtenir le jour de la semaine du premier jour du mois (0-6, 0 étant dimanche)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Fonction pour obtenir le mois précédent
  const getPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Fonction pour obtenir le mois suivant
  const getNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Fonction pour vérifier si une date est aujourd'hui
  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentMonth === today.getMonth() && 
           currentYear === today.getFullYear();
  };

  // Fonction pour obtenir les tâches d'une journée spécifique
  const getTasksForDay = (day: number) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      
      const dueDate = new Date(task.dueDate);
      return dueDate.getDate() === day && 
             dueDate.getMonth() === currentMonth && 
             dueDate.getFullYear() === currentYear;
    });
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

  // Génération du calendrier
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
    
    // Noms des jours de la semaine
    const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    
    // Tableau pour stocker tous les jours à afficher
    const days = [];
    
    // Ajouter les jours vides pour compléter la première semaine
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Ajouter les jours du mois
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    // Diviser les jours en semaines
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    // Compléter la dernière semaine si nécessaire
    const lastWeek = weeks[weeks.length - 1];
    if (lastWeek.length < 7) {
      for (let i = lastWeek.length; i < 7; i++) {
        lastWeek.push(null);
      }
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
              {week.map((day, dayIndex) => {
                if (day === null) {
                  return (
                    <Grid.Col key={`${weekIndex}-${dayIndex}`} span={1}>
                      <Paper
                        p="xs"
                        style={{
                          height: '100px',
                          backgroundColor: '#f9f9f9',
                          opacity: 0.5,
                          border: '1px solid #e9ecef'
                        }}
                      />
                    </Grid.Col>
                  );
                }
                
                const dayTasks = getTasksForDay(day);
                const isCurrentDay = isToday(day);
                
                return (
                  <Grid.Col key={`${weekIndex}-${dayIndex}`} span={1}>
                    <Paper
                      p="xs"
                      style={{
                        height: '100px',
                        backgroundColor: 'white',
                        border: isCurrentDay ? '2px solid #228be6' : '1px solid #e9ecef',
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
                        {day}
                      </Text>
                      
                      <Box style={{ marginTop: '5px', overflow: 'auto', maxHeight: '65px' }}>
                        {dayTasks.slice(0, 3).map(task => (
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

  // Noms des mois
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  return (
    <Box>
      <Group position="apart" mb="md">
        <Group>
          <ActionIcon onClick={getPreviousMonth} variant="filled">
            <IconChevronLeft size={16} />
          </ActionIcon>
          <Text weight={500}>
            {monthNames[currentMonth]} {currentYear}
          </Text>
          <ActionIcon onClick={getNextMonth} variant="filled">
            <IconChevronRight size={16} />
          </ActionIcon>
        </Group>
        
        <Button 
          variant="outline" 
          onClick={() => {
            const today = new Date();
            setCurrentMonth(today.getMonth());
            setCurrentYear(today.getFullYear());
          }}
          size="xs"
        >
          Aujourd'hui
        </Button>
      </Group>
      
      {renderCalendar()}
    </Box>
  );
}
