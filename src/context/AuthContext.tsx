import { createContext, useContext, useEffect, useState } from "react";
import Keycloak from "keycloak-js";

// Définir le type pour le contexte d'authentification
interface AuthContextProps {
  keycloak: Keycloak.KeycloakInstance | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
  login: () => void;
  logout: () => void;
  authHeader: () => { authorization?: string };
  hasRole: (roles: string | string[]) => boolean;
}

// Créer un contexte avec des valeurs par défaut
const AuthContext = createContext<AuthContextProps>({
  keycloak: null,
  isAuthenticated: false,
  isLoading: true,
  initialized: false,
  login: () => {},
  logout: () => {},
  authHeader: () => ({}),
  hasRole: () => false,
});

// Initialiser Keycloak (mais seulement côté client)
let keycloak: Keycloak.KeycloakInstance | null = null;

// Fonction pour obtenir l'instance Keycloak
const getKeycloak = () => {
  if (typeof window !== 'undefined' && !keycloak) {
    keycloak = new Keycloak({
      url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
      realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
    });
  }
  return keycloak;
};

// Composant AuthProvider
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Éviter l'initialisation côté serveur
    if (typeof window === 'undefined') return;

    // Éviter la double initialisation
    if (initialized) return;

    const kc = getKeycloak();
    if (!kc) return;

    kc.init({
      onLoad: "check-sso",
      silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
    })
    .then((authenticated: boolean) => {
      setIsAuthenticated(authenticated);
      setIsLoading(false);
      setInitialized(true);

      if (authenticated) {
        // 🔄 Vérifie et rafraîchit le token toutes les 30 secondes
        const refreshInterval = setInterval(() => {
          kc.updateToken(30).then((refreshed) => {
            if (refreshed) {
              console.log("✅ Token rafraîchi automatiquement");
              localStorage.setItem("kcToken", kc.token!);
              localStorage.setItem("kcRefreshToken", kc.refreshToken!);
            }
          }).catch(() => {
            console.warn("⚠️ Échec du rafraîchissement du token, redirection vers login");
            kc.login();
          });
        }, 30000); // toutes les 30 secondes

        return () => clearInterval(refreshInterval); // nettoyage si le composant démonte
      }

      // Si l'utilisateur est authentifié, vérifier s'il y a une page à laquelle rediriger
      if (authenticated) {
        // Récupérer la dernière page visitée depuis localStorage
        const lastVisitedPage = localStorage.getItem('lastVisitedPage');

        // Si nous sommes sur la page de connexion et qu'il y a une page précédente, y rediriger
        if (window.location.pathname === '/login' && lastVisitedPage && lastVisitedPage !== '/login') {
          window.location.href = lastVisitedPage;
        }
      }
    })
    .catch((err: Error) => {
      console.error("Keycloak init failed", err);
      setIsLoading(false);
      setInitialized(true);
    });
  }, [initialized]);

  // Fonction pour se connecter
  const login = () => {
    const kc = getKeycloak();
    if (!isAuthenticated && kc) {
      // Configurer les options de redirection
      const options: Keycloak.KeycloakLoginOptions = {};

      // Utiliser l'URL stockée dans localStorage si elle existe
      if (typeof window !== 'undefined') {
        const redirectUri = window.location.origin;
        options.redirectUri = redirectUri;
      }

      kc.login(options);
    }
  };

  // Fonction pour se déconnecter
  const logout = () => {
    const kc = getKeycloak();
    if (kc) {
      // Spécifier l'URL de redirection après la déconnexion
      const redirectUri = window.location.origin;
      kc.logout({ redirectUri });
    }
  };

  // Fonction pour générer les en-têtes d'autorisation
  const authHeader = () => {
    const kc = getKeycloak();
    const token = kc?.token;
    return token ? { authorization: `Bearer ${token}` } : {};
  };

  // Fonction pour vérifier les rôles de l'utilisateur
  const hasRole = (roles: string | string[]) => {
    const kc = getKeycloak();
    const userRoles = kc?.tokenParsed?.realm_access?.roles || [];
    return Array.isArray(roles)
      ? roles.some((role) => userRoles.includes(role))
      : userRoles.includes(roles);
  };

  return (
    <AuthContext.Provider
      value={{
        keycloak: getKeycloak(),
        isAuthenticated,
        isLoading,
        login,
        logout,
        authHeader,
        hasRole,
        initialized
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

