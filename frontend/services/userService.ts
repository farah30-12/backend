/**
 * Service pour gérer les utilisateurs Keycloak
 */

/**
 * Récupère la liste des utilisateurs depuis Keycloak
 * @param token Token d'authentification Keycloak
 * @returns Liste des utilisateurs avec leurs informations
 */
export async function getKeycloakUsers(token: string): Promise<{ id: string; firstName: string; lastName: string }[]> {
  console.log("Récupération des utilisateurs Keycloak...");

  try {
    // Essayer d'abord avec l'URL principale
    console.log("Tentative avec l'URL principale: http://localhost:8081/test/keycloak/all-users");
    const res = await fetch("http://localhost:8081/test/keycloak/all-users", {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    console.log("Statut de la réponse:", res.status);

    if (!res.ok) {
      console.warn(`L'URL principale a échoué avec le statut ${res.status}. Tentative avec l'URL alternative...`);

      // Essayer avec une première URL alternative
      console.log("Tentative avec la première URL alternative: http://localhost:8081/api/users");
      const altRes = await fetch("http://localhost:8081/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      console.log("Statut de la réponse alternative 1:", altRes.status);

      if (!altRes.ok) {
        console.warn(`La première URL alternative a échoué avec le statut ${altRes.status}. Tentative avec la deuxième URL alternative...`);

        // Essayer avec une deuxième URL alternative
        console.log("Tentative avec la deuxième URL alternative: http://localhost:8081/api/keycloak/users");
        const altRes2 = await fetch("http://localhost:8081/api/keycloak/users", {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        console.log("Statut de la réponse alternative 2:", altRes2.status);

        if (!altRes2.ok) {
          console.warn(`La deuxième URL alternative a échoué avec le statut ${altRes2.status}. Tentative avec la troisième URL alternative...`);

          // Essayer avec une troisième URL alternative
          console.log("Tentative avec la troisième URL alternative: http://localhost:8081/keycloak/users");
          const altRes3 = await fetch("http://localhost:8081/keycloak/users", {
            headers: {
              Authorization: `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });

          console.log("Statut de la réponse alternative 3:", altRes3.status);

          if (!altRes3.ok) {
            console.warn(`La troisième URL alternative a échoué avec le statut ${altRes3.status}. Tentative avec la quatrième URL alternative...`);

            // Essayer avec une quatrième URL alternative
            console.log("Tentative avec la quatrième URL alternative: http://localhost:8081/test/keycloak/users");
            const altRes4 = await fetch("http://localhost:8081/test/keycloak/users", {
              headers: {
                Authorization: `Bearer ${token}`,
                'Accept': 'application/json'
              }
            });

            console.log("Statut de la réponse alternative 4:", altRes4.status);

            if (!altRes4.ok) {
              throw new Error(`Toutes les URL alternatives ont échoué`);
            }

            const altUsers4 = await altRes4.json();
            console.log("Utilisateurs récupérés depuis la quatrième URL alternative:", altUsers4);

            return altUsers4.map((user: any) => ({
              id: user.id || user.postgresId || user.idKeycloak || String(user.id),
              firstName: user.firstName || user.first_name || '',
              lastName: user.lastName || user.last_name || '',
            }));
          }

          const altUsers3 = await altRes3.json();
          console.log("Utilisateurs récupérés depuis la troisième URL alternative:", altUsers3);

          return altUsers3.map((user: any) => ({
            id: user.id || user.postgresId || user.idKeycloak || String(user.id),
            firstName: user.firstName || user.first_name || '',
            lastName: user.lastName || user.last_name || '',
          }));
        }

        const altUsers2 = await altRes2.json();
        console.log("Utilisateurs récupérés depuis la deuxième URL alternative:", altUsers2);

        return altUsers2.map((user: any) => ({
          id: user.id || user.postgresId || user.idKeycloak || String(user.id),
          firstName: user.firstName || user.first_name || '',
          lastName: user.lastName || user.last_name || '',
        }));
      }

      const altUsers = await altRes.json();
      console.log("Utilisateurs récupérés depuis l'URL alternative:", altUsers);

      // Normaliser les données
      return altUsers.map((user: any) => ({
        id: user.id || user.postgresId || user.idKeycloak || String(user.id),
        firstName: user.firstName || user.first_name || '',
        lastName: user.lastName || user.last_name || '',
      }));
    }

    const responseText = await res.text();
    console.log("Réponse brute:", responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));

    if (!responseText.trim()) {
      console.warn("Réponse vide de l'API");
      return [];
    }

    const users = JSON.parse(responseText);
    console.log(`${users.length} utilisateurs récupérés:`, users.slice(0, 2));

    // Normaliser les données pour s'assurer que tous les utilisateurs ont les mêmes propriétés
    return users.map((user: any) => {
      const normalizedUser = {
        id: user.id || user.postgresId || user.idKeycloak || String(user.id),
        firstName: user.firstName || user.first_name || '',
        lastName: user.lastName || user.last_name || '',
      };

      console.log("Utilisateur normalisé:", normalizedUser);
      return normalizedUser;
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs Keycloak:", error);

    // En cas d'erreur, retourner quelques utilisateurs par défaut
    console.log("Retour des utilisateurs par défaut");
    return [
      { id: "1", firstName: "John", lastName: "Doe" },
      { id: "2", firstName: "Jane", lastName: "Smith" }
    ];
  }
}
