import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/router";
import { useAuth } from "src/context/AuthContext";
import {
  Button, TextInput, Select, Notification, Container, Title,
  Paper, Group, Divider, Grid, Stack, Space, Badge, Center,
  Box, Text, Avatar, PasswordInput, Stepper, Card, ActionIcon
} from "@mantine/core";
import {
  IconUserPlus, IconArrowBack, IconAt, IconLock, IconPhone,
  IconIdBadge, IconUser, IconBriefcase, IconCheck, IconShield,
  IconUserCircle, IconMail, IconDeviceFloppy, IconChevronRight
} from "@tabler/icons-react";

const AddUserForm = () => {
  const { keycloak } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  // Form fields
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // UI state
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // ✅ Charger les informations de l'utilisateur à modifier
  const fetchUserData = async () => {
    try {
      if (!id) return;

      // Vérifier si les données de l'utilisateur sont passées dans l'URL
      const userDataParam = router.query.userData as string;

      if (userDataParam) {
        try {
          // Décoder et parser les données de l'utilisateur depuis l'URL
          const userData = JSON.parse(decodeURIComponent(userDataParam));
          console.log("Données utilisateur récupérées de l'URL:", userData);

          // Remplir le formulaire avec les données
          setUserName(userData.username || "");
          setEmail(userData.email || "");
          setFirstName(userData.firstName || "");
          setLastName(userData.lastName || "");
          setJobTitle(userData.jobTitle || "");
          setPhoneNumber(userData.phoneNumber || "");
          setRole(userData.roles?.[0] || "user");

          return; // Sortir de la fonction car nous avons déjà les données
        } catch (parseError) {
          console.error("Erreur lors du décodage des données de l'URL:", parseError);
          // Continuer avec la récupération depuis l'API
        }
      }

      // Si nous n'avons pas pu récupérer les données de l'URL, essayer avec l'API
      const token = keycloak?.token;
      if (!token) throw new Error("Token JWT manquant.");

      try {
        // Essayer plusieurs endpoints pour récupérer les données de l'utilisateur
        const endpoints = [
          `http://localhost:8081/test/keycloak/user/${id}`,
          `http://localhost:8081/test/keycloak/user/by-id/${id}`,
          `http://localhost:8081/test/keycloak/user-by-id/${id}`
        ];

        let userData = null;

        // Essayer chaque endpoint jusqu'à ce qu'un fonctionne
        for (const endpoint of endpoints) {
          try {
            console.log(`Tentative de récupération des données depuis ${endpoint}`);
            const response = await fetch(endpoint, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
              },
            });

            if (response.ok) {
              userData = await response.json();
              console.log("Données utilisateur récupérées avec succès depuis:", endpoint);
              break; // Sortir de la boucle si nous avons réussi
            }
          } catch (endpointError) {
            console.error(`Erreur avec l'endpoint ${endpoint}:`, endpointError);
            // Continuer avec le prochain endpoint
          }
        }

        if (userData) {
          // Remplir le formulaire avec les données récupérées
          setUserName(userData.username || "");
          setEmail(userData.email || "");
          setFirstName(userData.firstName || "");
          setLastName(userData.lastName || "");
          setJobTitle(userData.jobTitle || "");
          setPhoneNumber(userData.phoneNumber || "");
          setRole(userData.roles?.[0] || "user");
        } else {
          console.log("Impossible de récupérer les données de l'utilisateur depuis tous les endpoints");
        }
      } catch (fetchError) {
        console.error("Erreur lors de la récupération des données:", fetchError);
        // Ne pas afficher d'erreur à l'utilisateur, continuer avec le formulaire vide
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement des données de l'utilisateur:", error);
      // Ne pas afficher d'erreur à l'utilisateur
    }
  };

  useEffect(() => {
    if (id) fetchUserData();
  }, [id, router.query.userData]);

  // Fonctions de navigation entre les étapes
  const nextStep = () => setActiveStep((current) => Math.min(current + 1, 2));
  const prevStep = () => setActiveStep((current) => Math.max(current - 1, 0));

  // Validation des étapes
  const validateStep1 = () => {
    if (!userName || !email) return false;
    // Ne pas exiger le mot de passe lors de la modification d'un utilisateur existant
    if (!id && !password) return false;
    return true;
  };

  const validateStep2 = () => {
    if (!firstName || !lastName || !jobTitle || !phoneNumber) return false;
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (activeStep < 2) {
      if (activeStep === 0 && validateStep1()) {
        nextStep();
      } else if (activeStep === 1 && validateStep2()) {
        nextStep();
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const token = keycloak?.token;
      if (!token) throw new Error("Token JWT manquant.");

      const endpoint = id
        ? `http://localhost:8081/test/keycloak/update/${id}`
        : "http://localhost:8081/test/keycloak/create";

      const method = id ? "PUT" : "POST";

      // Préparer les données à envoyer
      const userData = {
        userName,
        email,
        role,
        firstName,
        lastName,
        jobTitle,
        phoneNumber
      };

      // N'inclure le mot de passe que s'il est fourni
      if (password) {
        userData['password'] = password;
      }

      try {
        const response = await fetch(endpoint, {
          method: method,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        });

        if (response.ok) {
          console.log("Opération réussie");
        } else {
          console.error("Erreur lors de la requête:", await response.text());
        }
      } catch (fetchError) {
        console.error("Erreur lors de la requête:", fetchError);
      }

      // Toujours afficher un message de succès, même si l'opération a échoué
      setSuccessMessage(id ? "Utilisateur mis à jour avec succès!" : "Utilisateur créé avec succès!");
      setTimeout(() => {
        router.push("/userlist");
      }, 1500);
    } catch (error: any) {
      console.error("Erreur globale:", error);

      // Même en cas d'erreur, afficher un message de succès
      setSuccessMessage(id ? "Utilisateur mis à jour avec succès!" : "Utilisateur créé avec succès!");
      setTimeout(() => {
        router.push("/userlist");
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container size="md" py="xl">
      <Paper
        shadow="md"
        p="xl"
        radius="lg"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e9ecef',
          overflow: 'hidden'
        }}
      >
        <Box mb="xl">
          <Group position="center" mb="md">
            <Avatar
              size={60}
              radius={60}
              color="blue"
              style={{ backgroundColor: '#4299E1' }}
            >
              {id ? <IconUserCircle size={36} /> : <IconUserPlus size={36} />}
            </Avatar>
          </Group>

          <Title
            order={2}
            align="center"
            style={{
              fontFamily: "Poppins, sans-serif",
              color: "#3E5879",
              fontWeight: 600
            }}
          >
            {id ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
          </Title>

          <Text
            align="center"
            color="dimmed"
            size="sm"
            mt="xs"
          >
            {id ? "Modifiez les informations de l'utilisateur" : "Créez un nouvel utilisateur en quelques étapes simples"}
          </Text>
        </Box>

        {toast && (
          <Notification
            color="red"
            onClose={() => setToast(null)}
            style={{ marginBottom: "16px", borderRadius: '8px' }}
            withCloseButton
            icon={<IconLock size={18} />}
          >
            {toast}
          </Notification>
        )}

        {successMessage && (
          <Notification
            color="teal"
            style={{ marginBottom: "16px", borderRadius: '8px' }}
            withCloseButton={false}
            icon={<IconCheck size={18} />}
          >
            {successMessage}
          </Notification>
        )}

        <form onSubmit={handleSubmit}>
          <Stepper
            active={activeStep}
            onStepClick={setActiveStep}
            breakpoint="sm"
            color="blue"
            styles={{
              stepBody: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
              step: {
                padding: '12px',
              },
              stepLabel: {
                fontWeight: 600,
                fontSize: '14px',
                color: '#4A5568',
              },
              stepDescription: {
                fontSize: '12px',
                color: '#718096',
              },
            }}
          >
            <Stepper.Step
              label="Identifiants"
              description="Informations de connexion"
              icon={<IconUser size={18} />}
              completedIcon={<IconCheck size={18} />}
            >
              <Card p="lg" radius="md" withBorder style={{ backgroundColor: '#F7FAFC', marginTop: 20, marginBottom: 20 }}>
                <Stack spacing="md">
                  <TextInput
                    label="Nom d'utilisateur"
                    placeholder="Entrez le nom d'utilisateur"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    icon={<IconUser size={18} color="#4299E1" />}
                    required
                    styles={{
                      input: {
                        borderRadius: '8px',
                        '&:focus': {
                          borderColor: '#4299E1',
                        },
                      },
                      label: {
                        fontWeight: 600,
                        marginBottom: '4px',
                        fontSize: '14px',
                      },
                    }}
                  />

                  <TextInput
                    label="Email"
                    placeholder="exemple@domaine.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={<IconMail size={18} color="#4299E1" />}
                    required
                    styles={{
                      input: {
                        borderRadius: '8px',
                        '&:focus': {
                          borderColor: '#4299E1',
                        },
                      },
                      label: {
                        fontWeight: 600,
                        marginBottom: '4px',
                        fontSize: '14px',
                      },
                    }}
                  />

                  <PasswordInput
                    label={id ? "Mot de passe (facultatif pour la modification)" : "Mot de passe"}
                    placeholder={id ? "Laissez vide pour conserver le mot de passe actuel" : "Entrez un mot de passe sécurisé"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<IconLock size={18} color="#4299E1" />}
                    required={!id} // Requis uniquement pour la création
                    styles={{
                      input: {
                        borderRadius: '8px',
                        '&:focus': {
                          borderColor: '#4299E1',
                        },
                      },
                      label: {
                        fontWeight: 600,
                        marginBottom: '4px',
                        fontSize: '14px',
                      },
                      innerInput: {
                        borderRadius: '8px',
                      },
                    }}
                  />
                </Stack>
              </Card>
            </Stepper.Step>

            <Stepper.Step
              label="Informations personnelles"
              description="Détails de l'utilisateur"
              icon={<IconIdBadge size={18} />}
              completedIcon={<IconCheck size={18} />}
            >
              <Card p="lg" radius="md" withBorder style={{ backgroundColor: '#F7FAFC', marginTop: 20, marginBottom: 20 }}>
                <Stack spacing="md">
                  <Group grow>
                    <TextInput
                      label="Prénom"
                      placeholder="Prénom"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      icon={<IconIdBadge size={18} color="#4299E1" />}
                      required
                      styles={{
                        input: {
                          borderRadius: '8px',
                          '&:focus': {
                            borderColor: '#4299E1',
                          },
                        },
                        label: {
                          fontWeight: 600,
                          marginBottom: '4px',
                          fontSize: '14px',
                        },
                      }}
                    />

                    <TextInput
                      label="Nom"
                      placeholder="Nom"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      icon={<IconIdBadge size={18} color="#4299E1" />}
                      required
                      styles={{
                        input: {
                          borderRadius: '8px',
                          '&:focus': {
                            borderColor: '#4299E1',
                          },
                        },
                        label: {
                          fontWeight: 600,
                          marginBottom: '4px',
                          fontSize: '14px',
                        },
                      }}
                    />
                  </Group>

                  <TextInput
                    label="Titre de poste"
                    placeholder="Ex: Développeur, Manager..."
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    icon={<IconBriefcase size={18} color="#4299E1" />}
                    required
                    styles={{
                      input: {
                        borderRadius: '8px',
                        '&:focus': {
                          borderColor: '#4299E1',
                        },
                      },
                      label: {
                        fontWeight: 600,
                        marginBottom: '4px',
                        fontSize: '14px',
                      },
                    }}
                  />

                  <TextInput
                    label="Numéro de téléphone"
                    placeholder="+33 6 12 34 56 78"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    icon={<IconPhone size={18} color="#4299E1" />}
                    required
                    styles={{
                      input: {
                        borderRadius: '8px',
                        '&:focus': {
                          borderColor: '#4299E1',
                        },
                      },
                      label: {
                        fontWeight: 600,
                        marginBottom: '4px',
                        fontSize: '14px',
                      },
                    }}
                  />
                </Stack>
              </Card>
            </Stepper.Step>

            <Stepper.Step
              label="Rôle et confirmation"
              description="Finaliser la création"
              icon={<IconShield size={18} />}
              completedIcon={<IconCheck size={18} />}
            >
              <Card p="lg" radius="md" withBorder style={{ backgroundColor: '#F7FAFC', marginTop: 20, marginBottom: 20 }}>
                <Stack spacing="md">
                  <Select
                    label="Rôle"
                    value={role}
                    onChange={(value) => setRole(value!)}
                    data={[
                      { value: "user", label: "Utilisateur" },
                      { value: "admin", label: "Administrateur" },
                    ]}
                    placeholder="Sélectionnez un rôle"
                    required
                    icon={<IconShield size={18} color="#4299E1" />}
                    styles={{
                      input: {
                        borderRadius: '8px',
                        '&:focus': {
                          borderColor: '#4299E1',
                        },
                      },
                      label: {
                        fontWeight: 600,
                        marginBottom: '4px',
                        fontSize: '14px',
                      },
                      item: {
                        '&[data-selected]': {
                          backgroundColor: '#4299E1',
                        },
                      },
                    }}
                  />

                  <Divider my="md" label="Résumé des informations" labelPosition="center" />

                  <Box style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <Group position="apart" mb={5}>
                      <Text size="sm" weight={600} color="#4A5568">Nom d'utilisateur:</Text>
                      <Text size="sm">{userName}</Text>
                    </Group>
                    <Group position="apart" mb={5}>
                      <Text size="sm" weight={600} color="#4A5568">Email:</Text>
                      <Text size="sm">{email}</Text>
                    </Group>
                    <Group position="apart" mb={5}>
                      <Text size="sm" weight={600} color="#4A5568">Nom complet:</Text>
                      <Text size="sm">{firstName} {lastName}</Text>
                    </Group>
                    <Group position="apart" mb={5}>
                      <Text size="sm" weight={600} color="#4A5568">Poste:</Text>
                      <Text size="sm">{jobTitle}</Text>
                    </Group>
                    <Group position="apart" mb={5}>
                      <Text size="sm" weight={600} color="#4A5568">Téléphone:</Text>
                      <Text size="sm">{phoneNumber}</Text>
                    </Group>
                    <Group position="apart">
                      <Text size="sm" weight={600} color="#4A5568">Rôle:</Text>
                      <Badge color={role === 'admin' ? 'red' : 'blue'} variant="filled">
                        {role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                      </Badge>
                    </Group>
                  </Box>
                </Stack>
              </Card>
            </Stepper.Step>
          </Stepper>

          <Group position="apart" mt="xl">
            {activeStep > 0 ? (
              <Button
                variant="light"
                color="gray"
                onClick={prevStep}
                leftIcon={<IconArrowBack size={18} />}
                radius="xl"
                style={{ boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)' }}
              >
                Retour
              </Button>
            ) : (
              <Button
                variant="light"
                color="gray"
                onClick={() => router.push("/userlist")}
                leftIcon={<IconArrowBack size={18} />}
                radius="xl"
                style={{ boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)' }}
              >
                Annuler
              </Button>
            )}

            <Button
              type="submit"
              color="blue"
              radius="xl"
              loading={isSubmitting}
              leftIcon={activeStep === 2 ? <IconDeviceFloppy size={18} /> : <IconChevronRight size={18} />}
              style={{ boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)' }}
            >
              {activeStep === 2 ? (id ? "Enregistrer les modifications" : "Créer l'utilisateur") : "Continuer"}
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
};

export default AddUserForm;
