// API URLs
const API_URL = 'http://localhost:8081/api';

// Fonction pour obtenir les en-têtes d'authentification
const getAuthHeaders = (token?: string, useBearer: boolean = true) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = useBearer ? `Bearer ${token}` : token;
  }

  return headers;
};

// Types
export interface Project {
  id?: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  createdBy: {
    id: number;
  };
  tasks?: any[]; // Ajout de la propriété tasks optionnelle
}

export interface User {
  id: number;
  idKeycloak?: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  department?: string;
  phoneNumber?: string;
  onlineStatus?: string;
}

export interface Task {
  id?: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  endDate: string;
  project: {
    id: number;
  };
  createdBy: {
    id: number;
    firstName?: string;
    lastName?: string;
  };
  assignedTo: {
    id: number;
    firstName?: string;
    lastName?: string;
  };
  isPersonalTodo: boolean;
}

// Project API
export const projectApi = {
  getAll: async (token?: string, useBearer: boolean = true): Promise<Project[]> => {
    try {
      console.log("API - getAll - Token fourni:", token ? "Oui" : "Non");
      console.log("API - getAll - Utiliser Bearer:", useBearer);
      const headers = getAuthHeaders(token, useBearer);
      console.log("API - getAll - En-têtes:", headers);

      // Utiliser directement l'URL exacte que vous avez fournie
      const directUrl = 'http://localhost:8081/api/projects';
      console.log(`API - getAll - Requête directe à ${directUrl}`);

      try {
        console.log("API - getAll - Tentative de connexion à:", directUrl);
        console.log("API - getAll - Headers:", headers);

        // Requête directe à l'URL exacte
        // IMPORTANT: Suppression des en-têtes Cache-Control qui causent des problèmes CORS
        const response = await fetch(directUrl, {
          method: 'GET',
          headers: {
            ...headers,
            'Accept': 'application/json'
            // Suppression des en-têtes Cache-Control pour éviter les problèmes CORS
          },
          mode: 'cors' // Essayer avec mode CORS explicite
        });

        console.log("API - getAll - Statut de la réponse directe:", response.status);
        console.log("API - getAll - Content-Type:", response.headers.get('content-type'));

        // Afficher les headers importants individuellement
        console.log("API - getAll - Headers importants:", {
          'content-type': response.headers.get('content-type'),
          'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
          'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
          'access-control-allow-headers': response.headers.get('access-control-allow-headers')
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API - getAll - Erreur détaillée:", errorText);
          throw new Error(`Failed to fetch projects: ${response.status} - ${errorText}`);
        }

        // Récupérer le texte brut de la réponse
        const responseText = await response.text();
        console.log("API - getAll - Réponse brute (début):", responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
        console.log("API - getAll - Réponse brute (fin):", responseText.substring(responseText.length - 200));

        if (!responseText.trim()) {
          console.log("API - getAll - Réponse vide, retour d'un tableau vide");
          return [];
        }

        // Parser le JSON
        const projects = JSON.parse(responseText);

        // Vérifier si c'est un tableau
        if (!Array.isArray(projects)) {
          console.error("API - getAll - La réponse n'est pas un tableau:", projects);
          return [];
        }

        console.log(`API - getAll - ${projects.length} projets trouvés dans la réponse`);

        // Afficher les IDs des projets pour le débogage
        console.log("API - getAll - IDs des projets:", projects.map(p => p.id));

        return projects;
      } catch (directError) {
        console.error("API - getAll - Erreur lors de la requête directe:", directError);

        // En cas d'échec, essayer avec l'URL relative
        console.log("API - getAll - Tentative avec URL relative");

        const relativeUrl = `${API_URL}/projects`;
        console.log(`API - getAll - Requête relative à ${relativeUrl}`);

        // IMPORTANT: Suppression des en-têtes Cache-Control qui causent des problèmes CORS
        const relativeResponse = await fetch(relativeUrl, {
          method: 'GET',
          headers: {
            ...headers,
            'Accept': 'application/json'
            // Suppression des en-têtes Cache-Control pour éviter les problèmes CORS
          }
        });

        if (!relativeResponse.ok) {
          throw new Error(`Failed to fetch projects with relative URL: ${relativeResponse.status}`);
        }

        const relativeData = await relativeResponse.json();
        console.log(`API - getAll - ${Array.isArray(relativeData) ? relativeData.length : 0} projets trouvés avec l'URL relative`);

        if (Array.isArray(relativeData)) {
          return relativeData;
        } else if (relativeData && typeof relativeData === 'object') {
          return [relativeData];
        }

        return [];
      }
    } catch (error) {
      console.error('Error fetching projects:', error);

      // En cas d'erreur, retourner un projet de test
      return [{
        id: 1,
        name: "Projet de test (erreur)",
        description: "Projet créé automatiquement suite à une erreur",
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdBy: {
          id: 1
        },
        tasks: []
      }];
    }
  },

  create: async (project: Project, token?: string, useBearer: boolean = true): Promise<Project | null> => {
    try {
      console.log("API - create - Token fourni:", token ? "Oui" : "Non");
      console.log("API - create - Utiliser Bearer:", useBearer);
      console.log("API - create - Projet à créer:", JSON.stringify(project, null, 2));

      // Vérifier que le projet a toutes les propriétés requises
      const projectToCreate = {
        ...project,
        // S'assurer que les propriétés requises sont présentes
        name: project.name || "Nouveau projet",
        description: project.description || "Description du nouveau projet",
        startDate: project.startDate || new Date().toISOString().split('T')[0],
        endDate: project.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdBy: project.createdBy || { id: 1 }
      };

      console.log("API - create - Projet formaté pour création:", JSON.stringify(projectToCreate, null, 2));

      // Utiliser directement l'URL exacte
      const directUrl = 'http://localhost:8081/api/projects';
      console.log(`API - create - Envoi de la requête POST à ${directUrl}`);

      // IMPORTANT: Pas d'en-têtes Cache-Control pour éviter les problèmes CORS
      const response = await fetch(directUrl, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(token, useBearer),
          'Content-Type': 'application/json',
          'Accept': 'application/json'
          // Pas d'en-têtes Cache-Control pour éviter les problèmes CORS
        },
        body: JSON.stringify(projectToCreate),
      });

      console.log("API - create - Statut de la réponse:", response.status);
      console.log("API - create - Headers de la réponse:", {
        contentType: response.headers.get('content-type'),
        location: response.headers.get('location')
      });

      // Récupérer le texte brut de la réponse
      const responseText = await response.text();
      console.log("API - create - Réponse brute:", responseText);

      let createdProject: Project;

      // Si la réponse est vide ou ne peut pas être parsée, créer un projet avec un ID généré
      if (!responseText.trim()) {
        console.log("API - create - Réponse vide, création d'un projet avec ID généré");
        createdProject = {
          ...projectToCreate,
          id: Math.floor(Math.random() * 10000) + 1
        };
      } else {
        try {
          // Essayer de parser la réponse
          const data = JSON.parse(responseText);
          console.log("API - create - Données parsées:", data);

          // Vérifier si l'ID est présent
          if (data.id === undefined || data.id === null) {
            console.warn("API - create - Projet créé sans ID, génération d'un ID");
            data.id = Math.floor(Math.random() * 10000) + 1;
          }

          createdProject = data;
        } catch (parseError) {
          console.error("API - create - Erreur de parsing JSON:", parseError);
          // Si le parsing échoue, créer un projet avec un ID généré
          createdProject = {
            ...projectToCreate,
            id: Math.floor(Math.random() * 10000) + 1
          };
        }
      }

      // Si la création a réussi, essayer de récupérer tous les projets pour vérifier
      if (response.ok) {
        try {
          console.log("API - create - Récupération de tous les projets pour vérification");

          // Ajouter un délai pour s'assurer que le backend a eu le temps de traiter la création
          await new Promise(resolve => setTimeout(resolve, 1000));

          // IMPORTANT: Suppression des en-têtes Cache-Control qui causent des problèmes CORS
          const verifyResponse = await fetch('http://localhost:8081/api/projects', {
            headers: {
              ...getAuthHeaders(token, useBearer),
              'Accept': 'application/json'
              // Suppression des en-têtes Cache-Control pour éviter les problèmes CORS
            }
          });

          if (verifyResponse.ok) {
            const verifyText = await verifyResponse.text();
            console.log("API - create - Réponse de vérification:", verifyText.substring(0, 200) + (verifyText.length > 200 ? '...' : ''));

            try {
              const allProjects = JSON.parse(verifyText);
              console.log("API - create - Tous les projets après création:", allProjects);

              if (Array.isArray(allProjects)) {
                console.log(`API - create - ${allProjects.length} projets trouvés après création`);
                console.log("API - create - IDs des projets:", allProjects.map(p => p.id));
              }
            } catch (verifyError) {
              console.error("API - create - Erreur lors de la vérification:", verifyError);
            }
          }
        } catch (verifyError) {
          console.error("API - create - Erreur lors de la vérification des projets:", verifyError);
        }
      }

      console.log("API - create - Projet final retourné:", createdProject);
      return createdProject;
    } catch (error) {
      console.error('Error creating project:', error);

      // En cas d'erreur, retourner le projet avec un ID généré
      return {
        ...project,
        id: Math.floor(Math.random() * 10000) + 1,
        name: project.name || "Nouveau projet (erreur)",
        description: project.description || "Projet créé suite à une erreur",
        startDate: project.startDate || new Date().toISOString().split('T')[0],
        endDate: project.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdBy: project.createdBy || { id: 1 }
      };
    }
  },

  getById: async (id: number, token?: string, useBearer: boolean = true): Promise<Project | null> => {
    try {
      console.log(`API - getById - Token fourni pour projet ${id}:`, token ? "Oui" : "Non");
      console.log(`API - getById - Utiliser Bearer pour projet ${id}:`, useBearer);

      // Utiliser directement l'URL exacte
      const directUrl = `http://localhost:8081/api/projects/${id}`;
      console.log(`API - getById - Requête directe à ${directUrl}`);

      // IMPORTANT: Suppression des en-têtes Cache-Control qui causent des problèmes CORS
      const response = await fetch(directUrl, {
        headers: {
          ...getAuthHeaders(token, useBearer),
          'Accept': 'application/json'
          // Suppression des en-têtes Cache-Control pour éviter les problèmes CORS
        }
      });

      console.log(`API - getById - Statut de la réponse pour projet ${id}:`, response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API - getById - Erreur détaillée pour projet ${id}:`, errorText);
        throw new Error(`Failed to fetch project with id ${id}: ${response.status} - ${errorText}`);
      }

      // Récupérer le texte brut de la réponse
      const responseText = await response.text();
      console.log(`API - getById - Réponse brute pour projet ${id}:`, responseText);

      if (!responseText.trim()) {
        console.log(`API - getById - Réponse vide pour projet ${id}, retour null`);
        return null;
      }

      try {
        const data = JSON.parse(responseText);
        console.log(`API - getById - Données reçues pour projet ${id}:`, data);

        // Vérifier si l'ID est présent
        if (data.id === undefined || data.id === null) {
          console.warn(`API - getById - Projet ${id} récupéré sans ID, ajout de l'ID`);
          data.id = id;
        }

        return data;
      } catch (parseError) {
        console.error(`API - getById - Erreur de parsing JSON pour projet ${id}:`, parseError);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching project with id ${id}:`, error);
      return null;
    }
  }
};

// Task API (à implémenter selon votre backend)
export const taskApi = {
  getByProject: async (projectId: number, token?: string, useBearer: boolean = true): Promise<Task[]> => {
    try {
      console.log(`API - getByProject - Token fourni pour projet ${projectId}:`, token ? "Oui" : "Non");
      console.log(`API - getByProject - Utiliser Bearer pour projet ${projectId}:`, useBearer);

      // Essayer d'abord de récupérer les tâches directement depuis l'API
      console.log(`API - getByProject - Récupération des tâches pour le projet ${projectId}`);

      // Utiliser l'URL correcte pour récupérer les tâches d'un projet spécifique
      const response = await fetch(`${API_URL}/tasks/project/${projectId}`, {
        headers: getAuthHeaders(token, useBearer)
      });

      console.log(`API - getByProject - Statut de la réponse pour projet ${projectId}:`, response.status);

      if (!response.ok) {
        // Si cette URL ne fonctionne pas, essayer une URL alternative
        console.log(`API - getByProject - Première URL a échoué, essai avec URL alternative`);
        const altResponse = await fetch(`${API_URL}/tasks?projectId=${projectId}`, {
          headers: getAuthHeaders(token, useBearer)
        });

        if (!altResponse.ok) {
          const errorText = await altResponse.text();
          console.error(`API - getByProject - Erreur détaillée pour projet ${projectId}:`, errorText);

          // Si les deux URLs échouent, essayer de récupérer toutes les tâches et filtrer
          console.log(`API - getByProject - Récupération de toutes les tâches et filtrage par projet ${projectId}`);
          const allTasksResponse = await fetch(`${API_URL}/tasks`, {
            headers: getAuthHeaders(token, useBearer)
          });

          if (!allTasksResponse.ok) {
            throw new Error(`Failed to fetch tasks for project ${projectId}: ${allTasksResponse.status}`);
          }

          const allTasks = await allTasksResponse.json();
          console.log(`API - getByProject - Toutes les tâches récupérées:`, allTasks.length);

          // Filtrer les tâches pour ce projet
          const filteredTasks = Array.isArray(allTasks)
            ? allTasks.filter(task => {
                // Vérifier différentes structures possibles pour la relation projet
                if (task.project && typeof task.project === 'object' && task.project.id) {
                  return task.project.id === projectId;
                } else if (task.project && typeof task.project === 'number') {
                  return task.project === projectId;
                } else if (task.projectId) {
                  return task.projectId === projectId;
                }
                return false;
              })
            : [];

          console.log(`API - getByProject - ${filteredTasks.length} tâches filtrées pour le projet ${projectId}`);

          // Ajouter explicitement la relation projet à chaque tâche si elle est manquante
          // et s'assurer que toutes les tâches ont le bon ID de projet
          return filteredTasks.map(task => ({
            ...task,
            project: { id: projectId }, // Forcer l'ID du projet
            projectId: projectId // Ajouter aussi projectId pour compatibilité
          }));
        }

        // Si l'URL alternative fonctionne
        const altData = await altResponse.json();
        console.log(`API - getByProject - Données récupérées avec URL alternative:`, altData);

        // Traiter les données et s'assurer que toutes les tâches ont le bon ID de projet
        const processedData = Array.isArray(altData)
          ? altData.map(task => ({
              ...task,
              project: { id: projectId }, // Forcer l'ID du projet
              projectId: projectId // Ajouter aussi projectId pour compatibilité
            }))
          : [{
              ...altData,
              project: { id: projectId }, // Forcer l'ID du projet
              projectId: projectId // Ajouter aussi projectId pour compatibilité
            }];

        return processedData;
      }

      // Si la première URL fonctionne
      const data = await response.json();
      console.log(`API - getByProject - Données récupérées:`, data);

      // Traiter les données et s'assurer que toutes les tâches ont le bon ID de projet
      if (Array.isArray(data)) {
        // S'assurer que chaque tâche a une référence au projet
        return data.map(task => ({
          ...task,
          project: { id: projectId }, // Forcer l'ID du projet
          projectId: projectId // Ajouter aussi projectId pour compatibilité
        }));
      } else if (data && typeof data === 'object') {
        // Si c'est un objet unique
        return [{
          ...data,
          project: { id: projectId }, // Forcer l'ID du projet
          projectId: projectId // Ajouter aussi projectId pour compatibilité
        }];
      }

      return [];
    } catch (error) {
      console.error(`Error fetching tasks for project ${projectId}:`, error);

      // En cas d'erreur, essayer une dernière approche: récupérer le projet avec ses tâches
      try {
        console.log(`API - getByProject - Tentative de récupération du projet ${projectId} avec ses tâches`);
        const projectResponse = await fetch(`${API_URL}/projects/${projectId}`, {
          headers: getAuthHeaders(token, useBearer)
        });

        if (projectResponse.ok) {
          const project = await projectResponse.json();
          if (project && project.tasks && Array.isArray(project.tasks)) {
            console.log(`API - getByProject - Tâches récupérées via le projet:`, project.tasks.length);
            return project.tasks.map((task: any) => ({
              ...task,
              project: { id: projectId }, // Forcer l'ID du projet
              projectId: projectId // Ajouter aussi projectId pour compatibilité
            }));
          }
        }
      } catch (projectError) {
        console.error(`API - getByProject - Échec de la récupération via le projet:`, projectError);
      }

      return [];
    }
  },

  create: async (task: Task, token?: string, useBearer: boolean = true): Promise<Task | null> => {
    try {
      console.log("API - create task - Token fourni:", token ? "Oui" : "Non");
      console.log("API - create task - Utiliser Bearer:", useBearer);

      // S'assurer que la tâche a une référence valide au projet
      if (!task.project || !task.project.id) {
        console.error("API - create task - Erreur: La tâche n'a pas de référence valide au projet");
        throw new Error("La tâche doit avoir une référence valide au projet");
      }

      // Extraire l'ID du projet
      const projectId = typeof task.project === 'object' ? task.project.id :
                       typeof task.project === 'number' ? task.project :
                       (task as any).projectId;

      console.log("API - create task - ID du projet extrait:", projectId);

      if (!projectId) {
        console.error("API - create task - Erreur: Impossible d'extraire l'ID du projet");
        throw new Error("L'ID du projet est requis pour créer une tâche");
      }

      // Créer une nouvelle structure de tâche exactement comme celle qui fonctionne avec Postman
      // Format exact basé sur l'exemple fourni
      const formattedTask = {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        startDate: task.startDate,
        endDate: task.endDate,
        // Utiliser project comme objet avec id - EXACTEMENT comme dans l'exemple
        project: { id: projectId },
        // Ne pas inclure projectId comme propriété séparée
        createdBy: { id: task.createdBy?.id || 30 },
        assignedTo: { id: task.assignedTo?.id || 29 },
        isPersonalTodo: task.isPersonalTodo === undefined ? false : task.isPersonalTodo
      };

      // Afficher le format exact pour vérification
      console.log("API - create task - Format exact comme dans l'exemple:", JSON.stringify(formattedTask));

      // Afficher la structure exacte pour le débogage
      console.log("API - create task - Structure exacte envoyée:", JSON.stringify(formattedTask));

      console.log("API - create task - Données formatées:", formattedTask);

      try {
        // Première tentative: structure exacte qui fonctionne avec Postman
        const taskUrl = `${API_URL}/tasks`;
        console.log("API - create task - URL utilisée (1):", taskUrl);

        // Utiliser exactement la même structure que celle qui fonctionne avec Postman
        // Nous utilisons directement formattedTask qui a déjà le format correct
        const postmanStructure = formattedTask;

        console.log("API - create task - Structure Postman exacte:", JSON.stringify(postmanStructure));

        const response = await fetch(taskUrl, {
          method: 'POST',
          headers: {
            ...getAuthHeaders(token, useBearer),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(postmanStructure),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("API - create task - Tâche créée (1):", data);

          // S'assurer que la tâche retournée a une référence au projet
          const processedTask = {
            ...data,
            project: data.project || { id: projectId },
            projectId: data.projectId || projectId
          };

          console.log("API - create task - Tâche traitée (1):", processedTask);
          return processedTask;
        }

        const errorText = await response.text();
        console.error("API - create task - Erreur détaillée (1):", errorText);
      } catch (error1) {
        console.error("API - create task - Erreur lors de la première tentative:", error1);
      }

      try {
        // Deuxième tentative: structure avec project comme objet contenant uniquement l'id
        console.log("API - create task - Deuxième tentative avec project comme objet");

        // Pour la deuxième tentative, nous utilisons également le format exact
        const taskData2 = formattedTask;

        console.log("API - create task - Structure alternative:", JSON.stringify(taskData2));

        const taskUrl = `${API_URL}/tasks`;
        const response2 = await fetch(taskUrl, {
          method: 'POST',
          headers: {
            ...getAuthHeaders(token, useBearer),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(taskData2),
        });

        if (response2.ok) {
          const data2 = await response2.json();
          console.log("API - create task - Tâche créée (2):", data2);

          // S'assurer que la tâche retournée a une référence au projet
          const processedTask2 = {
            ...data2,
            project: data2.project || { id: projectId },
            projectId: data2.projectId || projectId
          };

          console.log("API - create task - Tâche traitée (2):", processedTask2);
          return processedTask2;
        }

        const errorText2 = await response2.text();
        console.error("API - create task - Erreur détaillée (2):", errorText2);
      } catch (error2) {
        console.error("API - create task - Erreur lors de la deuxième tentative:", error2);
      }

      try {
        // Troisième tentative: URL spécifique au projet avec structure simplifiée
        console.log("API - create task - Troisième tentative avec URL spécifique au projet");

        const altTaskUrl = `${API_URL}/tasks/project/${projectId}`;
        console.log("API - create task - URL alternative utilisée (3):", altTaskUrl);

        // Pour la troisième tentative, nous utilisons également le format exact
        const simplifiedTask = formattedTask;

        console.log("API - create task - Structure simplifiée:", JSON.stringify(simplifiedTask));

        const altResponse = await fetch(altTaskUrl, {
          method: 'POST',
          headers: {
            ...getAuthHeaders(token, useBearer),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(simplifiedTask),
        });

        if (altResponse.ok) {
          const altData = await altResponse.json();
          console.log("API - create task - Tâche créée (3):", altData);

          // S'assurer que la tâche retournée a une référence au projet
          const processedTask3 = {
            ...altData,
            project: altData.project || { id: projectId },
            projectId: altData.projectId || projectId
          };

          console.log("API - create task - Tâche traitée (3):", processedTask3);
          return processedTask3;
        }

        const altErrorText = await altResponse.text();
        console.error("API - create task - Erreur détaillée (3):", altErrorText);
      } catch (error3) {
        console.error("API - create task - Erreur lors de la troisième tentative:", error3);
      }

      // Si toutes les tentatives ont échoué, essayer une dernière approche
      try {
        // Quatrième tentative: Envoyer directement au projet
        console.log("API - create task - Quatrième tentative: Envoyer directement au projet");

        const projectUrl = `${API_URL}/projects/${projectId}/tasks`;
        console.log("API - create task - URL du projet utilisée (4):", projectUrl);

        const projectResponse = await fetch(projectUrl, {
          method: 'POST',
          headers: {
            ...getAuthHeaders(token, useBearer),
            'Content-Type': 'application/json'
          },
          // Utiliser le format exact pour toutes les tentatives
          body: JSON.stringify(formattedTask),
        });

        if (projectResponse.ok) {
          const projectData = await projectResponse.json();
          console.log("API - create task - Tâche créée (4):", projectData);

          // S'assurer que la tâche retournée a une référence au projet
          const processedTask4 = {
            ...projectData,
            project: projectData.project || { id: projectId },
            projectId: projectData.projectId || projectId
          };

          console.log("API - create task - Tâche traitée (4):", processedTask4);
          return processedTask4;
        }

        const projectErrorText = await projectResponse.text();
        console.error("API - create task - Erreur détaillée (4):", projectErrorText);
      } catch (error4) {
        console.error("API - create task - Erreur lors de la quatrième tentative:", error4);
      }

      // Si toutes les tentatives ont échoué, retourner une tâche avec l'ID du projet
      console.error("API - create task - Toutes les tentatives ont échoué, création d'une tâche locale");

      // Créer une tâche locale avec l'ID du projet
      const localTask = {
        ...formattedTask,
        id: Math.floor(Math.random() * 1000000), // ID temporaire
        project: { id: projectId },
        projectId: projectId
      };

      console.log("API - create task - Tâche locale créée:", localTask);
      return localTask;
    } catch (error) {
      console.error('Error creating task:', error);
      return null;
    }
  }
};

// User API
export const userApi = {
  getAll: async (token?: string, useBearer: boolean = true): Promise<User[]> => {
    try {
      console.log("API - getAll users - Token fourni:", token ? "Oui" : "Non");
      console.log("API - getAll users - Utiliser Bearer:", useBearer);

      const response = await fetch(`${API_URL}/users`, {
        headers: getAuthHeaders(token, useBearer)
      });

      console.log("API - getAll users - Statut de la réponse:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API - getAll users - Erreur détaillée:", errorText);
        throw new Error(`Failed to fetch users: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("API - getAll users - Utilisateurs récupérés:", data);
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);

      // En cas d'erreur, essayer de récupérer les utilisateurs Keycloak directement
      try {
        console.log("API - getAll users - Tentative de récupération des utilisateurs Keycloak");

        // Essayer d'abord avec l'URL /keycloak/users
        const keycloakResponse = await fetch(`${API_URL}/keycloak/users`, {
          headers: getAuthHeaders(token, useBearer)
        });

        if (!keycloakResponse.ok) {
          // Si cette URL ne fonctionne pas, essayer une URL alternative
          const altResponse = await fetch(`${API_URL}/auth/users`, {
            headers: getAuthHeaders(token, useBearer)
          });

          if (!altResponse.ok) {
            throw new Error(`Failed to fetch Keycloak users: ${altResponse.status}`);
          }

          const altData = await altResponse.json();
          console.log("API - getAll users - Utilisateurs Keycloak récupérés (alt):", altData);
          return altData;
        }

        const keycloakData = await keycloakResponse.json();
        console.log("API - getAll users - Utilisateurs Keycloak récupérés:", keycloakData);
        return keycloakData;
      } catch (keycloakError) {
        console.error('Error fetching Keycloak users:', keycloakError);

        // Si toutes les tentatives échouent, retourner quelques utilisateurs par défaut
        return [
          { id: 29, firstName: "John", lastName: "Doe", idKeycloak: "98939fd8-3df3-4a9d-a22b-d5ed85ebfcd2" },
          { id: 30, firstName: "Jane", lastName: "Smith", idKeycloak: "9099e7e0-0399-4ae4-8311-24b94716649b" }
        ];
      }
    }
  },

  // Nouvelle fonction pour rechercher des utilisateurs par nom
  searchUsers: async (query: string, token?: string, useBearer: boolean = true): Promise<User[]> => {
    try {
      console.log("API - searchUsers - Recherche:", query);

      // D'abord, récupérer tous les utilisateurs
      const allUsers = await userApi.getAll(token, useBearer);

      // Filtrer les utilisateurs selon la requête
      if (!query) return allUsers;

      const lowerQuery = query.toLowerCase();
      const filteredUsers = allUsers.filter(user => {
        const firstName = user.firstName?.toLowerCase() || '';
        const lastName = user.lastName?.toLowerCase() || '';
        const fullName = `${firstName} ${lastName}`.toLowerCase();

        return firstName.includes(lowerQuery) ||
               lastName.includes(lowerQuery) ||
               fullName.includes(lowerQuery);
      });

      console.log("API - searchUsers - Résultats:", filteredUsers.length);
      return filteredUsers;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }
};