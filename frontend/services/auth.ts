// Service d'authentification pour le backend

// Fonction pour obtenir les en-têtes d'authentification
export const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Fonction pour tester la connexion au backend
export const testBackendConnection = async (token?: string, useBearer: boolean = true) => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = useBearer ? `Bearer ${token}` : token;
    }

    console.log('Test de connexion au backend - En-têtes:', headers);

    const response = await fetch('http://localhost:8081/api/projects', {
      headers: headers
    });

    console.log('Test de connexion au backend - Statut:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Test de connexion au backend - Erreur:', errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Test de connexion au backend - Erreur:', error);
    return false;
  }
};

// Fonction pour obtenir un token d'authentification directement
export const getDirectToken = async (username: string, password: string) => {
  try {
    const response = await fetch('http://localhost:8081/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur d\'authentification directe:', errorText);
      return null;
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Erreur d\'authentification directe:', error);
    return null;
  }
};

// Fonction pour vérifier si un token est valide
export const validateToken = async (token: string) => {
  try {
    const response = await fetch('http://localhost:8081/api/auth/validate', {
      headers: getAuthHeaders(token)
    });

    return response.ok;
  } catch (error) {
    console.error('Erreur de validation du token:', error);
    return false;
  }
};
