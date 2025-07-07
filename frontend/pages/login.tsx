import { useAuth } from "src/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function LoginPage() {
  const { login, isAuthenticated, initialized } = useAuth();
  const router = useRouter();

  // Rediriger vers la dernière page visitée si l'utilisateur est déjà authentifié
  useEffect(() => {
    if (initialized && isAuthenticated) {
      const lastVisitedPage = localStorage.getItem('lastVisitedPage') || '/';
      router.replace(lastVisitedPage);
    }
  }, [isAuthenticated, initialized, router]);

  // Fonction de connexion personnalisée qui redirige vers la dernière page visitée
  const handleLogin = () => {
    // Stocker l'URL de redirection dans le localStorage
    const redirectUrl = router.query.redirect || localStorage.getItem('lastVisitedPage') || '/';
    if (typeof redirectUrl === 'string') {
      localStorage.setItem('redirectAfterLogin', redirectUrl);
    }
    login();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '20px',
          color: '#333'
        }}>
          Connexion
        </h1>
        <p style={{ marginBottom: '30px', color: '#666' }}>
          Veuillez vous connecter pour accéder à l'application
        </p>
        <button
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
          onClick={handleLogin}
        >
          Se connecter avec Keycloak
        </button>
      </div>
    </div>
  );
}
