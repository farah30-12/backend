import React, { useState } from 'react';
import { Table, Checkbox, Badge, Group, Text, ActionIcon, Menu, ScrollArea, Avatar } from '@mantine/core';
import { IconDots, IconPencil, IconTrash, IconCopy, IconArrowUp, IconArrowDown, IconCalendar, IconUser, IconTag } from '@tabler/icons-react';
import { Task } from './ProjectPage';

// Extended Task interface with additional properties
interface ExtendedTask extends Task {
  assignees?: string[];
}

interface ListViewProps {
  tasks: ExtendedTask[];
  updateTask: (taskId: string, updatedTask: Partial<ExtendedTask>) => void;
}

export default function ListView({ tasks, updateTask }: ListViewProps) {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<keyof Task>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Fonction pour gérer la sélection d'une tâche
  const toggleTaskSelection = (taskId: number) => {
    const taskIdStr = taskId?.toString() || '';
    setSelectedTasks(prev =>
      prev.includes(taskIdStr)
        ? prev.filter(id => id !== taskIdStr)
        : [...prev, taskIdStr]
    );
  };

  // Fonction pour gérer la sélection de toutes les tâches
  const toggleAllSelection = () => {
    if (selectedTasks.length === tasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasks.map(task => task.id?.toString() || ''));
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
      case 'done': return 'Achevé';
      default: return status;
    }
  };

  // Trier les tâches
  const sortedTasks = [...tasks].sort(sortTasks);

  return (
    <ScrollArea style={{ height: '100%' }}>
      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th style={{ width: 40 }}>
              <Checkbox
                onChange={toggleAllSelection}
                checked={selectedTasks.length === tasks.length && tasks.length > 0}
                indeterminate={selectedTasks.length > 0 && selectedTasks.length < tasks.length}
              />
            </th>
            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('title')}>
              <Group spacing="xs">
                <span>Titre</span>
                {sortBy === 'title' && (
                  sortDirection === 'asc' ? <IconArrowUp size={14} /> : <IconArrowDown size={14} />
                )}
              </Group>
            </th>
            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('status')}>
              <Group spacing="xs">
                <span>Statut</span>
                {sortBy === 'status' && (
                  sortDirection === 'asc' ? <IconArrowUp size={14} /> : <IconArrowDown size={14} />
                )}
              </Group>
            </th>
            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('priority')}>
              <Group spacing="xs">
                <span>Priorité</span>
                {sortBy === 'priority' && (
                  sortDirection === 'asc' ? <IconArrowUp size={14} /> : <IconArrowDown size={14} />
                )}
              </Group>
            </th>
            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('dueDate')}>
              <Group spacing="xs">
                <span>Échéance</span>
                {sortBy === 'dueDate' && (
                  sortDirection === 'asc' ? <IconArrowUp size={14} /> : <IconArrowDown size={14} />
                )}
              </Group>
            </th>
            <th>Assignés</th>
            <th>Tags</th>
            <th style={{ width: 60 }}></th>
          </tr>
        </thead>
        <tbody>
          {sortedTasks.map((task) => (
            <tr key={task.id}>
              <td>
                <Checkbox
                  checked={selectedTasks.includes(task.id?.toString() || '')}
                  onChange={() => toggleTaskSelection(task.id || 0)}
                />
              </td>
              <td>
                <Text weight={500}>{task.title}</Text>
                <Text size="xs" color="dimmed" lineClamp={1}>
                  {task.description || 'Aucune description'}
                </Text>
              </td>
              <td>
                <Badge color={getStatusColor(task.status)}>
                  {getStatusText(task.status)}
                </Badge>
              </td>
              <td>
                {task.priority ? (
                  <Badge color={getPriorityColor(task.priority)} variant="filled" size="sm">
                    {task.priority}
                  </Badge>
                ) : (
                  <Text size="sm" color="dimmed">-</Text>
                )}
              </td>
              <td>
                {task.dueDate ? (
                  <Group spacing={5}>
                    <IconCalendar size={14} />
                    <Text size="sm">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </Text>
                  </Group>
                ) : (
                  <Text size="sm" color="dimmed">-</Text>
                )}
              </td>
              <td>
                {task.assignees.length > 0 ? (
                  <Avatar.Group spacing="sm">
                    {task.assignees.map((assignee, i) => (
                      <Avatar key={i} size="sm" radius="xl" color="blue">{assignee.charAt(0).toUpperCase()}</Avatar>
                    ))}
                  </Avatar.Group>
                ) : (
                  <Text size="sm" color="dimmed">-</Text>
                )}
              </td>
              <td>
                {task.tags.length > 0 ? (
                  <Group spacing={5}>
                    <IconTag size={14} />
                    {task.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} size="xs" variant="outline">{tag}</Badge>
                    ))}
                    {task.tags.length > 2 && <Badge size="xs">+{task.tags.length - 2}</Badge>}
                  </Group>
                ) : (
                  <Text size="sm" color="dimmed">-</Text>
                )}
              </td>
              <td>
                <Menu position="bottom-end" shadow="md">
                  <Menu.Target>
                    <ActionIcon>
                      <IconDots size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item icon={<IconPencil size={16} />}>Modifier</Menu.Item>
                    <Menu.Item icon={<IconCopy size={16} />}>Dupliquer</Menu.Item>
                    <Menu.Divider />
                    <Menu.Item color="red" icon={<IconTrash size={16} />}>Supprimer</Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </td>
            </tr>
          ))}
          {tasks.length === 0 && (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>
                <Text color="dimmed">Aucune tâche trouvée</Text>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </ScrollArea>
  );
}
