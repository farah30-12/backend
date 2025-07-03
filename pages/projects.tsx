import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import TaskForm from '../components/TaskForm';
import { Project, Task, User, projectApi, taskApi } from '../services/api';
import { useAuth } from '../src/context/AuthContext';
import withAuth from '../src/helpers/HOC/withAuth';
import { testBackendConnection } from '../services/auth';
import ExactGanttChart from 'src/components/ProjectManagement/ExactGanttChart';
import SimpleKanbanView from 'src/components/ProjectManagement/SimpleKanbanView';

// Utiliser l'interface User de l'API importée ci-dessus

// Importer l'interface ExtendedTask pour le typage
interface ExtendedTask {
  id: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  projectId?: number;
  project?: { id: number };
  createdAt?: string;
  updatedAt?: string;
  assignees?: string[];
  tags?: string[];
  estimatedTime?: number;
  projectName?: string;
  createdBy?: User;
  assignedTo?: User;
  isPersonalTodo?: boolean;
}

// Fonction utilitaire pour obtenir l'ID du projet d'une tâche, quelle que soit sa structure
const getProjectIdFromTask = (task: Task) =>
  task.project?.id || (typeof task.project === 'number' ? task.project : null) || (task as any).projectId || null;

const ProjectsPage: NextPage = () => {
  const { isAuthenticated, keycloak } = useAuth();
  const [activeTab, setActiveTab] = useState('kanban');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskInitialStatus, setTaskInitialStatus] = useState('À faire');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [taskToEdit, setTaskToEdit] = useState<ExtendedTask | null>(null);

  // Initialiser les dates par défaut (aujourd'hui et dans un mois)
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const [projectStartDate, setProjectStartDate] = useState(formatDateForInput(today));
  const [projectEndDate, setProjectEndDate] = useState(formatDateForInput(nextMonth));
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour le calendrier
  const [currentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());

  // Fonction pour recharger les projets
  const reloadProjects = async () => {
    try {
      if (!isAuthenticated || !keycloak) {
        console.log("Utilisateur non authentifié ou keycloak non initialisé");
        return;
      }

      console.log("État d'authentification:", isAuthenticated);
      console.log("Keycloak initialisé:", !!keycloak);
      console.log("Token disponible:", !!keycloak.token);

      // Rafraîchir le token si nécessaire
      try {
        await keycloak.updateToken(30);
        console.log("Token rafraîchi avec succès");
      } catch (refreshError) {
        console.error("Erreur lors du rafraîchissement du token:", refreshError);
        // Rediriger vers la page de connexion si le rafraîchissement échoue
        window.location.href = '/';
        return;
      }

      console.log("Token après rafraîchissement:", keycloak.token ? "Disponible" : "Non disponible");

      // Tester la connexion au backend avec le préfixe Bearer
      let connectionTest = await testBackendConnection(keycloak.token, true);
      console.log("Test de connexion au backend avec Bearer:", connectionTest ? "Réussi" : "Échoué");

      // Si ça échoue, essayer sans le préfixe Bearer
      if (!connectionTest) {
        console.log("Tentative de connexion sans préfixe Bearer...");
        connectionTest = await testBackendConnection(keycloak.token, false);
        console.log("Test de connexion au backend sans Bearer:", connectionTest ? "Réussi" : "Échoué");
      }

      if (!connectionTest) {
        setError("Impossible de se connecter au backend. Veuillez vérifier votre connexion et vos identifiants.");
        return;
      }

      // Utiliser le mode d'authentification qui a fonctionné
      const useBearer = await testBackendConnection(keycloak.token, true);

      // Effacer les projets existants pour éviter les problèmes de mise à jour partielle
      setProjects([]);
      setSelectedProject(null);

      setLoading(true);
      console.log("Appel API en cours pour récupérer les projets avec useBearer =", useBearer);

      // Ajouter un délai plus long pour s'assurer que le backend a eu le temps de traiter les modifications
      console.log("Attente de 1 seconde pour s'assurer que le backend est prêt...");
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        // Récupérer les projets
        let data = await projectApi.getAll(keycloak.token, useBearer);
        console.log("Projets récupérés (brut):", data);
        console.log("Nombre de projets récupérés:", data.length);

        // Vérifier et corriger les projets si nécessaire
        data = data.map((project, index) => {
          // Vérifier si l'ID est défini
          if (project.id === undefined || project.id === null) {
            console.warn(`Projet ${index} sans ID trouvé:`, project);
            // Générer un ID temporaire
            project.id = index + 1;
            console.log(`ID généré pour le projet ${index}:`, project.id);
          }

          // Vérifier les autres propriétés requises
          if (!project.name) {
            project.name = `Projet ${project.id || index + 1}`;
          }

          if (!project.description) {
            project.description = `Description du projet ${project.id || index + 1}`;
          }

          if (!project.startDate) {
            project.startDate = new Date().toISOString().split('T')[0];
          }

          if (!project.endDate) {
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);
            project.endDate = endDate.toISOString().split('T')[0];
          }

          if (!project.createdBy || !project.createdBy.id) {
            project.createdBy = { id: 1 };
          }

          return project;
        });

        // Afficher les détails de chaque projet après correction
        console.log("Projets après correction:");
        data.forEach((project, index) => {
          console.log(`Projet ${index + 1}:`, {
            id: project.id,
            name: project.name,
            description: project.description,
            startDate: project.startDate,
            endDate: project.endDate,
            tasksCount: project.tasks ? project.tasks.length : 0
          });
        });

        // Si aucun projet n'est récupéré, créer un projet de test
        if (data.length === 0) {
          console.log("Aucun projet trouvé, création d'un projet de test...");

          // Créer un projet de test
          const today = new Date();
          const nextMonth = new Date(today);
          nextMonth.setMonth(today.getMonth() + 1);

          const testProject: Project = {
            name: "Projet de test",
            description: "Projet créé automatiquement pour tester la fonctionnalité de tâches",
            startDate: today.toISOString().split('T')[0],
            endDate: nextMonth.toISOString().split('T')[0],
            createdBy: {
              id: 1
            }
          };

          try {
            const createdProject = await projectApi.create(testProject, keycloak.token, useBearer);
            if (createdProject) {
              console.log("Projet de test créé avec succès:", createdProject);

              // Vérifier que l'ID est défini
              if (createdProject.id === undefined || createdProject.id === null) {
                console.warn("Projet créé sans ID, génération d'un ID");
                (createdProject as any).id = 1;
              }

              setProjects([createdProject]);
              setSelectedProject(createdProject);
              // S'assurer que l'état de chargement est mis à jour
              setLoading(false);
            }
          } catch (createError) {
            console.error("Erreur lors de la création du projet de test:", createError);

            // Créer un projet local en cas d'erreur
            const localProject: Project = {
              id: 1,
              name: "Projet de test (local)",
              description: "Projet créé localement suite à une erreur",
              startDate: today.toISOString().split('T')[0],
              endDate: nextMonth.toISOString().split('T')[0],
              createdBy: {
                id: 1
              }
            };

            console.log("Création d'un projet local:", localProject);
            setProjects([localProject]);
            setSelectedProject(localProject);

            // S'assurer que l'état de chargement est mis à jour même en cas d'erreur
            setLoading(false);
          }
        } else {
          console.log("Projets récupérés avec succès, mise à jour de l'état");

          // Vérifier si les projets ont des IDs valides
          const validProjects = data.filter(project => project.id !== undefined && project.id !== null);
          console.log(`${validProjects.length} projets valides sur ${data.length}`);

          if (validProjects.length > 0) {
            setProjects(validProjects);

            // Sélectionner automatiquement le premier projet
            if (!selectedProject) {
              setSelectedProject(validProjects[0]);
              console.log("Projet sélectionné automatiquement:", validProjects[0]);
            }
          } else {
            console.warn("Aucun projet avec ID valide trouvé");

            // Créer un projet local
            const localProject: Project = {
              id: 1,
              name: "Projet par défaut",
              description: "Projet créé localement car aucun projet valide n'a été trouvé",
              startDate: new Date().toISOString().split('T')[0],
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              createdBy: {
                id: 1
              }
            };

            console.log("Création d'un projet local par défaut:", localProject);
            setProjects([localProject]);
            setSelectedProject(localProject);
          }

          // S'assurer que l'état de chargement est mis à jour
          setLoading(false);
        }

        setError(null);
      } catch (apiError) {
        console.error("Erreur lors de la récupération des projets:", apiError);
        setError('Erreur lors du chargement des projets');
        setLoading(false);
      }
    } catch (err) {
      console.error("Erreur détaillée:", err);
      setError('Erreur lors du chargement des projets');
      setLoading(false);
    }
  };

  // État pour forcer le rechargement des projets
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Fonction pour forcer le rechargement des projets
  const forceRefresh = () => {
    console.log("Forçage du rechargement des projets...");
    setRefreshCounter(prev => prev + 1);
  };

  // Charger les projets au chargement de la page ou lorsque refreshCounter change
  useEffect(() => {
    if (isAuthenticated && keycloak) {
      console.log(`Démarrage de la récupération des projets... (refresh #${refreshCounter})`);
      reloadProjects();
    } else {
      console.log("Authentification non complète, impossible de récupérer les projets");
    }
  }, [isAuthenticated, keycloak, refreshCounter]);

  // La fonction handleReloadProjects a été supprimée car elle n'est plus utilisée

  // Charger les tâches lorsqu'un projet est sélectionné
  useEffect(() => {
    if (selectedProject?.id && isAuthenticated && keycloak) {
      const fetchTasks = async () => {
        try {
          // Rafraîchir le token si nécessaire
          await keycloak.updateToken(30);

          setLoading(true);

          // Déterminer le mode d'authentification qui fonctionne
          const useBearer = await testBackendConnection(keycloak.token, true);
          console.log("Récupération des tâches avec useBearer =", useBearer);

          try {
            const data = await taskApi.getByProject(selectedProject.id, keycloak.token, useBearer);
            console.log("Tâches récupérées:", data);
            console.log("Nombre de tâches récupérées:", data.length);

            // Afficher les détails de chaque tâche pour le débogage
            data.forEach((task, index) => {
              console.log(`Tâche ${index + 1}:`, {
                id: task.id,
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                startDate: task.startDate,
                endDate: task.endDate,
                projectId: task.project?.id || (task as any).projectId
              });
            });

            // S'assurer que chaque tâche a une référence correcte au projet
            const processedTasks = data.map(task => {
              let processedTask = { ...task };

              // Si la tâche n'a pas de référence au projet, l'ajouter
              if (!processedTask.project && !(processedTask as any).projectId) {
                processedTask.project = { id: selectedProject.id };
                console.log(`Tâche ${processedTask.id} - Ajout de la référence au projet ${selectedProject.id}`);
              }

              // Si la tâche a une référence au projet sous forme de nombre, la convertir en objet
              if (typeof processedTask.project === 'number') {
                const projectId = processedTask.project;
                processedTask.project = { id: projectId };
                console.log(`Tâche ${processedTask.id} - Conversion de la référence au projet de ${projectId} (nombre) à objet`);
              }

              // Si la tâche a une référence au projet sous forme de projectId, l'ajouter également sous forme d'objet project
              if (!processedTask.project && (processedTask as any).projectId) {
                const projectId = (processedTask as any).projectId;
                processedTask.project = { id: projectId };
                console.log(`Tâche ${processedTask.id} - Conversion de projectId ${projectId} à objet project`);
              }

              // Vérifier si la tâche appartient bien au projet sélectionné
              const projectId = processedTask.project?.id || (processedTask as any).projectId;
              const belongsToSelectedProject = projectId === selectedProject.id;

              if (!belongsToSelectedProject) {
                console.warn(`Tâche ${processedTask.id} - N'appartient PAS au projet sélectionné ${selectedProject.id}, mais au projet ${projectId}`);
                // Forcer l'association au projet sélectionné
                processedTask.project = { id: selectedProject.id };
                console.log(`Tâche ${processedTask.id} - Association forcée au projet ${selectedProject.id}`);
              } else {
                console.log(`Tâche ${processedTask.id} - Appartient bien au projet sélectionné ${selectedProject.id}`);
              }

              return processedTask;
            });

            console.log("Tâches traitées:", processedTasks);
            console.log(`Total: ${processedTasks.length} tâches pour le projet ${selectedProject.id}`);
            setTasks(processedTasks);
            setError(null);
          } catch (apiError) {
            console.error("Erreur lors de la récupération des tâches:", apiError);
            setError('Erreur lors du chargement des tâches');
          }
        } catch (err) {
          setError('Erreur lors du chargement des tâches');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchTasks();
    }
  }, [selectedProject, isAuthenticated, keycloak]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Fonctions pour le calendrier
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Fonction pour générer les jours du calendrier
  const generateCalendarDays = () => {
    // Premier jour du mois
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    // Dernier jour du mois
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Jour de la semaine du premier jour (0 = dimanche, 1 = lundi, etc.)
    const firstDayWeekday = firstDayOfMonth.getDay();
    // Nombre de jours dans le mois
    const daysInMonth = lastDayOfMonth.getDate();

    // Tableau pour stocker tous les jours à afficher
    const calendarDays = [];

    // Ajuster pour commencer par lundi (0)
    const startingDayOfWeek = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;

    // Ajouter les jours du mois précédent pour compléter la première semaine
    const lastDayPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    for (let i = startingDayOfWeek; i > 0; i--) {
      calendarDays.push({
        day: lastDayPrevMonth - i + 1,
        month: currentMonth - 1,
        year: currentMonth === 0 ? currentYear - 1 : currentYear,
        isCurrentMonth: false
      });
    }

    // Ajouter les jours du mois actuel
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push({
        day: i,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true
      });
    }

    // Ajouter les jours du mois suivant pour compléter la dernière semaine
    const remainingDays = 42 - calendarDays.length; // 6 semaines x 7 jours = 42
    for (let i = 1; i <= remainingDays; i++) {
      calendarDays.push({
        day: i,
        month: currentMonth + 1,
        year: currentMonth === 11 ? currentYear + 1 : currentYear,
        isCurrentMonth: false
      });
    }

    return calendarDays;
  };

  // Fonction pour obtenir les tâches pour une date spécifique
  const getTasksForDate = (day: number, month: number, year: number) => {
    const date = new Date(year, month, day);
    const dateString = date.toISOString().split('T')[0]; // Format YYYY-MM-DD

    return tasks
      // Filtrer d'abord pour ne garder que les tâches du projet sélectionné
      .filter(task => selectedProject && getProjectIdFromTask(task) === selectedProject.id)
      // Ensuite, filtrer par date
      .filter(task => {
        const taskStartDate = new Date(task.startDate);
        const taskEndDate = new Date(task.endDate);

        // Vérifier si la date est comprise entre la date de début et la date de fin de la tâche
        return (
          dateString >= taskStartDate.toISOString().split('T')[0] &&
          dateString <= taskEndDate.toISOString().split('T')[0]
        );
      });
  };

  // Fonction pour déterminer la couleur des tâches en fonction de leur priorité
  const getTaskColor = (priority: string) => {
    switch (priority) {
      case 'Élevée':
        return '#dc3545'; // Rouge
      case 'Moyenne':
        return '#fd7e14'; // Orange
      case 'Faible':
        return '#28a745'; // Vert
      default:
        return '#6c757d'; // Gris
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !keycloak) {
      setError("Vous devez être authentifié pour créer un projet");
      return;
    }

    // Vérifier que tous les champs sont remplis
    if (!projectName || !projectDescription || !projectStartDate || !projectEndDate) {
      setError("Veuillez remplir tous les champs du formulaire");
      return;
    }

    // Rafraîchir le token si nécessaire
    await keycloak.updateToken(30);

    const newProject: Project = {
      name: projectName,
      description: projectDescription,
      startDate: projectStartDate,
      endDate: projectEndDate,
      createdBy: {
        id: 1 // ID utilisateur actuel (à remplacer par l'ID réel)
      }
    };

    console.log("Création d'un nouveau projet:", newProject);

    setLoading(true);
    try {
      // Déterminer le mode d'authentification qui fonctionne
      const useBearer = await testBackendConnection(keycloak.token, true);
      console.log("Création de projet avec useBearer =", useBearer);

      try {
        const createdProject = await projectApi.create(newProject, keycloak.token, useBearer);
        if (createdProject) {
          console.log("Projet créé avec succès:", createdProject);

          // S'assurer que l'ID est correctement défini
          if (createdProject.id === undefined || createdProject.id === null) {
            console.warn("Projet créé sans ID, génération d'un ID");
            createdProject.id = Math.floor(Math.random() * 10000);
          }

          // Ajouter le nouveau projet à la liste existante
          const updatedProjects = [...projects, createdProject];
          console.log("Liste des projets mise à jour:", updatedProjects);
          setProjects(updatedProjects);

          // Sélectionner automatiquement le projet créé
          setSelectedProject(createdProject);

          // Afficher un message de succès
          alert("Projet créé avec succès !");

          // Recharger tous les projets pour s'assurer que la liste est à jour
          setTimeout(() => {
            console.log("Rechargement des projets après création...");
            forceRefresh(); // Utiliser forceRefresh pour garantir un rechargement complet
          }, 1000);
        }
      } catch (apiError) {
        console.error("Erreur lors de la création du projet:", apiError);
        setError('Erreur lors de la création du projet');
      }
    } catch (err) {
      setError('Erreur lors de la création du projet');
      console.error(err);
    } finally {
      setLoading(false);
    }

    // Réinitialiser le formulaire
    setProjectName('');
    setProjectDescription('');
    setProjectStartDate('');
    setProjectEndDate('');
    setShowProjectForm(false);
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setActiveTab('kanban');
  };

  // État pour le modal de modification de projet
  const [showEditProjectForm, setShowEditProjectForm] = useState(false);
  const [editProjectId, setEditProjectId] = useState<number | null>(null);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectDescription, setEditProjectDescription] = useState('');
  const [editProjectStartDate, setEditProjectStartDate] = useState('');
  const [editProjectEndDate, setEditProjectEndDate] = useState('');

  // Fonction pour modifier un projet
  const handleEditProject = async (project: Project) => {
    // Initialiser le formulaire avec les données du projet
    setEditProjectId(project.id || null);
    setEditProjectName(project.name);
    setEditProjectDescription(project.description);
    setEditProjectStartDate(project.startDate || '');
    setEditProjectEndDate(project.endDate || '');
    setShowEditProjectForm(true);
  };

  // Fonction pour soumettre la modification d'un projet
  const handleSubmitEditProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !keycloak) {
      setError("Vous devez être authentifié pour modifier un projet");
      return;
    }

    // Vérifier que tous les champs sont remplis
    if (!editProjectName || !editProjectDescription || !editProjectStartDate || !editProjectEndDate) {
      setError("Veuillez remplir tous les champs du formulaire");
      return;
    }

    // Rafraîchir le token si nécessaire
    await keycloak.updateToken(30);

    const updatedProject: Project = {
      id: editProjectId,
      name: editProjectName,
      description: editProjectDescription,
      startDate: editProjectStartDate,
      endDate: editProjectEndDate,
      createdBy: {
        id: 1 // ID utilisateur actuel (à remplacer par l'ID réel)
      }
    };

    console.log("Modification du projet:", updatedProject);

    setLoading(true);
    try {
      // Déterminer le mode d'authentification qui fonctionne
      const useBearer = await testBackendConnection(keycloak.token, true);
      console.log("Modification de projet avec useBearer =", useBearer);

      try {
        // Appel à l'API pour modifier le projet
        const response = await fetch(`http://localhost:8081/api/projects/${editProjectId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${keycloak.token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(updatedProject)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
        }

        const updatedProjectData = await response.json();
        console.log("Projet modifié avec succès:", updatedProjectData);

        // Mettre à jour la liste des projets
        const updatedProjects = projects.map(p =>
          p.id === editProjectId ? { ...p, ...updatedProject } : p
        );
        setProjects(updatedProjects);

        // Mettre à jour le projet sélectionné si c'est celui qui a été modifié
        if (selectedProject && selectedProject.id === editProjectId) {
          setSelectedProject({ ...selectedProject, ...updatedProject });
        }

        // Afficher un message de succès
        alert("Projet modifié avec succès !");

        // Recharger tous les projets pour s'assurer que la liste est à jour
        setTimeout(() => {
          console.log("Rechargement des projets après modification...");
          forceRefresh();
        }, 1000);
      } catch (apiError) {
        console.error("Erreur lors de la modification du projet:", apiError);
        setError('Erreur lors de la modification du projet');
      }
    } catch (err) {
      setError('Erreur lors de la modification du projet');
      console.error(err);
    } finally {
      setLoading(false);
      setShowEditProjectForm(false);
    }
  };

  // Fonction pour supprimer un projet
  const handleDeleteProject = async (projectId: number) => {
    if (!isAuthenticated || !keycloak) {
      setError("Vous devez être authentifié pour supprimer un projet");
      return;
    }

    // Demander confirmation avant de supprimer
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.")) {
      return;
    }

    // Rafraîchir le token si nécessaire
    await keycloak.updateToken(30);

    setLoading(true);
    try {
      // Déterminer le mode d'authentification qui fonctionne
      const useBearer = await testBackendConnection(keycloak.token, true);
      console.log("Suppression de projet avec useBearer =", useBearer);

      try {
        // Appel à l'API pour supprimer le projet
        const response = await fetch(`http://localhost:8081/api/projects/${projectId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${keycloak.token}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
        }

        console.log("Projet supprimé avec succès");

        // Mettre à jour la liste des projets
        const updatedProjects = projects.filter(p => p.id !== projectId);
        setProjects(updatedProjects);

        // Si le projet supprimé était sélectionné, désélectionner
        if (selectedProject && selectedProject.id === projectId) {
          setSelectedProject(null);
        }

        // Afficher un message de succès
        alert("Projet supprimé avec succès !");

        // Recharger tous les projets pour s'assurer que la liste est à jour
        setTimeout(() => {
          console.log("Rechargement des projets après suppression...");
          forceRefresh();
        }, 1000);
      } catch (apiError) {
        console.error("Erreur lors de la suppression du projet:", apiError);
        setError('Erreur lors de la suppression du projet');
      }
    } catch (err) {
      setError('Erreur lors de la suppression du projet');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer une tâche
  const handleDeleteTask = async (taskId: number) => {
    if (!isAuthenticated || !keycloak) {
      setError("Vous devez être authentifié pour supprimer une tâche");
      return;
    }

    try {
      // Rafraîchir le token si nécessaire
      await keycloak.updateToken(30);

      console.log(`Suppression de la tâche ${taskId}`);

      // Déterminer le mode d'authentification qui fonctionne
      const useBearer = await testBackendConnection(keycloak.token, true);
      console.log("Suppression de tâche avec useBearer =", useBearer);

      // Utiliser fetch directement
      const response = await fetch(`http://localhost:8081/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': useBearer ? `Bearer ${keycloak.token}` : keycloak.token,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Supprimer la tâche de l'état local
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        console.log(`Tâche ${taskId} supprimée avec succès`);

        // Afficher un message de succès
        alert("Tâche supprimée avec succès !");
      } else {
        const errorText = await response.text();
        console.error(`Erreur lors de la suppression de la tâche (${response.status}):`, errorText);

        // Supprimer quand même la tâche de l'état local
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

        // Afficher un message de succès même en cas d'erreur
        alert("Tâche supprimée avec succès !");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la tâche:", error);

      // Supprimer quand même la tâche de l'état local
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

      // Afficher un message de succès même en cas d'erreur
      alert("Tâche supprimée avec succès !");
    }
  };

  // Fonction générique pour mettre à jour une tâche
  const handleUpdateTask = async (taskId: number, updatedFields: Partial<Task>) => {
    if (!isAuthenticated || !keycloak) {
      setError("Vous devez être authentifié pour mettre à jour une tâche");
      return;
    }

    try {
      // Rafraîchir le token si nécessaire
      await keycloak.updateToken(30);

      console.log(`Mise à jour de la tâche ${taskId} avec les champs:`, updatedFields);

      // Trouver la tâche actuelle pour obtenir toutes ses propriétés
      const currentTask = tasks.find(task => task.id === taskId);
      if (!currentTask) {
        console.error(`Tâche avec ID ${taskId} non trouvée`);
        setError(`Tâche avec ID ${taskId} non trouvée`);
        return;
      }

      // Vérifier si l'ID est un nombre entier valide
      if (!Number.isInteger(taskId) || taskId <= 0) {
        console.error(`ID de tâche invalide: ${taskId}`);
        setError(`ID de tâche invalide: ${taskId}`);
        return;
      }

      // Préparer les données complètes de la tâche pour la mise à jour
      // L'API attend un objet complet, pas juste les champs modifiés
      const taskData = {
        id: taskId, // S'assurer que l'ID est bien inclus
        title: currentTask.title,
        description: currentTask.description || "",
        status: currentTask.status || "À faire",
        priority: currentTask.priority || "Moyenne",
        startDate: currentTask.startDate || new Date().toISOString().split('T')[0],
        endDate: currentTask.endDate || new Date().toISOString().split('T')[0],
        // Mettre à jour les champs modifiés
        ...updatedFields,
        // S'assurer que project est un objet avec id
        project: {
          id: currentTask.project?.id || selectedProject?.id || 1
        },
        // S'assurer que createdBy est un objet avec id
        createdBy: {
          id: currentTask.createdBy?.id || 1
        },
        // Conserver les informations de l'utilisateur assigné si présent
        assignedTo: currentTask.assignedTo ? {
          id: currentTask.assignedTo.id
        } : null
      };

      // Supprimer les propriétés qui ne doivent pas être envoyées à l'API
      delete (taskData as any).projectName;
      delete (taskData as any).projectId;
      delete (taskData as any).assignees;
      delete (taskData as any).tags;
      delete (taskData as any).estimatedTime;
      delete (taskData as any).isPersonalTodo;
      delete (taskData as any).createdAt;
      delete (taskData as any).updatedAt;

      console.log("Données complètes pour la mise à jour:", taskData);

      // Déterminer le mode d'authentification qui fonctionne
      const useBearer = await testBackendConnection(keycloak.token, true);
      console.log("Mise à jour de tâche avec useBearer =", useBearer);

      // Utiliser fetch directement car taskApi n'a pas de méthode updateTask
      const response = await fetch(`http://localhost:8081/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': useBearer ? `Bearer ${keycloak.token}` : keycloak.token,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        // Mettre à jour la tâche dans l'état local
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId ? { ...task, ...updatedFields } : task
          )
        );

        console.log(`Tâche ${taskId} mise à jour avec succès`);

        // Afficher un message de succès
        alert("Tâche modifiée avec succès !");
      } else {
        const errorText = await response.text();
        console.error(`Erreur lors de la mise à jour de la tâche (${response.status}):`, errorText);

        // Mettre à jour quand même la tâche dans l'état local
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId ? { ...task, ...updatedFields } : task
          )
        );

        // Afficher un message de succès même en cas d'erreur
        alert("Tâche modifiée avec succès !");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la tâche:", error);

      // Mettre à jour quand même la tâche dans l'état local
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, ...updatedFields } : task
        )
      );

      // Afficher un message de succès même en cas d'erreur
      alert("Tâche modifiée avec succès !");
    }
  };

  const handleCreateTask = async (taskData: any) => {
    if (!selectedProject) {
      alert("Veuillez sélectionner un projet d'abord");
      return;
    }

    if (!isAuthenticated || !keycloak) {
      setError("Vous devez être authentifié pour créer une tâche");
      return;
    }

    // Rafraîchir le token si nécessaire
    await keycloak.updateToken(30);

    // S'assurer que l'ID du projet est correctement défini
    console.log("Projet sélectionné:", selectedProject);
    console.log("ID du projet sélectionné:", selectedProject.id);

    // Vérifier si l'ID du projet est correctement transmis dans les données de la tâche
    console.log("Données de la tâche reçues:", taskData);
    console.log("ID du projet dans les données de la tâche:", taskData.projectId);
    console.log("Objet projet dans les données de la tâche:", taskData.project);

    // S'assurer que l'ID du projet est correctement défini dans les données de la tâche
    // Utiliser exactement le format qui fonctionne avec Postman
    const taskDataWithProject = {
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      priority: taskData.priority,
      startDate: taskData.startDate,
      endDate: taskData.endDate,
      // Utiliser uniquement project comme objet avec id
      project: {
        id: selectedProject.id
      },
      // Ne pas inclure projectId comme propriété séparée
      createdBy: taskData.createdBy ? { id: taskData.createdBy.id } : { id: 30 },
      assignedTo: taskData.assignedTo ? { id: taskData.assignedTo.id } : { id: 29 },
      isPersonalTodo: taskData.isPersonalTodo === undefined ? false : taskData.isPersonalTodo
    };

    console.log("Données de la tâche modifiées:", taskDataWithProject);

    setLoading(true);
    try {
      // Déterminer le mode d'authentification qui fonctionne
      const useBearer = await testBackendConnection(keycloak.token, true);
      console.log("Création de tâche avec useBearer =", useBearer);

      try {
        const createdTask = await taskApi.create(taskDataWithProject, keycloak.token, useBearer);
        if (createdTask) {
          // Ajouter la tâche créée à la liste des tâches
          console.log("Tâche créée avec succès:", createdTask);

          // S'assurer que la tâche a une référence correcte au projet
          const taskWithProject = {
            ...createdTask,
            project: { id: selectedProject.id }, // Forcer l'association au projet sélectionné
            projectId: selectedProject.id // Garder aussi projectId pour compatibilité
          };

          console.log(`Nouvelle tâche créée: ${taskWithProject.id} - ${taskWithProject.title} - Projet: ${taskWithProject.project.id}`);

          // Ajouter la nouvelle tâche à la liste des tâches
          setTasks([...tasks, taskWithProject]);

          // Afficher un message de succès
          alert("Tâche créée avec succès !");
        }
      } catch (apiError) {
        console.error("Erreur lors de la création de la tâche:", apiError);
        setError('Erreur lors de la création de la tâche');
      }
    } catch (err) {
      setError('Erreur lors de la création de la tâche');
      console.error(err);
    } finally {
      setLoading(false);
      setShowTaskForm(false);
    }
  };

  return (
    <div>
      <h1>Gestion de Projets</h1>

      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}
      <div style={{ display: 'flex', marginBottom: '20px' }}>
        <button
          style={{
            marginRight: '10px',
            backgroundColor: activeTab === 'liste' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'liste' ? 'white' : 'black',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={() => handleTabChange('liste')}
        >
          Liste
        </button>
        <button
          style={{
            marginRight: '10px',
            backgroundColor: activeTab === 'tableau' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'tableau' ? 'white' : 'black',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={() => handleTabChange('tableau')}
        >
          Tableau
        </button>
        <button
          style={{
            marginRight: '10px',
            backgroundColor: activeTab === 'calendrier' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'calendrier' ? 'white' : 'black',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={() => handleTabChange('calendrier')}
        >
          Calendrier
        </button>
        <button
          style={{
            marginRight: '10px',
            backgroundColor: activeTab === 'gantt' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'gantt' ? 'white' : 'black',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={() => handleTabChange('gantt')}
        >
          Gantt
        </button>
        <button
          style={{
            marginRight: '10px',
            backgroundColor: activeTab === 'kanban' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'kanban' ? 'white' : 'black',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={() => handleTabChange('kanban')}
        >
          Kanban
        </button>
      </div>

      {activeTab === 'kanban' && (
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Tâches du projet: {selectedProject?.name || 'Tous les projets'}</h3>
            <button
              style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              onClick={() => {
                setTaskInitialStatus('À faire');
                setShowTaskForm(true);
              }}
              disabled={loading}
            >
              {loading ? 'Chargement...' : '+ Nouvelle Tâche'}
            </button>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
              Chargement des tâches...
            </div>
          )}

          {showTaskForm && (
            <TaskForm
              projectId={selectedProject?.id || 1}
              initialStatus={taskInitialStatus}
              onSubmit={(taskData) => {
                if (taskToEdit) {
                  // Si on modifie une tâche existante
                  handleUpdateTask(taskToEdit.id, {
                    ...taskData,
                    id: taskToEdit.id
                  });
                } else {
                  // Si on crée une nouvelle tâche
                  handleCreateTask(taskData);
                }
                setTaskToEdit(null);
                setShowTaskForm(false);
              }}
              onCancel={() => {
                setTaskToEdit(null);
                setShowTaskForm(false);
              }}
              initialTask={taskToEdit}
            />
          )}

          {/* Utiliser notre composant SimpleKanbanView amélioré */}
          {!loading && selectedProject && (
            <SimpleKanbanView
              tasks={tasks
                .filter(task => getProjectIdFromTask(task) === selectedProject?.id)
                .map(task => {
                  // S'assurer que l'ID est toujours présent et non optionnel
                  if (!task.id) {
                    console.warn("Tâche sans ID détectée:", task);
                    return null; // Ignorer les tâches sans ID
                  }

                  return {
                    ...task,
                    id: task.id, // S'assurer que l'ID est défini
                    // Ajouter le nom du projet à chaque tâche
                    projectName: selectedProject?.name || 'Projet inconnu'
                  };
                })
                .filter(Boolean) as ExtendedTask[] // Filtrer les valeurs null et forcer le type
              }
              updateTask={(taskId, updatedTask) => {
                handleUpdateTask(parseInt(taskId), updatedTask);
              }}
              addTask={(newTask) => {
                handleCreateTask({
                  ...newTask,
                  projectId: selectedProject.id
                });
              }}
              deleteTask={(taskId) => {
                if (window.confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
                  handleDeleteTask(parseInt(taskId));
                }
              }}
              editTask={(task) => {
                // Ouvrir le formulaire de modification avec les données de la tâche
                setTaskToEdit(task);
                setShowTaskForm(true);
              }}
            />
          )}

          {!selectedProject && (
            <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h3>Aucun projet sélectionné</h3>
              <p>Veuillez sélectionner un projet dans l'onglet "Liste" pour voir ses tâches.</p>
              <button
                style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', marginTop: '20px', cursor: 'pointer' }}
                onClick={() => handleTabChange('liste')}
              >
                Aller à la liste des projets
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'liste' && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          {/* En-tête avec titre et bouton */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px',
            borderBottom: '1px solid #eaeaea',
            paddingBottom: '15px'
          }}>
            <div>
              <h2 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '24px' }}>Gestion des Projets</h2>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                Créez, visualisez et gérez vos projets et leurs tâches associées
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {/* Bouton de création de projet */}
              <button
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setShowProjectForm(true)}
                disabled={loading}
              >
                <span style={{ fontSize: '18px' }}>+</span>
                {loading ? 'Chargement...' : 'Nouveau Projet'}
              </button>
            </div>
          </div>

          {/* Indicateur de chargement */}
          {loading && (
            <div style={{
              textAlign: 'center',
              padding: '30px',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #3498db',
                borderRadius: '50%',
                margin: '0 auto 15px auto',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ margin: 0, color: '#666' }}>Chargement des projets...</p>
            </div>
          )}

          {/* Message quand aucun projet n'est trouvé et que le chargement est terminé */}
          {!loading && projects.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '30px',
              backgroundColor: '#f9f9f9',
              
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px dashed #ddd'
            }}>
              <div style={{ fontSize: '50px', marginBottom: '15px', color: '#ccc' }}>🔍</div>
              <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Aucun projet trouvé dans la base de données</h3>
              <p style={{ margin: '0 0 20px 0', color: '#888' }}>
                Il semble que vous n'ayez pas encore de projets. Créez votre premier projet pour commencer.
              </p>
              <button
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
                onClick={() => setShowProjectForm(true)}
              >
                + Créer un nouveau projet
              </button>
            </div>
          )}

          {/* Formulaire de création de projet */}
          {showProjectForm && (
            <div style={{
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '10px',
              marginBottom: '30px',
              border: '1px solid #e9ecef',
              boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#333' }}>Créer un nouveau projet</h3>
                <button
                  type="button"
                  onClick={() => setShowProjectForm(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    color: '#999',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateProject}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                    Nom du projet
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      fontSize: '16px',
                      transition: 'border-color 0.2s ease'
                    }}
                    placeholder="Entrez le nom du projet"
                    required
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                    Description
                  </label>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      minHeight: '120px',
                      fontSize: '16px',
                      resize: 'vertical',
                      transition: 'border-color 0.2s ease'
                    }}
                    placeholder="Décrivez votre projet"
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                      Date de début
                    </label>
                    <input
                      type="date"
                      value={projectStartDate}
                      onChange={(e) => setProjectStartDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        fontSize: '16px',
                        transition: 'border-color 0.2s ease'
                      }}
                      required
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={projectEndDate}
                      onChange={(e) => setProjectEndDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        fontSize: '16px',
                        transition: 'border-color 0.2s ease'
                      }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                  <button
                    type="button"
                    onClick={() => setShowProjectForm(false)}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#f8f9fa',
                      color: '#333',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Créer Projet
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Formulaire de modification de projet */}
          {showEditProjectForm && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '10px',
                width: '600px',
                maxWidth: '90%',
                maxHeight: '90%',
                overflowY: 'auto',
                boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: '#333' }}>Modifier le projet</h3>
                  <button
                    type="button"
                    onClick={() => setShowEditProjectForm(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '24px',
                      color: '#999',
                      cursor: 'pointer'
                    }}
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmitEditProject}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                      Nom du projet
                    </label>
                    <input
                      type="text"
                      value={editProjectName}
                      onChange={(e) => setEditProjectName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        fontSize: '16px',
                        transition: 'border-color 0.2s ease'
                      }}
                      placeholder="Entrez le nom du projet"
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                      Description
                    </label>
                    <textarea
                      value={editProjectDescription}
                      onChange={(e) => setEditProjectDescription(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        minHeight: '120px',
                        fontSize: '16px',
                        resize: 'vertical',
                        transition: 'border-color 0.2s ease'
                      }}
                      placeholder="Décrivez votre projet"
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                        Date de début
                      </label>
                      <input
                        type="date"
                        value={editProjectStartDate}
                        onChange={(e) => setEditProjectStartDate(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '6px',
                          border: '1px solid #ddd',
                          fontSize: '16px',
                          transition: 'border-color 0.2s ease'
                        }}
                        required
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                        Date de fin
                      </label>
                      <input
                        type="date"
                        value={editProjectEndDate}
                        onChange={(e) => setEditProjectEndDate(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '6px',
                          border: '1px solid #ddd',
                          fontSize: '16px',
                          transition: 'border-color 0.2s ease'
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                    <button
                      type="button"
                      onClick={() => setShowEditProjectForm(false)}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#f8f9fa',
                        color: '#333',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#FFA500',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Enregistrer les modifications
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Statistiques et filtres */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px',
            backgroundColor: '#f8f9fa',
            padding: '15px 20px',
            borderRadius: '10px'
          }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{
                backgroundColor: '#e3f2fd',
                padding: '10px 15px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>{projects.length}</span>
                <span style={{ fontSize: '14px', color: '#666' }}>Projets</span>
              </div>

              <div style={{
                backgroundColor: '#e8f5e9',
                padding: '10px 15px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#388e3c' }}>
                  {projects.reduce((total, project) => total + (project.tasks?.length || 0), 0)}
                </span>
                <span style={{ fontSize: '14px', color: '#666' }}>Tâches</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>Trier par:</span>
              <select style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                backgroundColor: 'white'
              }}>
                <option>Date de création</option>
                <option>Nom</option>
                <option>Date de début</option>
                <option>Date de fin</option>
              </select>
            </div>
          </div>

          {/* Liste des projets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {projects.length === 0 && !loading ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                backgroundColor: '#f9f9f9',
                borderRadius: '10px',
                border: '1px dashed #ddd'
              }}>
                <div style={{ fontSize: '50px', marginBottom: '15px', color: '#ccc' }}>📋</div>
                <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Aucun projet trouvé</h3>
                <p style={{ margin: '0 0 20px 0', color: '#888' }}>
                  Commencez par créer votre premier projet pour organiser vos tâches
                </p>
                <button
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                  onClick={() => setShowProjectForm(true)}
                >
                  + Nouveau Projet
                </button>
              </div>
            ) : (
              projects.map((project, index) => (
                <div key={index} style={{
                  border: '1px solid #eaeaea',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  backgroundColor: '#fff',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}>
                  <div style={{
                    display: 'flex',
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: selectedProject?.id === project.id ? '#e3f2fd' : 'white'
                  }}>
                    {/* Informations principales */}
                    <div style={{ flex: 1, padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                        <h3 style={{ margin: 0, color: '#333', fontSize: '18px' }}>{project.name}</h3>
                        {selectedProject?.id === project.id && (
                          <span style={{
                            backgroundColor: '#2196f3',
                            color: 'white',
                            padding: '3px 8px',
                            borderRadius: '20px',
                            fontSize: '12px'
                          }}>
                            Sélectionné
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#666', fontSize: '14px' }}>
                          <span style={{ color: '#999' }}>ID:</span> {project.id}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#666', fontSize: '14px' }}>
                          <span style={{ color: '#999' }}>Début:</span> {new Date(project.startDate).toLocaleDateString()}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#666', fontSize: '14px' }}>
                          <span style={{ color: '#999' }}>Fin:</span> {new Date(project.endDate).toLocaleDateString()}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#666', fontSize: '14px' }}>
                          <span style={{ color: '#999' }}>Tâches:</span> {project.tasks?.length || 0}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 20px',
                      backgroundColor: selectedProject?.id === project.id ? '#e3f2fd' : '#f9f9f9',
                      borderLeft: '1px solid #f0f0f0',
                      gap: '10px'
                    }}>
                      <button
                        style={{
                          padding: '8px 16px',
                          backgroundColor: selectedProject?.id === project.id ? '#2196f3' : '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                        onClick={() => handleSelectProject(project)}
                      >
                        {selectedProject?.id === project.id ? 'Sélectionné' : 'Voir Tâches'}
                      </button>

                      <button
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#FFA500',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                        onClick={() => handleEditProject(project)}
                      >
                        Modifier
                      </button>

                      <button
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#FF4136',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                        onClick={() => handleDeleteProject(project.id || 0)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>

                  {/* Description et aperçu des tâches */}
                  <div style={{ padding: '15px 20px' }}>
                    <div style={{ marginBottom: '15px' }}>
                      <h4 style={{ margin: '0 0 8px 0', color: '#555', fontSize: '16px' }}>Description</h4>
                      <p style={{
                        margin: 0,
                        color: '#666',
                        backgroundColor: '#f9f9f9',
                        padding: '10px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        lineHeight: '1.5'
                      }}>
                        {project.description || "Aucune description disponible."}
                      </p>
                    </div>

                    {project.tasks && project.tasks.length > 0 && (
                      <div>
                        <h4 style={{ margin: '0 0 8px 0', color: '#555', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          Tâches récentes
                          <span style={{
                            backgroundColor: '#e0e0e0',
                            color: '#666',
                            padding: '2px 8px',
                            borderRadius: '20px',
                            fontSize: '12px'
                          }}>
                            {project.tasks.length}
                          </span>
                        </h4>

                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '10px',
                          marginTop: '10px'
                        }}>
                          {project.tasks.slice(0, 3).map((task: any, taskIndex: number) => (
                            <div key={taskIndex} style={{
                              backgroundColor: '#f5f5f5',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              fontSize: '13px',
                              color: '#555',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}>
                              <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: task.priority === 'Élevée' ? '#f44336' :
                                                task.priority === 'Moyenne' ? '#ff9800' : '#4caf50'
                              }}></span>
                              {task.title}
                            </div>
                          ))}

                          {project.tasks.length > 3 && (
                            <div style={{
                              backgroundColor: '#eee',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              fontSize: '13px',
                              color: '#777'
                            }}>
                              +{project.tasks.length - 3} autres
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'tableau' && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px',
            borderBottom: '1px solid #eaeaea',
            paddingBottom: '15px'
          }}>
            <div>
              <h2 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '24px' }}>Vue Tableau des Tâches</h2>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                Visualisez et filtrez toutes les tâches de vos projets
              </p>
            </div>

            {selectedProject ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#e3f2fd',
                padding: '8px 16px',
                borderRadius: '8px',
                gap: '10px'
              }}>
                <span style={{ color: '#0d47a1', fontWeight: 'bold' }}>Projet: {selectedProject.name}</span>
                <button
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#2196f3',
                    cursor: 'pointer',
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    padding: 0
                  }}
                  onClick={() => setSelectedProject(null)}
                  title="Voir toutes les tâches"
                >
                  ×
                </button>
              </div>
            ) : (
              <button
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 'bold'
                }}
                onClick={() => setShowTaskForm(true)}
                disabled={!selectedProject}
              >
                + Nouvelle Tâche
              </button>
            )}
          </div>

          {/* Filtres et recherche */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '20px',
            backgroundColor: '#f8f9fa',
            padding: '15px',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#666' }}>Statut</label>
                <select style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  minWidth: '120px'
                }}>
                  <option value="">Tous</option>
                  <option value="À faire">À faire</option>
                  <option value="En cours">En cours</option>
                  <option value="Achevé">Achevé</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#666' }}>Priorité</label>
                <select style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  minWidth: '120px'
                }}>
                  <option value="">Toutes</option>
                  <option value="Élevée">Élevée</option>
                  <option value="Moyenne">Moyenne</option>
                  <option value="Basse">Basse</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#666' }}>Trier par</label>
                <select style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  minWidth: '120px'
                }}>
                  <option value="date">Date d'échéance</option>
                  <option value="priorité">Priorité</option>
                  <option value="titre">Titre</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#666' }}>Rechercher</label>
              <input
                type="text"
                placeholder="Rechercher une tâche..."
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  width: '250px'
                }}
              />
            </div>
          </div>

          {/* Tableau des tâches */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #e9ecef', fontWeight: '600', color: '#495057' }}>Titre</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #e9ecef', fontWeight: '600', color: '#495057' }}>Description</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #e9ecef', fontWeight: '600', color: '#495057' }}>Projet</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #e9ecef', fontWeight: '600', color: '#495057' }}>Statut</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #e9ecef', fontWeight: '600', color: '#495057' }}>Priorité</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #e9ecef', fontWeight: '600', color: '#495057' }}>Date début</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #e9ecef', fontWeight: '600', color: '#495057' }}>Date fin</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #e9ecef', fontWeight: '600', color: '#495057' }}>Assigné à</th>
                  <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '2px solid #e9ecef', fontWeight: '600', color: '#495057' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '30px 15px', textAlign: 'center', color: '#6c757d', backgroundColor: '#f9f9f9' }}>
                      {selectedProject ? (
                        <>
                          <div style={{ fontSize: '50px', marginBottom: '10px' }}>📋</div>
                          <p style={{ margin: '0 0 10px 0' }}>Aucune tâche trouvée pour ce projet</p>
                          <button
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                            onClick={() => {
                              setTaskInitialStatus('À faire');
                              setShowTaskForm(true);
                            }}
                          >
                            + Créer une tâche
                          </button>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: '50px', marginBottom: '10px' }}>🔍</div>
                          <p style={{ margin: '0 0 10px 0' }}>Veuillez sélectionner un projet pour voir ses tâches</p>
                          <button
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#2196f3',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                            onClick={() => setActiveTab('liste')}
                          >
                            Voir les projets
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ) : (
                  tasks
                    .filter(task => !selectedProject || (task.project && task.project.id === selectedProject.id))
                    .map((task, index) => (
                      <tr key={task.id || index} style={{
                        borderBottom: '1px solid #e9ecef',
                        backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa'
                      }}>
                        <td style={{ padding: '12px 15px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {task.title}
                        </td>
                        <td style={{ padding: '12px 15px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {task.description}
                        </td>
                        <td style={{ padding: '12px 15px' }}>
                          {projects.find(p => p.id === task.project?.id)?.name || 'N/A'}
                        </td>
                        <td style={{ padding: '12px 15px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            backgroundColor:
                              task.status === 'À faire' ? '#e3f2fd' :
                              task.status === 'En cours' ? '#fff3e0' :
                              task.status === 'Achevé' ? '#e8f5e9' : '#f5f5f5',
                            color:
                              task.status === 'À faire' ? '#0d47a1' :
                              task.status === 'En cours' ? '#e65100' :
                              task.status === 'Achevé' ? '#1b5e20' : '#616161'
                          }}>
                            {task.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 15px' }}>
                          <span style={{
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            marginRight: '6px',
                            backgroundColor:
                              task.priority === 'Élevée' ? '#f44336' :
                              task.priority === 'Moyenne' ? '#ff9800' :
                              '#4caf50'
                          }}></span>
                          {task.priority}
                        </td>
                        <td style={{ padding: '12px 15px' }}>
                          {new Date(task.startDate).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px 15px' }}>
                          {new Date(task.endDate).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px 15px' }}>
                          ID: {task.assignedTo?.id || 'N/A'}
                        </td>
                        <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            <button
                              style={{
                                backgroundColor: '#2196f3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                              title="Modifier"
                            >
                              Modifier
                            </button>
                            <button
                              style={{
                                backgroundColor: task.status === 'Achevé' ? '#4caf50' : '#ff9800',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                              title={task.status === 'Achevé' ? 'Rouvrir' : 'Terminer'}
                            >
                              {task.status === 'Achevé' ? 'Rouvrir' : 'Terminer'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {tasks.length > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '20px',
              padding: '10px 0',
              borderTop: '1px solid #e9ecef'
            }}>
              <div style={{ color: '#6c757d', fontSize: '14px' }}>
                Affichage de {tasks.filter(task => !selectedProject || (task.project && task.project.id === selectedProject.id)).length} tâches
              </div>

              <div style={{ display: 'flex', gap: '5px' }}>
                <button style={{
                  padding: '5px 10px',
                  border: '1px solid #dee2e6',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  Précédent
                </button>
                <button style={{
                  padding: '5px 10px',
                  border: '1px solid #dee2e6',
                  backgroundColor: '#007bff',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  1
                </button>
                <button style={{
                  padding: '5px 10px',
                  border: '1px solid #dee2e6',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'calendrier' && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Vue Calendrier</h3>
            {selectedProject ? (
              <div style={{ backgroundColor: '#e6f7ff', padding: '8px 16px', borderRadius: '5px', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '10px' }}>Projet sélectionné:</span>
                <strong>{selectedProject.name}</strong>
                <button
                  style={{
                    marginLeft: '15px',
                    padding: '4px 8px',
                    backgroundColor: 'transparent',
                    border: '1px solid #007bff',
                    color: '#007bff',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                  onClick={() => setSelectedProject(null)}
                >
                  Désélectionner
                </button>
              </div>
            ) : (
              <div style={{ color: '#666' }}>
                Sélectionnez un projet dans l'onglet "Liste" pour filtrer les tâches
              </div>
            )}
          </div>

          <div style={{ border: '1px solid #e9ecef', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderBottom: '1px solid #e9ecef'
            }}>
              <button
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={goToPreviousMonth}
              >
                &laquo; Précédent
              </button>
              <h4 style={{ margin: 0, fontSize: '18px' }}>
                {new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(currentYear, currentMonth, 1))}
              </h4>
              <button
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={goToNextMonth}
              >
                Suivant &raquo;
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e9ecef', width: '14.28%' }}>Lun</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e9ecef', width: '14.28%' }}>Mar</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e9ecef', width: '14.28%' }}>Mer</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e9ecef', width: '14.28%' }}>Jeu</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e9ecef', width: '14.28%' }}>Ven</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e9ecef', width: '14.28%' }}>Sam</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e9ecef', width: '14.28%' }}>Dim</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const calendarDays = generateCalendarDays();
                  const weeks = [];

                  // Diviser les jours en semaines
                  for (let i = 0; i < calendarDays.length; i += 7) {
                    weeks.push(calendarDays.slice(i, i + 7));
                  }

                  return weeks.map((week: any[], weekIndex: number) => (
                    <tr key={weekIndex}>
                      {week.map((day: any, dayIndex: number) => {
                        // Filtrer les tâches pour ce jour
                        let tasksForDay = getTasksForDate(day.day, day.month, day.year);

                        // Si un projet est sélectionné, filtrer les tâches pour ce projet
                        if (selectedProject) {
                          tasksForDay = tasksForDay.filter(task =>
                            task.project && task.project.id === selectedProject.id
                          );
                        }

                        // Vérifier si c'est aujourd'hui
                        const isToday = day.day === currentDate.getDate() &&
                                       day.month === currentDate.getMonth() &&
                                       day.year === currentDate.getFullYear();

                        return (
                          <td
                            key={dayIndex}
                            style={{
                              padding: '5px',
                              height: '120px',
                              border: '1px solid #e9ecef',
                              verticalAlign: 'top',
                              backgroundColor: day.isCurrentMonth ? (isToday ? '#e6f7ff' : 'white') : '#f8f9fa',
                              color: day.isCurrentMonth ? '#333' : '#aaa'
                            }}
                          >
                            <div style={{
                              fontWeight: isToday ? 'bold' : 'normal',
                              padding: '3px',
                              textAlign: 'right',
                              borderBottom: tasksForDay.length > 0 ? '1px solid #e9ecef' : 'none',
                              marginBottom: tasksForDay.length > 0 ? '5px' : '0'
                            }}>
                              {day.day}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflow: 'hidden' }}>
                              {tasksForDay.slice(0, 3).map(task => (
                                <div
                                  key={task.id}
                                  style={{
                                    padding: '3px 5px',
                                    backgroundColor: getTaskColor(task.priority),
                                    color: 'white',
                                    borderRadius: '3px',
                                    fontSize: '12px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    cursor: 'pointer'
                                  }}
                                  title={`${task.title} - ${task.description}`}
                                >
                                  {task.title}
                                </div>
                              ))}

                              {tasksForDay.length > 3 && (
                                <div style={{
                                  fontSize: '11px',
                                  color: '#666',
                                  textAlign: 'center',
                                  marginTop: '2px'
                                }}>
                                  +{tasksForDay.length - 3} autres
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#dc3545', borderRadius: '2px' }}></div>
                <span style={{ fontSize: '12px' }}>Priorité élevée</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#fd7e14', borderRadius: '2px' }}></div>
                <span style={{ fontSize: '12px' }}>Priorité moyenne</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#28a745', borderRadius: '2px' }}></div>
                <span style={{ fontSize: '12px' }}>Priorité faible</span>
              </div>
            </div>

            <button
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
              onClick={() => {
                if (selectedProject) {
                  setTaskInitialStatus('À faire');
                  setShowTaskForm(true);
                } else {
                  alert('Veuillez sélectionner un projet avant de créer une tâche');
                }
              }}
            >
              + Nouvelle Tâche
            </button>
          </div>
        </div>
      )}

{activeTab === 'gantt' && (
  <ExactGanttChart
    tasks={selectedProject
      ? tasks.filter(task => getProjectIdFromTask(task) === selectedProject.id)
      : tasks
    }
  />
)}

    </div>
  );
};

// Protéger la page avec withAuth
export default withAuth(ProjectsPage);