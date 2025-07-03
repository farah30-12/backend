import React, { useState } from 'react';
import { Table, Checkbox, Badge, Group, Text, ActionIcon, Menu, ScrollArea, Avatar, Paper, Tooltip } from '@mantine/core';
import { IconDots, IconPencil, IconTrash, IconCopy, IconArrowUp, IconArrowDown, IconCalendar, IconUser, IconTag, IconClock } from '@tabler/icons-react';
import { Task } from 'pages/projects';

interface TableViewProps {
  tasks: Task[];
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
}

export default function TableView({ tasks, updateTask }: TableViewProps) {
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

  // Fonction pour obtenir la couleur de priorité
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  // Fonction pour trier les tâches
  const sortTasks = (a: Task, b: Task) => {
    if (!a[sortBy] && !b[sortBy]) return 0;
    if (!a[sortBy]) return 1;
    if (!b[sortBy]) return -1;

    if (sortBy === 'dueDate') {
      const dateA = new Date(a.dueDate || '').getTime();
      const dateB = new Date(b.dueDate || '').getTime();
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

  // Trier les tâches
  const sortedTasks = [...tasks].sort(sortTasks);

  // Formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div style={{ height: '100%' }}>
      <Group position="apart" mb="md">
        <Text size="xl" weight={700}>Vue Tableau</Text>
        <Text size="sm" color="dimmed">
          {tasks.length} tâche{tasks.length !== 1 ? 's' : ''} au total
        </Text>
      </Group>

      <div style={{ height: 'calc(100% - 60px)', backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
        <ScrollArea style={{ height: '100%' }}>
          <Table striped highlightOnHover>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 }}>
            <tr>
              <th style={{ width: 40, padding: '15px 10px', borderBottom: '2px solid #e9ecef' }}>
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
              </th>
              <th
                style={{
                  cursor: 'pointer',
                  padding: '15px 10px',
                  borderBottom: sortBy === 'title' ? '2px solid #4263eb' : '2px solid #e9ecef',
                  color: sortBy === 'title' ? '#4263eb' : '#495057',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handleSort('title')}
              >
                <Group spacing="xs">
                  <span>Titre</span>
                  {sortBy === 'title' && (
                    sortDirection === 'asc' ? <IconArrowUp size={14} /> : <IconArrowDown size={14} />
                  )}
                </Group>
              </th>
              <th
                style={{
                  cursor: 'pointer',
                  padding: '15px 10px',
                  borderBottom: sortBy === 'status' ? '2px solid #4263eb' : '2px solid #e9ecef',
                  color: sortBy === 'status' ? '#4263eb' : '#495057',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handleSort('status')}
              >
                <Group spacing="xs">
                  <span>Statut</span>
                  {sortBy === 'status' && (
                    sortDirection === 'asc' ? <IconArrowUp size={14} /> : <IconArrowDown size={14} />
                  )}
                </Group>
              </th>
              <th
                style={{
                  cursor: 'pointer',
                  padding: '15px 10px',
                  borderBottom: sortBy === 'priority' ? '2px solid #4263eb' : '2px solid #e9ecef',
                  color: sortBy === 'priority' ? '#4263eb' : '#495057',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handleSort('priority')}
              >
                <Group spacing="xs">
                  <span>Priorité</span>
                  {sortBy === 'priority' && (
                    sortDirection === 'asc' ? <IconArrowUp size={14} /> : <IconArrowDown size={14} />
                  )}
                </Group>
              </th>
              <th
                style={{
                  cursor: 'pointer',
                  padding: '15px 10px',
                  borderBottom: sortBy === 'dueDate' ? '2px solid #4263eb' : '2px solid #e9ecef',
                  color: sortBy === 'dueDate' ? '#4263eb' : '#495057',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handleSort('dueDate')}
              >
                <Group spacing="xs">
                  <span>Échéance</span>
                  {sortBy === 'dueDate' && (
                    sortDirection === 'asc' ? <IconArrowUp size={14} /> : <IconArrowDown size={14} />
                  )}
                </Group>
              </th>
              <th style={{ padding: '15px 10px', borderBottom: '2px solid #e9ecef', fontWeight: 600, color: '#495057' }}>
                Assigné à
              </th>
              <th style={{ padding: '15px 10px', borderBottom: '2px solid #e9ecef', fontWeight: 600, color: '#495057' }}>
                Description
              </th>
              <th style={{ padding: '15px 10px', borderBottom: '2px solid #e9ecef', fontWeight: 600, color: '#495057' }}>
                Projet
              </th>
              <th style={{ padding: '15px 10px', borderBottom: '2px solid #e9ecef', fontWeight: 600, color: '#495057' }}>
                Créé le
              </th>
              <th style={{ width: 60, padding: '15px 10px', borderBottom: '2px solid #e9ecef', fontWeight: 600, color: '#495057' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.map((task) => (
              <tr
                key={task.id}
                style={{
                  backgroundColor: selectedTasks.includes(task.id?.toString() || '') ? '#edf2ff' : 'white',
                  transition: 'background-color 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}
              >
                <td style={{ padding: '12px 10px' }}>
                  <Checkbox
                    checked={selectedTasks.includes(task.id?.toString() || '')}
                    onChange={() => toggleTaskSelection(task.id || 0)}
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
                </td>
                <td style={{ padding: '12px 10px' }}>
                  <Text weight={600} size="sm" style={{ color: '#2c3e50' }}>{task.title}</Text>
                </td>
                <td style={{ padding: '12px 10px' }}>
                  <Badge
                    color={getStatusColor(task.status)}
                    variant="filled"
                    size="sm"
                    radius="md"
                    styles={{
                      root: {
                        textTransform: 'none',
                        padding: '3px 10px',
                        fontWeight: 500
                      }
                    }}
                  >
                    {getStatusText(task.status)}
                  </Badge>
                </td>
                <td style={{ padding: '12px 10px' }}>
                  {task.priority ? (
                    <Badge
                      color={getPriorityColor(task.priority)}
                      variant="light"
                      size="sm"
                      radius="md"
                      styles={{
                        root: {
                          textTransform: 'none',
                          padding: '3px 10px',
                          fontWeight: 500
                        }
                      }}
                    >
                      {task.priority === 'high' ? 'Élevée' :
                       task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                    </Badge>
                  ) : (
                    <Text size="sm" color="dimmed">-</Text>
                  )}
                </td>
                <td style={{ padding: '12px 10px' }}>
                  {task.dueDate ? (
                    <Group spacing={5} style={{
                      backgroundColor: '#e9ecef',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      display: 'inline-flex'
                    }}>
                      <IconCalendar size={14} color="#495057" />
                      <Text size="xs" weight={500} color="#495057">
                        {formatDate(task.dueDate)}
                      </Text>
                    </Group>
                  ) : (
                    <Text size="sm" color="dimmed">-</Text>
                  )}
                </td>
                <td style={{ padding: '12px 10px' }}>
                  {task.assignedTo ? (
                    <Group spacing={5}>
                      <Avatar size="sm" radius="xl" color="blue">
                        {task.assignedTo.id.toString().charAt(0)}
                      </Avatar>
                      <Text size="sm" weight={500} color="#4263eb">
                        ID: {task.assignedTo.id}
                      </Text>
                    </Group>
                  ) : (
                    <Text size="sm" color="dimmed" style={{ fontStyle: 'italic' }}>Non assigné</Text>
                  )}
                </td>
                <td style={{ padding: '12px 10px' }}>
                  <Tooltip label={task.description} multiline width={300}>
                    <Text size="sm" lineClamp={1} style={{ maxWidth: '150px' }}>
                      {task.description || 'Aucune description'}
                    </Text>
                  </Tooltip>
                </td>
                <td style={{ padding: '12px 10px' }}>
                  <Badge
                    color="indigo"
                    variant="dot"
                    size="sm"
                    styles={{
                      root: {
                        textTransform: 'none',
                        padding: '3px 10px',
                        fontWeight: 500
                      }
                    }}
                  >
                    {(task as any).projectName || `Projet #${task.projectId || 'N/A'}`}
                  </Badge>
                </td>
                <td style={{ padding: '12px 10px' }}>
                  <Text size="sm" color="#495057">
                    {formatDate(task.createdAt)}
                  </Text>
                </td>
                <td style={{ padding: '12px 10px' }}>
                  <Menu position="bottom-end" shadow="md">
                    <Menu.Target>
                      <ActionIcon
                        variant="light"
                        color="gray"
                        radius="xl"
                        style={{
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                        sx={() => ({
                          '&:hover': {
                            backgroundColor: '#e7f5ff',
                            color: '#4263eb'
                          }
                        })}
                      >
                        <IconDots size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        icon={<IconPencil size={16} />}
                        styles={{
                          item: {
                            '&:hover': {
                              backgroundColor: '#f1f3f5'
                            }
                          }
                        }}
                      >
                        Modifier
                      </Menu.Item>
                      <Menu.Item
                        icon={<IconCopy size={16} />}
                        styles={{
                          item: {
                            '&:hover': {
                              backgroundColor: '#f1f3f5'
                            }
                          }
                        }}
                      >
                        Dupliquer
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item
                        color="red"
                        icon={<IconTrash size={16} />}
                        styles={{
                          item: {
                            '&:hover': {
                              backgroundColor: '#fff5f5'
                            }
                          }
                        }}
                      >
                        Supprimer
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    border: '1px dashed #ced4da',
                    padding: '24px',
                    borderRadius: '8px'
                  }}>
                    <Text size="lg" weight={600} color="#6c757d" mb={10}>Aucune tâche trouvée</Text>
                    <Text size="sm" color="#adb5bd">
                      Sélectionnez un projet ou créez une nouvelle tâche pour commencer
                    </Text>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </ScrollArea>
      </div>
    </div>
  );
}
