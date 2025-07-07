import React, { useState } from 'react';
import {
  Paper,
  Text,
  Group,
  Badge,
  TextInput,
  Textarea,
  Select,
  MultiSelect,
  Button,
  ActionIcon,
  Box,
  Divider,
  Avatar,
  Grid,
  Tabs
} from '@mantine/core';
import {
  IconCalendar,
  IconClock,
  IconTag,
  IconUser,
  IconTrash,
  IconPencil,
  IconCheck,
  IconX,
  IconMessageCircle,
  IconHistory,
  IconPaperclip
} from '@tabler/icons-react';
import { Task } from './ProjectPage';

// Extended Task interface with additional properties
interface ExtendedTask extends Task {
  assignees?: string[];
  tags?: string[];
  estimatedTime?: number;
}

interface TaskDetailsProps {
  task: ExtendedTask;
  updateTask: (taskId: string, updatedTask: Partial<ExtendedTask>) => void;
  onClose: () => void;
}

export default function SimpleTaskDetails({ task, updateTask, onClose }: TaskDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<ExtendedTask>({ ...task });
  const [activeTab, setActiveTab] = useState<string | null>('details');

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

  // Fonction pour sauvegarder les modifications
  const handleSave = () => {
    updateTask(task.id?.toString() || '', editedTask);
    setIsEditing(false);
  };

  // Fonction pour annuler les modifications
  const handleCancel = () => {
    setEditedTask({ ...task });
    setIsEditing(false);
  };

  // Fonction pour mettre à jour les champs du formulaire
  const handleChange = (field: keyof ExtendedTask, value: any) => {
    setEditedTask(prev => ({ ...prev, [field]: value }));
  };

  // Rendu du mode lecture
  const renderViewMode = () => (
    <Box>
      <Group position="apart" mb="md">
        <Text size="xl" weight={700}>{task.title}</Text>
        <Group>
          <ActionIcon variant="filled" color="blue" onClick={() => setIsEditing(true)}>
            <IconPencil size={16} />
          </ActionIcon>
          <ActionIcon variant="filled" color="red">
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Group>

      <Grid mb="md">
        <Grid.Col span={6}>
          <Group spacing="xs">
            <Text weight={500}>Statut:</Text>
            <Badge color={getStatusColor(task.status)} size="lg">
              {getStatusText(task.status)}
            </Badge>
          </Group>
        </Grid.Col>
        <Grid.Col span={6}>
          <Group spacing="xs">
            <Text weight={500}>Priorité:</Text>
            {task.priority ? (
              <Badge color={getPriorityColor(task.priority)} size="lg">
                {task.priority}
              </Badge>
            ) : (
              <Text color="dimmed">Non définie</Text>
            )}
          </Group>
        </Grid.Col>
      </Grid>

      <Divider my="md" />

      <Text weight={500} mb="xs">Description:</Text>
      <Paper p="md" withBorder mb="md">
        <Text>{task.description || 'Aucune description'}</Text>
      </Paper>

      <Grid>
        <Grid.Col span={6}>
          <Text weight={500} mb="xs">Date d'échéance:</Text>
          {task.dueDate ? (
            <Group spacing="xs">
              <IconCalendar size={16} />
              <Text>{new Date(task.dueDate).toLocaleDateString()}</Text>
            </Group>
          ) : (
            <Text color="dimmed">Non définie</Text>
          )}
        </Grid.Col>
        <Grid.Col span={6}>
          <Text weight={500} mb="xs">Temps estimé:</Text>
          {task.estimatedTime ? (
            <Group spacing="xs">
              <IconClock size={16} />
              <Text>{task.estimatedTime} heures</Text>
            </Group>
          ) : (
            <Text color="dimmed">Non défini</Text>
          )}
        </Grid.Col>
      </Grid>

      <Divider my="md" />

      <Text weight={500} mb="xs">Assignés:</Text>
      {task.assignees.length > 0 ? (
        <Group mb="md">
          {task.assignees.map((assignee, index) => (
            <Group key={index} spacing="xs">
              <Avatar color="blue" radius="xl">{assignee.charAt(0).toUpperCase()}</Avatar>
              <Text>{assignee}</Text>
            </Group>
          ))}
        </Group>
      ) : (
        <Text color="dimmed" mb="md">Aucun assigné</Text>
      )}

      <Text weight={500} mb="xs">Tags:</Text>
      {task.tags.length > 0 ? (
        <Group mb="md">
          {task.tags.map((tag, index) => (
            <Badge key={index} variant="outline">{tag}</Badge>
          ))}
        </Group>
      ) : (
        <Text color="dimmed" mb="md">Aucun tag</Text>
      )}

      <Divider my="md" />

      <Group position="apart">
        <Text size="xs" color="dimmed">
          Créée le {new Date(task.createdAt).toLocaleDateString()} à {new Date(task.createdAt).toLocaleTimeString()}
        </Text>
        <Text size="xs" color="dimmed">ID: {task.id}</Text>
      </Group>
    </Box>
  );

  // Rendu du mode édition
  const renderEditMode = () => (
    <Box>
      <TextInput
        label="Titre"
        value={editedTask.title}
        onChange={(e) => handleChange('title', e.currentTarget.value)}
        mb="md"
        required
      />

      <Select
        label="Statut"
        value={editedTask.status}
        onChange={(value) => handleChange('status', value)}
        data={[
          { value: 'todo', label: 'À faire' },
          { value: 'in-progress', label: 'En cours' },
          { value: 'done', label: 'Achevé' }
        ]}
        mb="md"
        required
      />

      <Select
        label="Priorité"
        value={editedTask.priority}
        onChange={(value) => handleChange('priority', value)}
        data={[
          { value: '', label: 'Non définie' },
          { value: 'low', label: 'Basse' },
          { value: 'medium', label: 'Moyenne' },
          { value: 'high', label: 'Haute' }
        ]}
        mb="md"
      />

      <Textarea
        label="Description"
        value={editedTask.description}
        onChange={(e) => handleChange('description', e.currentTarget.value)}
        minRows={4}
        mb="md"
      />

      <Grid mb="md">
        <Grid.Col span={6}>
          <TextInput
            label="Date d'échéance"
            type="date"
            value={editedTask.dueDate ? new Date(editedTask.dueDate).toISOString().split('T')[0] : ''}
            onChange={(e) => {
              const date = e.currentTarget.value ? new Date(e.currentTarget.value) : undefined;
              handleChange('dueDate', date);
            }}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Temps estimé (heures)"
            type="number"
            value={editedTask.estimatedTime?.toString() || ''}
            onChange={(e) => handleChange('estimatedTime', e.currentTarget.value ? Number(e.currentTarget.value) : undefined)}
          />
        </Grid.Col>
      </Grid>

      <MultiSelect
        label="Assignés"
        data={[
          { value: 'user1', label: 'Utilisateur 1' },
          { value: 'user2', label: 'Utilisateur 2' },
          { value: 'user3', label: 'Utilisateur 3' }
        ]}
        value={editedTask.assignees}
        onChange={(value) => handleChange('assignees', value)}
        mb="md"
        searchable
        creatable
        getCreateLabel={(query) => `+ Ajouter ${query}`}
        onCreate={(query) => {
          const item = { value: query, label: query };
          return item.value;
        }}
      />

      <MultiSelect
        label="Tags"
        data={[
          { value: 'important', label: 'Important' },
          { value: 'urgent', label: 'Urgent' },
          { value: 'bug', label: 'Bug' },
          { value: 'documentation', label: 'Documentation' }
        ]}
        value={editedTask.tags}
        onChange={(value) => handleChange('tags', value)}
        mb="md"
        searchable
        creatable
        getCreateLabel={(query) => `+ Ajouter ${query}`}
        onCreate={(query) => {
          const item = { value: query, label: query };
          return item.value;
        }}
      />

      <Group position="right" mt="xl">
        <Button variant="outline" color="red" onClick={handleCancel} leftIcon={<IconX size={16} />}>
          Annuler
        </Button>
        <Button color="green" onClick={handleSave} leftIcon={<IconCheck size={16} />}>
          Enregistrer
        </Button>
      </Group>
    </Box>
  );

  // Rendu des commentaires
  const renderComments = () => (
    <Box>
      <Text weight={500} mb="md">Commentaires</Text>
      <Paper p="md" withBorder mb="md">
        <Text color="dimmed">Aucun commentaire pour le moment.</Text>
      </Paper>
      <Group>
        <TextInput placeholder="Ajouter un commentaire..." style={{ flex: 1 }} />
        <Button>Envoyer</Button>
      </Group>
    </Box>
  );

  // Rendu de l'historique
  const renderHistory = () => (
    <Box>
      <Text weight={500} mb="md">Historique des modifications</Text>
      <Paper p="md" withBorder>
        <Text color="dimmed">Aucun historique disponible.</Text>
      </Paper>
    </Box>
  );

  // Rendu des pièces jointes
  const renderAttachments = () => (
    <Box>
      <Text weight={500} mb="md">Pièces jointes</Text>
      <Paper p="md" withBorder mb="md">
        <Text color="dimmed">Aucune pièce jointe.</Text>
      </Paper>
      <Button leftIcon={<IconPaperclip size={16} />}>Ajouter une pièce jointe</Button>
    </Box>
  );

  return (
    <Paper shadow="md" p="lg" style={{ height: '100%', overflow: 'auto' }}>
      {isEditing ? (
        renderEditMode()
      ) : (
        <>
          <Tabs value={activeTab} onTabChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="details" icon={<IconPencil size={16} />}>Détails</Tabs.Tab>
              <Tabs.Tab value="comments" icon={<IconMessageCircle size={16} />}>Commentaires</Tabs.Tab>
              <Tabs.Tab value="history" icon={<IconHistory size={16} />}>Historique</Tabs.Tab>
              <Tabs.Tab value="attachments" icon={<IconPaperclip size={16} />}>Pièces jointes</Tabs.Tab>
            </Tabs.List>
          </Tabs>

          <Box mt="md">
            {activeTab === 'details' && renderViewMode()}
            {activeTab === 'comments' && renderComments()}
            {activeTab === 'history' && renderHistory()}
            {activeTab === 'attachments' && renderAttachments()}
          </Box>
        </>
      )}
    </Paper>
  );
}
