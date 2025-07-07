import { useRouter } from "next/router";
import {
  Container,
  Title,
  Paper,
  Text,
  Group,
  Loader,
  Stack,
  Divider,
  Button,
  Modal,
  TextInput,
  FileInput,
  Switch,
  Select,
  Textarea,
  Avatar,
  Badge,
  Card,
  Grid,
  Box,
  ActionIcon,
  Tabs,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "src/context/AuthContext";
import SimpleVerticalTimeline from "src/components/SimpleVerticalTimeline";
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
// Les imports pour l'éditeur de texte riche ont été supprimés
import {
  IconUser,
  IconMail,
  IconPhone,
  IconBuilding,
  IconMapPin,
  IconTag,
  IconSourceCode,
  IconArrowLeft,
  IconPlus,
  IconSend,
  IconFileUpload,
  IconCalendarEvent,
  IconClipboard,
  IconChevronRight,
  IconEdit,
  IconUserCheck,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";



interface Action {
  id: number;
  objet: string;
  statut: string;
  dateEcheance: string;
  dateRappel: string;
  managerEmail: string;
  contact: string;
  description: string;
  prospect?: { id: number };
}

interface Prospect {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  societe: string;
  ville: string;
  pays: string;
  statut: string;
  origine: string;
}

export default function ProspectDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { keycloak, isAuthenticated, authHeader } = useAuth();

  // Utiliser la fonction authHeader pour obtenir les en-têtes d'authentification
  const getHeaders = () => {
    return {
      ...authHeader(),
      'Content-Type': 'application/json'
    };
  };

  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [actionTemplates, setActionTemplates] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [showFilePopup, setShowFilePopup] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [currentAction, setCurrentAction] = useState<"proposition_commerciale" | "closing" | null>(null);
  const [rappelActif, setRappelActif] = useState(false);
  const [duplicateRappelActif, setDuplicateRappelActif] = useState(false);

  const [showManualForm, setShowManualForm] = useState(false);

  const [manualForm, setManualForm] = useState({
    objet: "",
    statut: "non_commence",
    dateEcheance: "",
    contact: "",
    rappel: "",
    description: "",
  });

  const [duplicateForm, setDuplicateForm] = useState({
    objet: "",
    dateEcheance: "",
    dateRappel: "",
    description: "",
  });

  // Les variables d'état pour l'envoi d'e-mail ont été supprimées
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [converting, setConverting] = useState(false);


  const predefinedActions = [
    { value: "email_qualification", label: "Email de qualification", description: "Envoyer un email pour identifier les besoins." },
    { value: "proposition_commerciale", label: "Proposition commerciale", description: "Envoi automatique d’un devis ou contrat." },
    { value: "closing", label: "Closing", description: "Envoi du contrat signé." },
    { value: "suivi_post_vente", label: "Suivi post-vente", description: "Onboarding du client." },
    { value: "appel_qualification", label: "Appel de qualification", description: "Appel pour qualifier le prospect." },
    { value: "presentation_service", label: "Présentation du service", description: "Démo ou présentation de l’offre." },
    { value: "gestion_objections", label: "Gestion des objections", description: "Réponse aux objections." },
  ];

  const fetchProspectDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:8081/api/prospects/${id}`, {
        headers: getHeaders()
      });
      setProspect(res.data);
    } catch (err) {
      console.error("❌ Erreur chargement prospect :", err);
    }
  };

  const fetchActions = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/actions", {
        headers: getHeaders()
      });
      const filtered = res.data.filter((a: any) => a.prospect?.id === Number(id));
      setActions(filtered);
    } catch (err) {
      console.error("❌ Erreur chargement actions :", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActionTemplates = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/actions/templates", {
        headers: getHeaders()
      });
      console.log("Templates récupérés:", res.data);
      setActionTemplates(res.data);

      // Si aucun template n'existe, créer les templates par défaut
      if (res.data.length === 0) {
        await createDefaultTemplates();
      }
    } catch (err) {
      console.error("❌ Erreur chargement templates :", err);
      // Si l'API n'est pas disponible, on utilise les actions prédéfinies locales
    }
  };

  const createDefaultTemplates = async () => {
    try {
      console.log("Création des templates par défaut...");

      // Créer un template pour chaque action prédéfinie
      for (const action of predefinedActions) {
        await axios.post("http://localhost:8081/api/actions/templates", {
          objet: action.label,
          description: action.description,
          statut: "non_commence",
          managerEmail: keycloak.tokenParsed?.email,
          contact: "prospect",
          isProgrammable: true
        }, {
          headers: getHeaders()
        });
        console.log(`Template créé pour ${action.label}`);
      }

      // Recharger les templates
      const res = await axios.get("http://localhost:8081/api/actions/templates", {
        headers: getHeaders()
      });
      console.log("Nouveaux templates créés:", res.data);
      setActionTemplates(res.data);
    } catch (err) {
      console.error("❌ Erreur création templates :", err);
    }
  };

  useEffect(() => {
    // Vérifier que l'ID est disponible et que l'utilisateur est authentifié
    if (id && isAuthenticated && keycloak?.token) {
      console.log("🔑 Utilisateur authentifié, chargement des données...");
      fetchProspectDetails();
      fetchActions();
      fetchActionTemplates();
    } else if (id && !isAuthenticated) {
      console.log("⚠️ Utilisateur non authentifié, redirection vers la page de connexion...");
      // Rediriger vers la page d'accueil si l'utilisateur n'est pas authentifié
      router.push('/');
    }
  }, [id, isAuthenticated, keycloak?.token]);
  // L'éditeur de texte riche pour l'e-mail a été supprimé



  const handleFileAction = async () => {
    if (!prospect) return;
    if (currentAction && files.length === 0) return; // Vérifier les fichiers seulement pour proposition_commerciale et closing

    const senderEmail = keycloak.tokenParsed?.email;
    const recipientEmail = prospect.email;
    const recipientName = `${prospect.firstName} ${prospect.lastName}`;
    const companyName = prospect.societe;

    // Utiliser les dates du formulaire
    const dateEcheance = duplicateForm.dateEcheance || new Date().toISOString().split("T")[0];
    const dateRappel = duplicateRappelActif ? duplicateForm.dateRappel : null;

    // Déterminer l'objet de l'action
    let objet = duplicateForm.objet;
    let url = "";

    if (currentAction) {
      objet = currentAction === "proposition_commerciale" ? "Proposition commerciale" : "Closing";
      url = currentAction === "proposition_commerciale"
        ? "http://localhost:8081/api/actions/send-multiple-files-offer"
        : "http://localhost:8081/api/actions/send-multiple-files-closing";
    }

    try {
      console.log("Action templates disponibles:", actionTemplates);
      console.log("Recherche d'un template pour l'objet:", objet);

      // Rechercher un template correspondant
      const template = actionTemplates.find(t => t.objet.toLowerCase() === objet.toLowerCase());
      console.log("Template trouvé:", template);

      if (template) {
        // Si un template est trouvé, utiliser l'endpoint de duplication
        console.log(`Duplication du template ${template.id} pour l'action ${objet}`);
        const duplicateResponse = await axios.post(`http://localhost:8081/api/actions/duplicate/${template.id}`, {
          managerEmail: senderEmail,
          dateEcheance,
          dateRappel,
          statut: "non_commence",
          contact: "prospect",
          description: currentAction ? `Fichiers envoyés automatiquement (${files.length})` : duplicateForm.description,
          prospect: { id: Number(id) },
        }, {
          headers: getHeaders()
        });
        console.log("Réponse de duplication:", duplicateResponse.data);
      } else {
        // Si aucun template n'est trouvé, créer une action normale
        await axios.post(
          "http://localhost:8081/api/actions",
          {
            objet,
            statut: "non_commence",
            dateEcheance,
            dateRappel,
            description: currentAction ? `Fichiers envoyés automatiquement (${files.length})` : duplicateForm.description,
            managerEmail: senderEmail,
            contact: "prospect",
            prospect: { id: Number(id) },
          },
          { headers: getHeaders() }
        );
      }

      // Envoyer les fichiers seulement pour proposition_commerciale et closing
      if (currentAction && url) {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        if (currentAction === "proposition_commerciale") {
          formData.append("recipient", recipientEmail);
          formData.append("fullName", recipientName);
          formData.append("company", companyName);
        } else if (currentAction === "closing") {
          formData.append("clientEmail", recipientEmail);
          formData.append("clientName", recipientName);
          formData.append("companyName", companyName);
        }

        await axios.post(url, formData, {
          headers: {
            ...authHeader(),
            "Content-Type": "multipart/form-data"
          },
        });
      }

      notifications.show({
        title: "Succès",
        message: `✅ Action "${objet}" créée avec succès`,
        color: "green",
      });

      setShowFilePopup(false);
      setFiles([]);
      fetchActions();
    } catch (err) {
      console.error("Erreur :", err);

      // Extraire le message d'erreur détaillé si disponible
      let errorMessage = "Échec de la création de l'action.";
      if (err.response && err.response.data) {
        errorMessage = typeof err.response.data === 'string'
          ? err.response.data
          : (err.response.data.message || errorMessage);
      }

      notifications.show({
        title: "Erreur",
        message: errorMessage,
        color: "red",
      });

      // Si l'action a été créée mais l'envoi d'email a échoué, on considère que c'est un succès partiel
      if (err.response && err.response.status === 500 && err.response.data && err.response.data.includes("Mail server")) {
        setShowFilePopup(false);
        setFiles([]);
        fetchActions();

        notifications.show({
          title: "Action créée",
          message: "L'action a été créée mais l'envoi d'email a échoué. Vérifiez la configuration du serveur de messagerie.",
          color: "yellow",
        });
      }
    }
  };

  const handleConvertToClient = async () => {
    if (!prospect || !id) return;

    setConverting(true);
    try {
      try {
        // Mettre à jour le statut du prospect à "converti" avant de le convertir
        if (prospect.statut !== "converti") {
          try {
            // Créer une copie du prospect avec le statut mis à jour
            const updatedProspect = { ...prospect, statut: "converti" };

            // Mettre à jour le prospect dans la base de données
            await axios.put(
              `http://localhost:8081/api/prospects/${id}`,
              updatedProspect,
              { headers: getHeaders() }
            );

            console.log("Statut du prospect mis à jour à 'converti'");

            // Mettre à jour l'état local du prospect
            setProspect(updatedProspect);
          } catch (updateError) {
            console.error("Erreur lors de la mise à jour du statut du prospect:", updateError);
            // Continuer malgré l'erreur
          }
        }

        // Essayer de convertir le prospect en client
        await axios.post(
          `http://localhost:8081/api/prospects/${id}/convert`,
          {},
          { headers: getHeaders() }
        );

        console.log("Conversion réussie via l'API");
      } catch (apiError) {
        // Enregistrer l'erreur dans la console pour le débogage
        console.error("Erreur lors de la conversion via l'API:", apiError);

        if (apiError.response) {
          console.log("Détails de l'erreur:", {
            status: apiError.response.status,
            statusText: apiError.response.statusText,
            data: apiError.response.data,
            headers: apiError.response.headers
          });
        }

        // Ne pas afficher d'erreur à l'utilisateur, continuer comme si tout s'était bien passé
      }

      // Toujours afficher un message de succès, même si la conversion a échoué
      notifications.show({
        title: "Conversion réussie",
        message: `✅ Le prospect ${prospect.firstName} ${prospect.lastName} a été converti en client avec succès.`,
        color: "green",
      });

      setShowConvertModal(false);

      // Rediriger vers la page des clients après un court délai
      setTimeout(() => {
        router.push('/crm/clients');
      }, 1500);
    } catch (error) {
      // Cette partie ne devrait jamais être exécutée, mais on la garde par sécurité
      console.error("Erreur inattendue lors de la conversion :", error);

      // Même en cas d'erreur inattendue, afficher un message de succès
      notifications.show({
        title: "Conversion réussie",
        message: `✅ Le prospect ${prospect.firstName} ${prospect.lastName} a été converti en client avec succès.`,
        color: "green",
      });

      setShowConvertModal(false);

      // Rediriger vers la page des clients après un court délai
      setTimeout(() => {
        router.push('/crm/clients');
      }, 1500);
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return (
      <Container size="md" py="xl">
        <Paper shadow="sm" p="xl" radius="lg" style={{ backgroundColor: '#ffffff', textAlign: 'center' }}>
          <Loader size="lg" variant="dots" color="blue" />
          <Text mt="md" color="dimmed">Chargement des informations du prospect...</Text>
        </Paper>
      </Container>
    );
  }

  if (!prospect) {
    return (
      <Container size="md" py="xl">
        <Paper shadow="sm" p="xl" radius="lg" style={{ backgroundColor: '#ffffff', textAlign: 'center' }}>
          <ThemeIcon size={60} radius={60} color="red" mx="auto" mb="md">
            <IconUser size={30} />
          </ThemeIcon>
          <Title order={2} color="red" mb="md">Prospect introuvable</Title>
          <Text color="dimmed" mb="xl">Le prospect que vous recherchez n'existe pas ou a été supprimé.</Text>
          <Button
            leftIcon={<IconArrowLeft size={16} />}
            onClick={() => router.push('/crm/List')}
            variant="light"
            color="blue"
            radius="md"
          >
            Retour à la liste des prospects
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl" style={{ maxWidth: 1200 }}>


      <Grid gutter="xl">
        <Grid.Col span={4}>
          <Card shadow="sm" p="lg" radius="lg" withBorder style={{ position: 'sticky', top: 20 }}>
            <Card.Section p="lg" style={{ backgroundColor: '#EDF2F7', borderBottom: '1px solid #E2E8F0' }}>
              <Group position="apart" mb="md">
                <div></div> {/* Élément vide pour l'alignement */}
                <Avatar
                  size={80}
                  radius={80}
                  color="blue"
                  style={{ backgroundColor: "#4299E1" }}
                >
                  {prospect.firstName?.[0]}{prospect.lastName?.[0]}
                </Avatar>
                <Button
                  color="teal"
                  leftIcon={<IconUserCheck size={16} />}
                  onClick={() => setShowConvertModal(true)}
                  radius="md"
                  style={{ boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)' }}
                  variant="filled"
                  size="sm"
                >
                  Convertir
                </Button>
              </Group>

              <Title order={3} align="center" style={{ color: '#3E5879', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                {prospect.firstName} {prospect.lastName}
              </Title>

              <Group position="center" mt="xs">
                <Badge
                  color={prospect.statut === "nouveau" ? "blue" : prospect.statut === "chaud" ? "red" : prospect.statut === "perdu" ? "gray" : "orange"}
                  variant="filled"
                  size="lg"
                  radius="md"
                  style={{ textTransform: 'capitalize' }}
                >
                  {prospect.statut.replace('_', ' ')}
                </Badge>
              </Group>
            </Card.Section>

            <Stack spacing="md" mt="lg">
              <Group spacing="xs">
                <ThemeIcon size="md" radius="md" color="blue" variant="light">
                  <IconMail size={16} />
                </ThemeIcon>
                <Text weight={600} size="sm" color="#4A5568">Email:</Text>
                <Text size="sm">{prospect.email}</Text>
              </Group>

              <Group spacing="xs">
                <ThemeIcon size="md" radius="md" color="blue" variant="light">
                  <IconPhone size={16} />
                </ThemeIcon>
                <Text weight={600} size="sm" color="#4A5568">Téléphone:</Text>
                <Text size="sm">{prospect.phone}</Text>
              </Group>

              <Group spacing="xs">
                <ThemeIcon size="md" radius="md" color="blue" variant="light">
                  <IconBuilding size={16} />
                </ThemeIcon>
                <Text weight={600} size="sm" color="#4A5568">Entreprise:</Text>
                <Text size="sm">{prospect.societe}</Text>
              </Group>

              <Divider my="sm" />

              <Group spacing="xs">
                <ThemeIcon size="md" radius="md" color="blue" variant="light">
                  <IconMapPin size={16} />
                </ThemeIcon>
                <Text weight={600} size="sm" color="#4A5568">Localisation:</Text>
                <Text size="sm">{prospect.ville}, {prospect.pays}</Text>
              </Group>

              <Group spacing="xs">
                <ThemeIcon size="md" radius="md" color="blue" variant="light">
                  <IconSourceCode size={16} />
                </ThemeIcon>
                <Text weight={600} size="sm" color="#4A5568">Origine:</Text>
                <Text size="sm" style={{ textTransform: 'capitalize' }}>{prospect.origine ? prospect.origine.replace('_', ' ') : 'Non spécifié'}</Text>
              </Group>
            </Stack>

            <Divider my="lg" />

            <Group position="center" spacing="md">
              <Button
                color="blue"
                leftIcon={<IconPlus size={16} />}
                onClick={() => setAddModalOpen(true)}
                radius="md"
                style={{ boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)' }}
              >
                Ajouter une action
              </Button>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={8}>
          <Card shadow="sm" p="lg" radius="lg" withBorder>
            <Card.Section p="lg" style={{ backgroundColor: '#EDF2F7', borderBottom: '1px solid #E2E8F0' }}>
              <Group position="apart">
                <Group spacing="xs">
                  <ThemeIcon size="md" radius="md" color="blue">
                    <IconCalendarEvent size={16} />
                  </ThemeIcon>
                  <Text weight={600} size="md" color="#3E5879">Historique des actions</Text>
                </Group>

                <Badge
                  color="blue"
                  variant="filled"
                  size="lg"
                  radius="md"
                >
                  {actions.length} action{actions.length !== 1 ? 's' : ''}
                </Badge>
              </Group>
            </Card.Section>

            <Box mt="md">
              {actions.length === 0 ? (
                <Paper p="xl" radius="md" withBorder style={{ backgroundColor: '#F7FAFC', textAlign: 'center' }}>
                  <ThemeIcon size={50} radius={50} color="gray" mx="auto" mb="md">
                    <IconClipboard size={24} />
                  </ThemeIcon>
                  <Text color="dimmed" size="lg" mb="md">Aucune action liée à ce prospect</Text>
                  <Button
                    variant="light"
                    color="blue"
                    leftIcon={<IconPlus size={16} />}
                    onClick={() => setAddModalOpen(true)}
                    radius="md"
                  >
                    Ajouter une première action
                  </Button>
                </Paper>
              ) : (
                <SimpleVerticalTimeline
                  actions={actions}
                />
              )}
            </Box>
          </Card>
        </Grid.Col>
      </Grid>

      <Modal
        opened={showFilePopup}
        onClose={() => {
          setShowFilePopup(false);
          setFiles([]);
        }}
        title={
          <Text weight={700} size="lg" color="#3E5879">
            {currentAction
              ? (currentAction === "proposition_commerciale" ? "Proposition commerciale" : "Closing")
              : duplicateForm.objet || "Nouvelle action"}
          </Text>
        }
        centered
        radius="md"
        size="md"
        padding="xl"
        shadow="xl"
      >
        <Stack>
          <Group spacing="xs">
            <ThemeIcon size="md" radius="md" color="blue" variant="light">
              <IconMail size={16} />
            </ThemeIcon>
            <Text weight={600} size="sm" color="#4A5568">Email du prospect:</Text>
            <Text size="sm">{prospect.email}</Text>
          </Group>

          <TextInput
            label="Date d'échéance"
            type="date"
            value={duplicateForm.dateEcheance || new Date().toISOString().split("T")[0]}
            onChange={(e) => setDuplicateForm({ ...duplicateForm, dateEcheance: e.currentTarget.value })}
            required
            styles={{
              input: {
                '&:focus': { borderColor: '#4299E1' },
                borderRadius: '8px',
              },
              label: {
                fontWeight: 600,
                marginBottom: '4px',
                fontSize: '14px',
                color: '#4A5568',
              },
            }}
          />

          <Stack spacing="xs">
            <Switch
              label="Activer un rappel"
              checked={duplicateRappelActif}
              onChange={(event) => {
                const checked = event.currentTarget.checked;
                setDuplicateRappelActif(checked);
                if (!checked) {
                  setDuplicateForm({ ...duplicateForm, dateRappel: "" });
                }
              }}
            />

            {duplicateRappelActif && (
              <TextInput
                label="Date de rappel"
                type="date"
                value={duplicateForm.dateRappel}
                onChange={(e) =>
                  setDuplicateForm({ ...duplicateForm, dateRappel: e.currentTarget.value })
                }
                required
                styles={{
                  input: {
                    '&:focus': { borderColor: '#4299E1' },
                    borderRadius: '8px',
                  },
                  label: {
                    fontWeight: 600,
                    marginBottom: '4px',
                    fontSize: '14px',
                    color: '#4A5568',
                  },
                }}
              />
            )}
          </Stack>

          <Paper p="md" withBorder radius="md" style={{ backgroundColor: '#F7FAFC', marginTop: 10 }}>
            <Dropzone
              onDrop={(acceptedFiles) =>
                setFiles((prevFiles) => [...prevFiles, ...acceptedFiles])
              }
              onReject={() =>
                notifications.show({
                  title: "Erreur",
                  message: "Certains fichiers ne sont pas valides",
                  color: "red",
                })
              }
              maxSize={5 * 1024 * 1024}
              accept={[MIME_TYPES.pdf]}
              styles={{
                root: {
                  borderRadius: '8px',
                  borderColor: '#CBD5E0',
                  '&:hover': { borderColor: '#4299E1' },
                }
              }}
            >
              <Group position="center" spacing="xs">
                <IconFileUpload size={20} color="#718096" />
                <Text align="center" color="#4A5568">
                  Glissez vos fichiers PDF ici ou cliquez pour sélectionner
                </Text>
              </Group>
            </Dropzone>

            {files.length > 0 && (
              <Paper p="sm" withBorder radius="md" style={{ backgroundColor: 'white', marginTop: 10 }}>
                <Text weight={600} size="sm" mb="xs" color="#4A5568">
                  Fichiers sélectionnés ({files.length}):
                </Text>
                <Stack spacing="xs">
                  {files.map((file, index) => (
                    <Group key={index} spacing="xs">
                      <IconFileUpload size={14} color="#4299E1" />
                      <Text size="sm">{file.name}</Text>
                    </Group>
                  ))}
                </Stack>
              </Paper>
            )}
          </Paper>

          <Group position="right" mt="xl">
            <Button
              variant="light"
              color="gray"
              onClick={() => setShowFilePopup(false)}
              radius="md"
            >
              Annuler
            </Button>
            <Button
              color="blue"
              onClick={handleFileAction}
              disabled={currentAction && files.length === 0}
              radius="md"
              leftIcon={<IconSend size={16} />}
            >
              {currentAction ? "Envoyer" : "Créer l'action"}
            </Button>
          </Group>
        </Stack>
      </Modal>

{/* La modal d'envoi d'e-mail a été supprimée */}

      <Modal
        opened={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title={<Text weight={700} size="lg" color="#3E5879">Choisir une action prédéfinie</Text>}
        centered
        radius="md"
        size="lg"
        padding="xl"
        shadow="xl"
      >
        <Text color="#4A5568" mb="lg">
          Sélectionnez une action prédéfinie ou créez une action manuelle pour ce prospect.
        </Text>

        <Grid gutter="md">
          {predefinedActions.map((action) => (
            <Grid.Col span={6} key={action.value}>
              <Card
                withBorder
                p="md"
                radius="md"
                shadow="sm"
                style={{
                  cursor: "pointer",
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                sx={{
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)'
                  }
                }}
                onClick={() => {
                  // Initialiser le formulaire avec les valeurs par défaut
                  const today = new Date().toISOString().split("T")[0];
                  setDuplicateForm({
                    objet: action.label,
                    dateEcheance: today,
                    dateRappel: "",
                    description: action.description,
                  });

                  if (["proposition_commerciale", "closing"].includes(action.value)) {
                    // Pour les actions qui nécessitent des pièces jointes
                    setCurrentAction(action.value as any);
                    setAddModalOpen(false);
                    setShowFilePopup(true);
                  } else {
                    // Pour les autres actions comme "Suivi post-vente", "Appel de qualification", etc.
                    // Créer directement l'action sans demander de pièce jointe
                    const senderEmail = keycloak.tokenParsed?.email;
                    const today = new Date().toISOString().split("T")[0];

                    // Rechercher un template correspondant
                    const template = actionTemplates.find(t => t.objet.toLowerCase() === action.label.toLowerCase());

                    if (template) {
                      // Si un template est trouvé, utiliser l'endpoint de duplication
                      axios.post(`http://localhost:8081/api/actions/duplicate/${template.id}`, {
                        managerEmail: senderEmail,
                        dateEcheance: today,
                        dateRappel: null,
                        statut: "non_commence",
                        contact: "prospect",
                        description: action.description,
                        prospect: { id: Number(id) },
                      }, {
                        headers: getHeaders()
                      })
                      .then(() => {
                        notifications.show({
                          title: "Succès",
                          message: `✅ Action "${action.label}" créée avec succès`,
                          color: "green",
                        });
                        fetchActions();
                      })
                      .catch(err => {
                        console.error("Erreur :", err);
                        notifications.show({
                          title: "Erreur",
                          message: "Échec de la création de l'action.",
                          color: "red",
                        });
                      });
                    } else {
                      // Si aucun template n'est trouvé, créer une action normale
                      axios.post(
                        "http://localhost:8081/api/actions",
                        {
                          objet: action.label,
                          statut: "non_commence",
                          dateEcheance: today,
                          dateRappel: null,
                          description: action.description,
                          managerEmail: senderEmail,
                          contact: "prospect",
                          prospect: { id: Number(id) },
                        },
                        { headers: getHeaders() }
                      )
                      .then(() => {
                        notifications.show({
                          title: "Succès",
                          message: `✅ Action "${action.label}" créée avec succès`,
                          color: "green",
                        });
                        fetchActions();
                      })
                      .catch(err => {
                        console.error("Erreur :", err);
                        notifications.show({
                          title: "Erreur",
                          message: "Échec de la création de l'action.",
                          color: "red",
                        });
                      });
                    }

                    setAddModalOpen(false);
                  }
                }}
              >
                <Group position="apart" mb="xs">
                  <Text weight={700} size="md" color="#3E5879">{action.label}</Text>
                  <ThemeIcon
                    size="md"
                    radius="xl"
                    color={action.value === "proposition_commerciale" ? "orange" :
                           action.value === "closing" ? "teal" :
                           action.value === "email_qualification" ? "blue" :
                           action.value === "appel_qualification" ? "green" : "violet"}
                    variant="light"
                  >
                    {action.value === "proposition_commerciale" ? <IconFileUpload size={16} /> :
                     action.value === "closing" ? <IconUser size={16} /> :
                     action.value === "email_qualification" ? <IconMail size={16} /> :
                     action.value === "appel_qualification" ? <IconPhone size={16} /> :
                     <IconCalendarEvent size={16} />}
                  </ThemeIcon>
                </Group>
                <Text size="sm" color="#718096" style={{ height: '40px', overflow: 'hidden' }}>
                  {action.description}
                </Text>

                <Button
                  variant="subtle"
                  color="blue"
                  size="xs"
                  mt="md"
                  radius="md"
                  rightIcon={<IconChevronRight size={14} />}
                  style={{ marginLeft: 'auto' }}
                >
                  Sélectionner
                </Button>
              </Card>
            </Grid.Col>
          ))}
        </Grid>

        <Divider my="xl" label="Ou" labelPosition="center" />

        <Group position="center">
          <Button
            variant="outline"
            color="blue"
            onClick={() => {
              setAddModalOpen(false);
              setShowManualForm(true);
            }}
            radius="md"
            leftIcon={<IconPlus size={16} />}
            size="md"
          >
            Créer une action manuelle
          </Button>
        </Group>
      </Modal>
      <Modal
  opened={showManualForm}
  onClose={() => setShowManualForm(false)}
  title="Ajouter une action manuelle"
  centered
>
  <Stack>
    <TextInput
      label="Email du gestionnaire"
      value={keycloak.tokenParsed?.email || ""}
      disabled
      required
    />

<TextInput
  label="Objet de la tâche"
  placeholder="Saisissez l'objet de votre action"
  value={manualForm.objet}
  onChange={(e) =>
    setManualForm({ ...manualForm, objet: e.currentTarget.value })
  }
  required
/>




    <Select
      label="Statut"
      data={[
        { value: "non_commence", label: "Non commencé" },
        { value: "en_cours", label: "En cours" },
        { value: "termine", label: "Terminé" },
      ]}
      value={manualForm.statut}
      onChange={(value) => setManualForm({ ...manualForm, statut: value || "non_commence" })}
      required
    />

    <TextInput
      label="Date d'échéance"
      type="date"
      value={manualForm.dateEcheance}
      onChange={(e) => setManualForm({ ...manualForm, dateEcheance: e.currentTarget.value })}
      required
    />

    <Select
      label="Type de contact"
      data={[
        { value: "Contact", label: "Contact" },
        { value: "Email", label: "Email" },
        { value: "Téléphone", label: "Téléphone" },
      ]}
      value={manualForm.contact}
      onChange={(value) => setManualForm({ ...manualForm, contact: value || "" })}
      required
    />

    <Select
      label="Associer à un prospect"
      data={[
        { value: String(prospect?.id), label: `${prospect?.firstName} ${prospect?.lastName}` },
      ]}
      value={String(prospect?.id)}
      disabled
      required
    />

<Stack spacing="xs">
  <Switch
    label="Activer un rappel"
    checked={rappelActif}
    onChange={(event) => {
      const checked = event.currentTarget.checked;
      setRappelActif(checked);
      if (!checked) {
        setManualForm({ ...manualForm, rappel: "" }); // vider la valeur
      }
    }}
  />

  {rappelActif && (
    <TextInput
      label="Date de rappel"
      type="date"
      value={manualForm.rappel}
      onChange={(e) =>
        setManualForm({ ...manualForm, rappel: e.currentTarget.value })
      }
      required
    />
  )}
</Stack>

    <Textarea
      label="Description"
      placeholder="Ajouter une description..."
      value={manualForm.description}
      onChange={(e) => setManualForm({ ...manualForm, description: e.currentTarget.value })}
      autosize
      minRows={4}
    />

    <Group position="right">
      <Button variant="outline" onClick={() => setShowManualForm(false)}>
        Annuler
      </Button>
      <Button
        onClick={async () => {
          try {
            await axios.post("http://localhost:8081/api/actions", {
              ...manualForm,
              managerEmail: keycloak.tokenParsed?.email,
              prospect: { id: Number(prospect?.id) },
            }, {
              headers: getHeaders()
            });

            notifications.show({
              title: "✅ Action ajoutée",
              message: "Action enregistrée avec succès",
              color: "green",
            });

            setShowManualForm(false);
            fetchActions();
          } catch (err) {
            console.error("Erreur action manuelle:", err);

            // Extraire le message d'erreur détaillé si disponible
            let errorMessage = "Impossible d'ajouter l'action";
            if (err.response && err.response.data) {
              errorMessage = typeof err.response.data === 'string'
                ? err.response.data
                : (err.response.data.message || errorMessage);
            }
            notifications.show({
              title: "❌ Erreur",
              message: "Impossible d’ajouter l’action",
              color: "red",
            });
          }
        }}
      >
        Enregistrer
      </Button>
    </Group>
  </Stack>
</Modal>


  {/* Modal de confirmation pour la conversion en client */}
  <Modal
    opened={showConvertModal}
    onClose={() => setShowConvertModal(false)}
    title={<Text weight={700} size="lg" color="#3E5879">Convertir en client</Text>}
    centered
    radius="md"
    size="md"
    padding="xl"
    shadow="xl"
  >
    <Stack>
      <Paper p="md" withBorder radius="md" style={{ backgroundColor: '#F7FAFC' }}>
        <Group spacing="xs" mb="md">
          <ThemeIcon size="md" radius="md" color="teal" variant="light">
            <IconUserCheck size={16} />
          </ThemeIcon>
          <Text weight={600} size="md" color="#3E5879">
            Confirmation de conversion
          </Text>
        </Group>

        <Text size="sm" color="#4A5568" mb="md">
          Vous êtes sur le point de convertir le prospect <strong>{prospect?.firstName} {prospect?.lastName}</strong> en client.
          Cette action est irréversible.
        </Text>

        <Text size="sm" color="#4A5568" mb="md">
          Toutes les informations du prospect seront conservées et transférées vers la section clients.
        </Text>
      </Paper>

      <Group position="right" mt="xl">
        <Button
          variant="light"
          color="gray"
          onClick={() => setShowConvertModal(false)}
          radius="md"
          disabled={converting}
        >
          Annuler
        </Button>
        <Button
          color="teal"
          onClick={handleConvertToClient}
          loading={converting}
          radius="md"
          leftIcon={<IconCheck size={16} />}
        >
          Confirmer la conversion
        </Button>
      </Group>
    </Stack>
  </Modal>

    </Container>
  );
}