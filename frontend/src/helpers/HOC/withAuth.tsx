import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";

export default function withAuth(Component: React.ComponentType, requiredRole?: string) {
  return function ProtectedPage(props: any) {
    const { isAuthenticated, hasRole, initialized, isLoading } = useAuth();
    const router = useRouter();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Stocker l'URL actuelle dans le localStorage lors du chargement initial
    useEffect(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastVisitedPage', router.asPath);
      }
    }, []);

    useEffect(() => {
      // Ne vérifier l'authentification que lorsque Keycloak est complètement initialisé
      if (initialized && !isLoading) {
        setIsCheckingAuth(false);

        if (!isAuthenticated && !router.pathname.startsWith("/login")) {
          console.log("🔒 Not authenticated! Redirecting to login...");
          // Stocker l'URL actuelle pour y revenir après la connexion
          localStorage.setItem('lastVisitedPage', router.asPath);
          router.replace("/login");
        } else if (requiredRole && !hasRole(requiredRole)) {
          console.warn(`Access Denied! Role '${requiredRole}' required.`);
          router.replace("/unauthorized");
        }
      }
    }, [isAuthenticated, hasRole, router, initialized, isLoading]);

    // Afficher un indicateur de chargement pendant la vérification de l'authentification
    if (isCheckingAuth || !initialized || isLoading || !isAuthenticated || (requiredRole && !hasRole(requiredRole))) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div>Chargement...</div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}