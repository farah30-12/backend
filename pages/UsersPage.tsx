"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const UsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Récupérer les utilisateurs depuis Keycloak
  const fetchUsers = async () => {
    const token = localStorage.getItem("auth_token");  // Assurez-vous que le token est récupéré correctement

    if (!token) {
      setError("Token d'authentification manquant.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/test/keycloak/users", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Impossible de récupérer les utilisateurs.");
      }

      const data = await response.json();
      setUsers(data);  // Les utilisateurs récupérés depuis Keycloak
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditUser = (userId: string) => {
    // Rediriger vers la page de modification de l'utilisateur
    router.push(`/edit-user?id=${userId}`);
  };

  const handleDeleteUser = async (userId: string) => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      setError("Token d'authentification manquant.");
      return;
    }

    const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:8081/test/keycloak/delete-user/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'utilisateur.");
      }

      setUsers(users.filter(user => user.id !== userId));  // Retirer l'utilisateur de l'état
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Liste des Utilisateurs</h2>
      {loading ? (
        <div>Chargement...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto shadow-md sm:rounded-lg">
          <table className="min-w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Nom d'utilisateur</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Rôle</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b bg-white hover:bg-gray-50">
                  <td className="px-6 py-4">{user.username}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">{user.role}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEditUser(user.id)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
