import React from 'react';
import { Box, Text, Paper } from '@mantine/core';
import { Task } from './ProjectPage';

interface SimpleGanttViewProps {
  tasks: Task[];
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
}

export default function SimpleGanttView({ tasks, updateTask }: SimpleGanttViewProps) {
  return (
    <Paper p="md" radius="md" shadow="sm">
      <Text size="xl" weight={700} mb="md">Vue Gantt Simplifiée</Text>
      <Text mb="lg">Cette vue affiche un diagramme de Gantt simplifié pour tester le rendu.</Text>

      <Box style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {tasks.map(task => (
          <Box
            key={task.id}
            p="sm"
            style={{
              backgroundColor:
                task.status === 'done' ? '#40c057' :
                task.status === 'in-progress' ? '#228be6' :
                '#adb5bd',
              color: 'white',
              borderRadius: '4px',
              padding: '10px',
              marginBottom: '5px'
            }}
          >
            <Text weight={600}>{task.title}</Text>
            <Text size="sm">
              {task.createdAt && task.dueDate ?
                `${new Date(task.createdAt).toLocaleDateString()} - ${new Date(task.dueDate).toLocaleDateString()}` :
                'Pas de dates définies'}
            </Text>
          </Box>
        ))}

        {tasks.length === 0 && (
          <Text color="dimmed" align="center" p="xl">
            Aucune tâche à afficher. Créez des tâches avec des dates pour les voir ici.
          </Text>
        )}
      </Box>
    </Paper>
  );
}
