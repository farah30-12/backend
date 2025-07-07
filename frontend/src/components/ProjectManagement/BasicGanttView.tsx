import React from 'react';
import { Box, Text, Paper, Group, Badge } from '@mantine/core';
import { Task } from './ProjectPage1';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Extended Task interface with the properties we need
interface ExtendedTask extends Task {
  startDate?: string;
  endDate?: string;
}

interface BasicGanttViewProps {
  tasks: ExtendedTask[];
  updateTask: (taskId: number, updatedTask: Partial<ExtendedTask>) => void;
}

export default function BasicGanttView({ tasks, updateTask }: BasicGanttViewProps) {
  // Obtenir les mois uniques pour l'en-tête
  const monthsSet = new Set<string>();

  tasks
    .filter(task => task.startDate && task.endDate)
    .forEach(task => {
      const startDate = new Date(task.startDate);
      const endDate = new Date(task.endDate);
      const startMonth = startDate.getMonth();
      const endMonth = endDate.getMonth();
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();

      for (let year = startYear; year <= endYear; year++) {
        const monthStart = year === startYear ? startMonth : 0;
        const monthEnd = year === endYear ? endMonth : 11;

        for (let month = monthStart; month <= monthEnd; month++) {
          monthsSet.add(`${year}-${month}`);
        }
      }
    });

  const months = Array.from(monthsSet).sort();

  // Obtenir la couleur en fonction du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return '#adb5bd';
      case 'in-progress': return '#228be6';
      case 'done': return '#40c057';
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

  return (
    <Paper p="md" radius="md" shadow="sm">
      <Text size="xl" weight={700} mb="md">Diagramme de Gantt</Text>

      {tasks.length === 0 ? (
        <Text color="dimmed" align="center" p="xl">
          Aucune tâche à afficher. Créez des tâches avec des dates pour les voir ici.
        </Text>
      ) : (
        <Box>
          {/* En-tête avec les mois */}
          <Group position="apart" mb="md">
            <Text weight={500} style={{ width: '200px' }}>Tâche</Text>
            <Group style={{ flex: 1 }}>
              {months.map(month => {
                const [year, monthIndex] = month.split('-').map(Number);
                return (
                  <Text
                    key={month}
                    size="sm"
                    weight={500}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      backgroundColor: '#f8f9fa',
                      padding: '5px',
                      borderRadius: '4px'
                    }}
                  >
                    {format(new Date(year, monthIndex), 'MMMM yyyy', { locale: fr })}
                  </Text>
                );
              })}
            </Group>
          </Group>

          {/* Tâches */}
          {tasks
            .filter(task => task.startDate && task.endDate)
            .map(task => {
              const startDate = new Date(task.startDate);
              const endDate = new Date(task.endDate);

              return (
                <Box
                  key={task.id}
                  mb="sm"
                  p="sm"
                  style={{
                    borderRadius: '4px',
                    border: '1px solid #e9ecef',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <Group position="apart">
                    <Group>
                      <Text weight={500}>{task.title}</Text>
                      <Badge color={task.status === 'done' ? 'green' : task.status === 'in-progress' ? 'blue' : 'gray'}>
                        {getStatusText(task.status)}
                      </Badge>
                    </Group>
                    <Text size="sm" color="dimmed">
                      {format(startDate, 'dd/MM/yyyy', { locale: fr })} - {format(endDate, 'dd/MM/yyyy', { locale: fr })}
                    </Text>
                  </Group>

                  <Box mt="sm" style={{ height: '20px', position: 'relative' }}>
                    <Box
                      style={{
                        position: 'absolute',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#f1f3f5',
                        borderRadius: '4px'
                      }}
                    />
                    <Box
                      style={{
                        position: 'absolute',
                        left: `${(startDate.getTime() - new Date(parseInt(months[0].split('-')[0]), parseInt(months[0].split('-')[1])).getTime()) / (new Date(parseInt(months[months.length-1].split('-')[0]), parseInt(months[months.length-1].split('-')[1])).getTime() - new Date(parseInt(months[0].split('-')[0]), parseInt(months[0].split('-')[1])).getTime()) * 100}%`,
                        width: `${(endDate.getTime() - startDate.getTime()) / (new Date(parseInt(months[months.length-1].split('-')[0]), parseInt(months[months.length-1].split('-')[1])).getTime() - new Date(parseInt(months[0].split('-')[0]), parseInt(months[0].split('-')[1])).getTime()) * 100}%`,
                        height: '100%',
                        backgroundColor: getStatusColor(task.status),
                        borderRadius: '4px'
                      }}
                    />
                  </Box>
                </Box>
              );
            })}
        </Box>
      )}
    </Paper>
  );
}
