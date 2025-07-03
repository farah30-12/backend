import React, { useState, useEffect } from 'react';
import { useAuth } from 'src/context/AuthContext';
import { MainLayout as Layout } from 'src/components/Layout';
import { Container, Button, Loader, Paper, Title, Text, Group } from '@mantine/core';

// Interface simple pour les projets
interface Project {
  id: number;
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
  createdBy?: { id: number };
}

export default function SimpleProjects() {
  const { keycloak, initialized } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Fonction pour charger les projets directement depuis l'URL
  const loadProjects = async () => {
    if (!keycloak || !keycloak.token) {
      setError("Non authentifié");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Chargement des projets...");

      // Utiliser directement l'URL exacte
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
      console.log("Réponse brute:", responseText.substring(0, 200));

      const data = JSON.parse(responseText);
      console.log("Données parsées:", data);

      if (Array.isArray(data)) {
        console.log(`${data.length} projets trouvés`);
        setProjects(data);
      } else {
        console.error("La réponse n'est pas un tableau:", data);
        setError("Format de réponse invalide");
      }
    } catch (error) {
      console.error("Erreur:", error);
      setError(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour créer un nouveau projet
  const createProject = async () => {
    if (!keycloak || !keycloak.token) {
      setError("Non authentifié");
      return;
    }

    const name = prompt("Nom du projet:");
    if (!name) return;

    const description = prompt("Description du projet:");
    if (!description) return;

    setLoading(true);
    setError(null);

    try {
      const newProject = {
        name,
        description,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdBy: { id: 1 }
      };

      console.log("Création d'un projet:", newProject);

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

      alert("Projet créé avec succès!");

      // Recharger les projets
      setRefreshCounter(prev => prev + 1);
    } catch (error) {
      console.error("Erreur:", error);
      setError(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Charger les projets au chargement de la page
  useEffect(() => {
    if (initialized && keycloak?.authenticated) {
      loadProjects();
    }
  }, [initialized, keycloak, refreshCounter]);

  // Rediriger si non authentifié
  if (!initialized || !keycloak?.authenticated) {
    return (
      <Layout>
        <Container>
          <Paper p="xl" shadow="md">
            <Title order={3}>Non authentifié</Title>
            <Text>Veuillez vous connecter pour accéder à cette page.</Text>
          </Paper>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <Paper p="xl" shadow="md">
          <Group position="apart" mb="lg">
            <Title order={3}>Liste Simple des Projets</Title>
            <Group>
              <Button
                color="blue"
                onClick={() => setRefreshCounter(prev => prev + 1)}
                loading={loading}
              >
                Actualiser
              </Button>
              <Button
                color="green"
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
              <Text mt="md" color="dimmed">Chargement en cours...</Text>
            </div>
          )}

          {error && (
            <Paper p="md" mb="lg" style={{ backgroundColor: '#FFF3F3', color: '#D03958' }}>
              {error}
            </Paper>
          )}

          {!loading && projects.length === 0 && !error && (
            <Paper p="xl" style={{ textAlign: 'center', backgroundColor: '#f9f9f9' }}>
              <Text size="lg" color="dimmed">Aucun projet trouvé</Text>
            </Paper>
          )}

          {projects.map(project => (
            <Paper key={project.id} p="md" mb="md" withBorder>
              <Title order={4}>{project.name}</Title>
              <Text color="dimmed" size="sm">ID: {project.id}</Text>
              <Text mt="xs">{project.description}</Text>
              {project.startDate && project.endDate && (
                <Text size="sm" mt="xs">
                  Période: {project.startDate} - {project.endDate}
                </Text>
              )}
            </Paper>
          ))}
        </Paper>
      </Container>
    </Layout>
  );
}
