"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const EditUserPage = () => {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const { query } = router;
  const userId = query.id as string;

  // Récupérer les détails de l'utilisateur à modifier
  const fetchUserDetails = async () => {
    const token = localStorage.getItem("auth_token");

    if (!token || !userId) {
      setError("Token d'authentification ou ID utilisateur manquant.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8081/test/keycloak/user/${userId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Impossible de récupérer les détails de l'utilisateur.");
      }

      const data = await response.json();
      setUser(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Modifier l'Utilisateur</h2>
      <form className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nom d'utilisateur:</label>
          <input
            id="username"
            type="text"
            defaultValue={user.username}
            className="w-full border rounded-lg p-2 mt-1"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
          <input
            id="email"
            type="email"
            defaultValue={user.email}
            className="w-full border rounded-lg p-2 mt-1"
          />
        </div>
        {/* Ajoute d'autres champs si nécessaire */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Sauvegarder les modifications
        </button>
      </form>
    </div>
  );
};

export default EditUserPage;
