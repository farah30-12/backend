import React, { useState } from 'react';
import ExactGanttChart from 'src/components/ProjectManagement/ExactGanttChart';
import { Task } from '@app/components/ProjectManagement/ProjectPage1';

// Extended Task interface with the properties needed for Gantt view
interface ExtendedTask extends Task {
  startDate?: string;
  endDate?: string;
}

export default function GanttStandalonePage() {
  const [tasks, setTasks] = useState<ExtendedTask[]>([
    {
      id: 1,
      title: 'Task 01',
      description: 'Description de la tâche 1',
      status: 'in-progress',
      priority: 'medium',
      startDate: '2023-01-01',
      endDate: '2023-02-15',
      dueDate: '2023-02-15',
      createdAt: '2023-01-01',
      assignedTo: { id: 1 },
      projectId: 1,
    },
    {
      id: 2,
      title: 'Task 02',
      description: 'Description de la tâche 2',
      status: 'done',
      priority: 'high',
      startDate: '2023-01-15',
      endDate: '2023-02-10',
      dueDate: '2023-02-10',
      createdAt: '2023-01-15',
      assignedTo: { id: 2 },
      projectId: 1,
    },
    {
      id: 3,
      title: 'Task 03',
      description: 'Description de la tâche 3',
      status: 'todo',
      priority: 'low',
      startDate: '2023-02-01',
      endDate: '2023-02-20',
      dueDate: '2023-02-20',
      createdAt: '2023-02-01',
      assignedTo: { id: 3 },
      projectId: 1,
    },
    {
      id: 4,
      title: 'Task 04',
      description: 'Description de la tâche 4',
      status: 'in-progress',
      priority: 'medium',
      startDate: '2023-03-01',
      endDate: '2023-04-15',
      dueDate: '2023-04-15',
      createdAt: '2023-03-01',
      assignedTo: { id: 1 },
      projectId: 1,
    },
    {
      id: 5,
      title: 'Task 05',
      description: 'Description de la tâche 5',
      status: 'todo',
      priority: 'high',
      startDate: '2023-05-01',
      endDate: '2023-06-30',
      dueDate: '2023-06-30',
      createdAt: '2023-05-01',
      assignedTo: { id: 2 },
      projectId: 1,
    },
    {
      id: 6,
      title: 'Task 06',
      description: 'Description de la tâche 6',
      status: 'done',
      priority: 'medium',
      startDate: '2023-06-01',
      endDate: '2023-07-15',
      dueDate: '2023-07-15',
      createdAt: '2023-06-01',
      assignedTo: { id: 3 },
      projectId: 1,
    },
    {
      id: 7,
      title: 'Task 07',
      description: 'Description de la tâche 7',
      status: 'in-progress',
      priority: 'low',
      startDate: '2023-03-15',
      endDate: '2023-05-30',
      dueDate: '2023-05-30',
      createdAt: '2023-03-15',
      assignedTo: { id: 1 },
      projectId: 1,
    },
    {
      id: 8,
      title: 'Task 08',
      description: 'Description de la tâche 8',
      status: 'todo',
      priority: 'high',
      startDate: '2023-06-15',
      endDate: '2023-09-30',
      dueDate: '2023-09-30',
      createdAt: '2023-06-15',
      assignedTo: { id: 2 },
      projectId: 1,
    },
    {
      id: 9,
      title: 'Task 09',
      description: 'Description de la tâche 9',
      status: 'in-progress',
      priority: 'medium',
      startDate: '2023-09-01',
      endDate: '2023-12-15',
      dueDate: '2023-12-15',
      createdAt: '2023-09-01',
      assignedTo: { id: 3 },
      projectId: 1,
    },
    {
      id: 10,
      title: 'Task 10',
      description: 'Description de la tâche 10',
      status: 'done',
      priority: 'low',
      startDate: '2023-04-01',
      endDate: '2023-07-31',
      dueDate: '2023-07-31',
      createdAt: '2023-04-01',
      assignedTo: { id: 1 },
      projectId: 1,
    }
  ]);

  return (
    <div style={{ padding: 20 }}>
      <ExactGanttChart tasks={tasks} />
    </div>
  );
}
