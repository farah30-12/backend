import { useAuth } from "src/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Paper,
  Button,
  Avatar,
  Stack,
  Card,
  Notification,
} from "@mantine/core";

export default function HomePage() {
  const { keycloak, isAuthenticated } = useAuth();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!keycloak) return;

    if (keycloak?.authenticated && keycloak.tokenParsed) {
      const roles = keycloak.tokenParsed?.realm_access?.roles || [];
      const filteredRoles = roles.filter(
        (role: string) =>
          role !== "default-roles-qu2data-realm" &&
          role !== "offline_access" &&
          role !== "uma_authorization"
      );
      setUserRoles(filteredRoles);
      setTokenError(null);
    }
  }, [keycloak, isAuthenticated]);

  return (
    <Container size="md" py="xl" style={{
      minHeight: 'calc(100vh - 60px)',
      background: 'linear-gradient(135deg, #f0f4f8 0%, #d7e3fc 100%)',
      borderRadius: '15px',
      padding: '30px'
    }}>
      {tokenError && (
        <Notification color="red" onClose={() => setTokenError(null)}>
          {tokenError}
        </Notification>
      )}

      {!isAuthenticated ? (
        <Paper
          shadow="xl"
          p="xl"
          radius="md"
          withBorder
          style={{
            textAlign: 'center',
            background: 'linear-gradient(120deg, #ffffff 0%, #f8f9fa 100%)',
            border: '1px solid #e9ecef',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h1 style={{
              color: "#4361ee",
              fontSize: '2.5rem',
              fontWeight: 800,
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
            Bienvenue
          </h1>

          <p style={{
              color: "#495057",
              lineHeight: 1.6,
              fontSize: '1.125rem',
              maxWidth: '600px',
              margin: '0 auto 2rem auto'
            }}>
            Veuillez vous connecter pour accéder à l'application
          </p>

          <Button
            variant="gradient"
            gradient={{ from: "#4361ee", to: "#3f37c9", deg: 45 }}
            size="xl"
            style={{
              padding: "16px 32px",
              borderRadius: "10px",
              fontSize: "18px",
              boxShadow: '0 4px 14px rgba(67, 97, 238, 0.4)',
              transition: 'all 0.3s ease'
            }}
            onClick={() => keycloak?.login()}
          >
            Se connecter
          </Button>
        </Paper>
      ) : (
        <Paper
          shadow="xl"
          p="xl"
          radius="lg"
          withBorder
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)',
            border: '1px solid #e1ebf8',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h1 style={{
              color: "#4361ee",
              fontSize: '2.2rem',
              fontWeight: 800,
              marginBottom: '2rem',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}>
            Bienvenue dans votre espace
          </h1>

          <Card
            shadow="sm"
            p="xl"
            radius="md"
            withBorder
            style={{
              background: 'linear-gradient(120deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid #e9ecef',
              marginBottom: '2rem'
            }}
          >
            <Stack spacing="md" align="center">
              <Avatar
                size={100}
                radius="xl"
                color="blue"
                style={{
                  border: '4px solid #e7f5ff',
                  boxShadow: '0 8px 16px rgba(67, 97, 238, 0.3)'
                }}
              >
                {keycloak?.tokenParsed?.preferred_username?.charAt(0).toUpperCase()}
              </Avatar>

              <p style={{
                  color: '#3a0ca3',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginTop: '1rem'
                }}
              >
                Bonjour, {keycloak?.tokenParsed?.preferred_username}!
              </p>

              <p style={{
                  color: '#4361ee',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem'
                }}
              >
                📧 {keycloak?.tokenParsed?.email}
              </p>

              <p style={{
                  color: '#4361ee',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '1rem'
                }}
              >
                🧩 Rôles : {userRoles.length > 0 ? userRoles.join(", ") : "Aucun rôle"}
              </p>
            </Stack>
          </Card>

          <Button
            variant="gradient"
            gradient={{ from: "#4361ee", to: "#3f37c9", deg: 45 }}
            size="lg"
            style={{
              display: 'block',
              margin: '0 auto',
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "16px",
              boxShadow: '0 4px 14px rgba(67, 97, 238, 0.4)',
              transition: 'all 0.3s ease'
            }}
            onClick={() => router.push('/projects')}
          >
            Accéder à mes projets
          </Button>
        </Paper>
      )}


    </Container>
  );
}
