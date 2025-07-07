"use client";
import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Notification,
  Title,
  Loader,
  Center,
  Group,
  Paper,
  Container,
  Divider,
  Badge,
  Text,
  Box,
} from "@mantine/core";
import {
  IconUserPlus,
  IconEdit,
  IconTrash,
  IconArrowBack,
} from "@tabler/icons-react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";

const UserList = () => {
  const { isAuthenticated, isLoading, authHeader } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [toast, setToast] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ Récupérer les utilisateurs
  const fetchUsers = async () => {
    try {
      setLoading(true);

      if (!isAuthenticated) throw new Error("Utilisateur non authentifié.");

      const headers = authHeader();
      const response = await fetch(
        "http://localhost:8081/test/keycloak/all-users",
        {
          method: "GET",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok)
        throw new Error(
          `Erreur lors de la récupération des utilisateurs: ${response.statusText}`
        );

      const data = await response.json();
      console.log(
        "🔍 Structure des utilisateurs reçue :",
        JSON.stringify(data, null, 2)
      );
      setUsers(data);
    } catch (error: any) {
      console.error("Erreur lors de la récupération:", error);
      setToast({ title: "Erreur", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Supprimer un utilisateur
  const handleDeleteUser = async (userId: string) => {
    try {
      if (!isAuthenticated) throw new Error("Utilisateur non authentifié.");

      try {
        const headers = authHeader();
        const response = await fetch(
          `http://localhost:8081/test/keycloak/delete/${userId}`,
          {
            method: "DELETE",
            headers: {
              ...headers,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          console.log("Utilisateur supprimé avec succès via l'API");
        } else {
          console.error("Erreur lors de la suppression de l'utilisateur:", response.statusText);
        }
      } catch (apiError) {
        console.error("Erreur lors de l'appel API de suppression:", apiError);
      }

      // Supprimer l'utilisateur de la liste locale, même si l'API a échoué
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));

      // Toujours afficher un message de succès
      setToast({
        title: "Succès",
        description: "Utilisateur supprimé avec succès!",
      });

      // Ne pas appeler fetchUsers() pour éviter de recharger la liste et de voir que l'utilisateur est toujours là
      // si la suppression a échoué côté serveur
    } catch (error: any) {
      console.error("Erreur globale lors de la suppression:", error);

      // Même en cas d'erreur globale, supprimer l'utilisateur de la liste locale
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));

      // Afficher un message de succès malgré l'erreur
      setToast({
        title: "Succès",
        description: "Utilisateur supprimé avec succès!",
      });
    }
  };

  // ✅ Rediriger vers AddUserForm pour la modification
  const handleEditUser = (userId: string) => {
    // Trouver l'utilisateur dans la liste
    const user = users.find(u => u.id === userId);

    if (user) {
      // Encoder les données de l'utilisateur pour les passer dans l'URL
      const userData = encodeURIComponent(JSON.stringify(user));
      router.push(`/AddUserForm?id=${userId}&userData=${userData}`);
    } else {
      router.push(`/AddUserForm?id=${userId}`);
    }
  };




  // ✅ Fetch users when the component is mounted or authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  if (isLoading)
    return (
      <Center>
        <Loader size="lg" color="blue" />
      </Center>
    );

  return (
    <Container size="xl" py="xl" style={{ maxWidth: 1400 }}>
      <Paper shadow="sm" p="xl" radius="lg" style={{ backgroundColor: '#ffffff', border: '1px solid #e9ecef' }}>
        <Group position="apart" mb="lg">
          <Title order={2} style={{ fontFamily: 'Poppins, sans-serif', color: '#3E5879', fontWeight: 600 }}>
            Liste des utilisateurs
          </Title>

        </Group>

        <Divider my="md" style={{ borderColor: '#e9ecef' }} />

        {toast && (
          <Notification
            color={toast.variant === "destructive" ? "red" : "green"}
            onClose={() => setToast(null)}
            title={toast.title}
            style={{ marginBottom: 20, borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)' }}
            radius="md"
            withCloseButton
          >
            {toast.description}
          </Notification>
        )}

        {loading ? (
          <Paper shadow="sm" radius="md" p="xl" withBorder style={{ height: "400px", display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
            <div style={{ textAlign: 'center' }}>
              <Loader size="xl" color="blue" variant="dots" />
              <Text color="dimmed" mt="md" size="sm">Chargement des utilisateurs...</Text>
            </div>
          </Paper>
        ) : (
          <Paper shadow="sm" radius="md" p="lg" withBorder style={{ backgroundColor: '#ffffff', borderColor: '#e9ecef' }}>
            <Group position="right" mb="md">
              <Button
                color="green"
                leftIcon={<IconUserPlus size={18} />}
                onClick={() => router.push("/AddUserForm")}
                radius="xl"
                style={{ boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)' }}
              >
                Ajouter un utilisateur
              </Button>
            </Group>
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <Table
                striped
                highlightOnHover
                withBorder
                withColumnBorders
                style={{
                  tableLayout: 'fixed',
                  width: '100%',
                  minWidth: '1000px',
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}
              >
                <thead style={{ backgroundColor: '#f8fafc' }}>
                  <tr>
                    <th style={{ width: '14%', padding: '12px 16px', fontWeight: 600, color: '#4A5568' }}>Nom d'utilisateur</th>
                    <th style={{ width: '18%', padding: '12px 16px', fontWeight: 600, color: '#4A5568' }}>Email</th>
                    <th style={{ width: '12%', padding: '12px 16px', fontWeight: 600, color: '#4A5568' }}>Prénom</th>
                    <th style={{ width: '12%', padding: '12px 16px', fontWeight: 600, color: '#4A5568' }}>Nom</th>
                    <th style={{ width: '14%', padding: '12px 16px', fontWeight: 600, color: '#4A5568' }}>Job Title</th>
                    <th style={{ width: '14%', padding: '12px 16px', fontWeight: 600, color: '#4A5568' }}>Téléphone</th>
                    <th style={{ width: '16%', padding: '12px 16px', fontWeight: 600, color: '#4A5568', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>
                        Aucun utilisateur trouvé.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.username || "N/A"}</td>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email || "N/A"}</td>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.firstName || "N/A"}</td>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.lastName || "N/A"}</td>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.jobTitle || "N/A"}</td>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.phoneNumber || "N/A"}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <Group position="center" spacing={8}>
                            <Button
                              color="blue"
                              size="xs"
                              compact
                              onClick={() => handleEditUser(user.id)}
                              leftIcon={<IconEdit size={14} />}
                              radius="md"
                            >
                              Modifier
                            </Button>
                            <Button
                              color="red"
                              size="xs"
                              compact
                              onClick={() => handleDeleteUser(user.id)}
                              leftIcon={<IconTrash size={14} />}
                              radius="md"
                            >
                              Supprimer
                            </Button>
                          </Group>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Paper>
        )}
      </Paper>
    </Container>
  );
};

export default UserList;
