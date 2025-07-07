import React, { useState, useEffect } from 'react';
import { Tabs, Title, Button, Group, ActionIcon, TextInput, Box, Paper, Loader } from '@mantine/core';
import { IconList, IconTable, IconCalendar, IconChartBar, IconLayoutKanban, IconPlus, IconSearch, IconFilter, IconSettings } from '@tabler/icons-react';
import SimpleKanbanView from './SimpleKanbanView';
import EnhancedListView from './EnhancedListView';
import EnhancedCalendarView from './EnhancedCalendarView';
import ExactGanttChart from './ExactGanttChart';
import TaskForm from './TaskForm';
import { useAuth } from 'src/context/AuthContext';

// Types pour les tâches et projets
export interface Task {
  id?: number;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high' | '';
  assignedTo?: { id: number };
  dueDate?: string;
  createdAt?: string;
  tags?: string[];
  projectId?: number;
  estimatedTime?: number; // en heures
  createdBy?: { id: number };
}

export interface Project {
  id?: number;
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  createdBy?: { id: number };
  tasks?: Task[];
}

// Pas de données de démonstration - nous utilisons l'API pour récupérer les projets réels

export default function ProjectPage() {
  const { keycloak } = useAuth();
  const [activeTab, setActiveTab] = useState<string | null>('kanban');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [taskFormOpened, setTaskFormOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Fonction pour recharger les projets directement depuis l'URL
  const reloadProjects = async () => {
    if (!keycloak || !keycloak.token) {
      console.log("Keycloak non initialisé ou token non disponible");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Chargement des projets directement depuis l'URL...");

      // Utiliser directement l'URL que vous avez fournie
      // IMPORTANT: Suppression des en-têtes Cache-Control qui causent des problèmes CORS
      const response = await fetch('http://localhost:8081/api/projects', {
        headers: {
          'Authorization': `Bearer ${keycloak.token}`,
          'Accept': 'application/json'
          // Suppression des en-têtes Cache-Control pour éviter les problèmes CORS
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const responseText = await response.text();
      console.log("Réponse brute:", responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));

      if (!responseText.trim()) {
        console.log("Réponse vide");
        setProjects([]);
        setSelectedProject(null);
        return;
      }

      const data = JSON.parse(responseText);
      console.log("Projets récupérés:", data);

      if (Array.isArray(data) && data.length > 0) {
        console.log(`${data.length} projets trouvés`);

        // Vérifier et corriger les projets si nécessaire
        const validProjects = data.map((project, index) => {
          // S'assurer que l'ID est correctement défini
          if (project.id === undefined || project.id === null) {
            console.warn(`Projet ${index} sans ID trouvé:`, project);
            project.id = index + 1;
          }

          // S'assurer que tasks est un tableau
          if (!project.tasks) {
            project.tasks = [];
          }

          return project;
        });

        console.log("Projets validés:", validProjects.map(p => ({ id: p.id, name: p.name })));
        setProjects(validProjects);

        // Sélectionner le premier projet si aucun n'est sélectionné
        if (!selectedProject && validProjects.length > 0) {
          setSelectedProject(validProjects[validProjects.length - 1]); // ou aucun sélection si tu veux laisser à l'utilisateur
        }


      } else {
        console.log("Aucun projet récupéré ou format invalide");
        setProjects([]);
        setSelectedProject(null);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des projets:", error);
      setError(`Erreur lors du chargement des projets: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Charger les projets au chargement du composant
  useEffect(() => {
    if (keycloak && keycloak.token) {
      reloadProjects();
    }
  }, [keycloak, refreshCounter]);

  // Fonction pour mettre à jour une tâche
  const updateTask = (taskId: any, updatedTask: Partial<Task>) => {
    setProjects(prevProjects =>
      prevProjects.map(project => ({
        ...project,
        tasks: project.tasks?.map(task =>
          task.id === taskId ? { ...task, ...updatedTask } : task
        ) || []
      }))
    );
  };

  // Fonction pour ajouter une nouvelle tâche
  const addTask = (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    if (!selectedProject) return;

    const task: Task = {
      ...newTask,
      id: Math.floor(Math.random() * 10000) + 1, // ID aléatoire numérique
      createdAt: new Date().toISOString(),
    };

    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === selectedProject.id
          ? { ...project, tasks: [...(project.tasks || []), task] }
          : project
      )
    );
  };

  // Fonction pour créer un nouveau projet directement avec l'URL
  const createProject = async () => {
    if (!keycloak || !keycloak.token) {
      console.log("Keycloak non initialisé ou token non disponible");
      return;
    }

    const projectName = prompt("Nom du projet:");
    if (!projectName) return;

    const projectDescription = prompt("Description du projet:");
    if (!projectDescription) return;

    setLoading(true);

    try {
      // Créer un projet avec les propriétés requises par l'API
      const newProject = {
        name: projectName,
        description: projectDescription,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdBy: { id: 1 }
      };

      console.log("Création d'un nouveau projet:", newProject);

      // Utiliser directement l'URL que vous avez fournie
      // IMPORTANT: Pas d'en-têtes Cache-Control pour éviter les problèmes CORS
      const response = await fetch('http://localhost:8081/api/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${keycloak.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
          // Pas d'en-têtes Cache-Control pour éviter les problèmes CORS
        },
        body: JSON.stringify(newProject)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log("Réponse brute:", responseText);

      let createdProject: Project;
      if (responseText.trim()) {
        try {
          createdProject = JSON.parse(responseText);
          console.log("Projet créé et parsé avec succès:", createdProject);
        } catch (e) {
          console.warn("Impossible de parser la réponse:", e);
          createdProject = {
            ...newProject,
            id: Math.floor(Math.random() * 10000) + 1,
            tasks: []
          };
        }
      } else {
        console.log("Réponse vide, création d'un projet avec ID généré");
        createdProject = {
          ...newProject,
          id: Math.floor(Math.random() * 10000) + 1,
          tasks: []
        };
      }

      console.log("Projet créé:", createdProject);

      alert(`Projet "${projectName}" créé avec succès!`);

      // Attendre un peu pour s'assurer que le backend a eu le temps de traiter la création
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Forcer le rechargement des projets
      setRefreshCounter(prev => prev + 1);
    } catch (error) {
      console.error("Erreur lors de la création du projet:", error);
      alert(`Erreur lors de la création du projet: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // La fonction de débogage a été supprimée car elle n'est plus nécessaire

  // Filtrer les tâches en fonction de la recherche
  const filteredTasks = selectedProject
    ? selectedProject.tasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <Paper shadow="md" p="lg" radius="lg" style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
      {/* Formulaire de création de tâche */}
      <TaskForm
        opened={taskFormOpened}
        onClose={() => setTaskFormOpened(false)}
        onSubmit={addTask}
        initialStatus="todo"
        projectId={selectedProject?.id?.toString() || ''}
      />

      <Group position="apart" mb="md">
        <Title order={3} style={{ color: "#007074" }}>Gestion de Projets111</Title>
        <Group>
          <TextInput
            placeholder="Rechercher..."
            icon={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            style={{ width: 250 }}
          />
          <ActionIcon variant="filled" color="blue" size="lg">
            <IconFilter size={20} />
          </ActionIcon>
          <ActionIcon variant="filled" color="gray" size="lg">
            <IconSettings size={20} />
          </ActionIcon>
          <Button
            leftIcon={<IconPlus size={16} />}
            color="teal"
            onClick={() => setTaskFormOpened(true)}
            disabled={!selectedProject}
          >
            Nouvelle Tâche
          </Button>
        </Group>
      </Group>

      <Group position="apart" mb="md">
        <Tabs value={activeTab} onTabChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="kanban" icon={<IconLayoutKanban size={16} />}>Kanban</Tabs.Tab>
            <Tabs.Tab value="list" icon={<IconList size={16} />}>Liste</Tabs.Tab>
            <Tabs.Tab value="table" icon={<IconTable size={16} />}>Tableau</Tabs.Tab>
            <Tabs.Tab value="calendar" icon={<IconCalendar size={16} />}>Calendrier</Tabs.Tab>
            <Tabs.Tab value="gantt" icon={<IconChartBar size={16} />}>Gantt</Tabs.Tab>
          </Tabs.List>
        </Tabs>

        <Group>
          <select
            value={selectedProject?.id?.toString() || ''}
            onChange={(e) => {
              const projectId = parseInt(e.target.value);
              const project = projects.find(p => p.id === projectId);
              setSelectedProject(project || null);
            }}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
          >
            {projects.map(project => (
              <option key={project.id} value={project.id?.toString()}>{project.name}</option>
            ))}
          </select>
          <Button
            variant="outline"
            leftIcon={<IconPlus size={16} />}
            color="blue"
            onClick={createProject}
            loading={loading}
          >
            Nouveau Projet
          </Button>
        </Group>
      </Group>

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Loader size="md" />
          <div style={{ marginTop: '10px', color: '#666' }}>Chargement en cours...</div>
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: '#FFF3F3',
          color: '#D03958',
          padding: '10px 15px',
          borderRadius: '5px',
          marginBottom: '15px'
        }}>
          {error}
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          backgroundColor: '#f9f9f9',
          borderRadius: '10px',
          border: '1px dashed #ddd',
          margin: '20px 0'
        }}>
          <div style={{ fontSize: '50px', marginBottom: '15px', color: '#ccc' }}>📋</div>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Aucun projet trouvé</h3>
          <p style={{ margin: '0 0 20px 0', color: '#888' }}>
            Commencez par créer votre premier projet pour organiser vos tâches
          </p>
          <Button
            leftIcon={<IconPlus size={16} />}
            color="green"
            onClick={createProject}
          >
            + Nouveau Projet111
          </Button>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <Box style={{ flexGrow: 1, overflow: 'auto' }}>
          {activeTab === 'kanban' && <SimpleKanbanView tasks={filteredTasks} updateTask={updateTask} addTask={addTask} />}
          {activeTab === 'list' && <EnhancedListView tasks={filteredTasks} updateTask={updateTask} />}
          {activeTab === 'calendar' && <EnhancedCalendarView tasks={filteredTasks} updateTask={updateTask} />}
          {activeTab === 'table' && <div>Vue Tableau (à implémenter)</div>}
          {activeTab === 'gantt' && <ExactGanttChart tasks={filteredTasks} />}
        </Box>
      )}
    </Paper>
  );
}
