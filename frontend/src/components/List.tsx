import {
  Button,
  Container,
  Grid,
  Paper,
  TextInput,
  Checkbox,
  Stack,
  Divider,
  Title,
  Group,
  Table,
  ScrollArea,
  Badge,
  Loader,
  Modal,
  Select,
  Text,
  Box,
  Avatar,
  Card,
  ActionIcon,
  Tooltip,
  Menu,
  Tabs,
} from "@mantine/core";
import {
  IconPlus,
  IconFilter,
  IconArrowLeft,
  IconSearch,
  IconEdit,
  IconTrash,
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconBuildingStore,
  IconRefresh,
  IconDotsVertical,
  IconUserPlus,
  IconChevronRight,
  IconAdjustments,
  IconCalendarEvent,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "src/context/AuthContext";
import { notifications } from '@mantine/notifications';

export default function ProspectList() {
  const router = useRouter();
  const { authHeader } = useAuth();

  const statutOptions = ["nouveau", "a_relancer", "perdu", "chaud", "converti"];

  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [lastActions, setLastActions] = useState({});
  const [loadingActions, setLoadingActions] = useState(true);
  const [newProspect, setNewProspect] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    societe: "",
    secteur: "",
    ville: "",
    pays: "",
    codePostal: "",
    description: "",
    statut: "",
    origine: "",
    gestionnaire: "",
  });

  const [search, setSearch] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    pays: "",
  });
  const [selectedStatut, setSelectedStatut] = useState<string[]>([]);
  const [selectedOrigine, setSelectedOrigine] = useState<string[]>([]);

  const fetchProspects = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/prospects", {
        headers: authHeader(),
      });
      setProspects(res.data);

      // Après avoir récupéré les prospects, récupérer les dernières actions pour chacun
      fetchLastActions(res.data);
    } catch (err) {
      console.error("❌ Erreur chargement prospects :", err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer la dernière action pour chaque prospect
  const fetchLastActions = async (prospectsList) => {
    setLoadingActions(true);
    try {
      console.log("Récupération des actions pour", prospectsList.length, "prospects");

      // Créer un objet vide pour stocker les actions
      const actionsMap = {};

      // Pour chaque prospect, récupérer toutes les actions et prendre la plus récente
      for (const prospect of prospectsList) {
        try {
          // Convertir l'ID en chaîne
          const prospectId = String(prospect.id);
          console.log("Récupération des actions pour le prospect ID:", prospectId);

          // Utiliser la même URL que celle utilisée dans la page détaillée du prospect
          try {
            const res = await axios.get("http://localhost:8081/api/actions", {
              headers: authHeader(),
            });

            // Filtrer les actions pour ce prospect spécifique
            const filtered = res.data.filter((a) => a.prospect?.id === Number(prospectId));
            console.log(`Actions filtrées pour le prospect ${prospectId}:`, filtered);

            if (filtered && filtered.length > 0) {
              // Trier les actions par date d'échéance (la plus récente en premier)
              const sortedActions = [...filtered].sort((a, b) =>
                new Date(b.dateEcheance).getTime() - new Date(a.dateEcheance).getTime()
              );

              actionsMap[prospectId] = sortedActions[0];
              console.log(`Dernière action pour prospect ${prospectId}:`, sortedActions[0].objet || "Sans titre");
            } else {
              console.log(`Aucune action trouvée pour le prospect ${prospectId}`);
              actionsMap[prospectId] = null;
            }
          } catch (error) {
            console.error(`Erreur lors de la récupération des actions pour le prospect ${prospectId}:`, error);
            actionsMap[prospectId] = null;
          }
        } catch (error) {
          console.error(`Erreur générale pour le prospect ${prospect.id}:`, error);
          actionsMap[String(prospect.id)] = null;
        }
      }

      console.log("Carte finale des actions:", actionsMap);
      setLastActions(actionsMap);
    } catch (err) {
      console.error("❌ Erreur chargement des actions :", err);
    } finally {
      setLoadingActions(false);
    }
  };

  useEffect(() => {
    fetchProspects();
  }, []);

  const handleStatutChange = (value: string) => {
    setSelectedStatut((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleOrigineChange = (value: string) => {
    setSelectedOrigine((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleEdit = (prospect: any) => {
    setEditingProspect(prospect);
    setEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer ce prospect ?")) {
      try {
        // Essayer de supprimer le prospect
        await axios.delete(`http://localhost:8081/api/prospects/${id}`, {
          headers: authHeader(),
        });
        fetchProspects();
        notifications.show({
          title: "Succès",
          message: "Le prospect a été supprimé avec succès",
          color: "green",
        });
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);

        // Si la suppression échoue, proposer de marquer le prospect comme "perdu"
        if (confirm("Impossible de supprimer ce prospect car il est référencé dans d'autres données. Voulez-vous le marquer comme 'perdu' à la place ?")) {
          try {
            // Récupérer d'abord les données actuelles du prospect
            const response = await axios.get(`http://localhost:8081/api/prospects/${id}`, {
              headers: authHeader(),
            });

            const prospectToUpdate = response.data;

            // Mettre à jour le statut du prospect à "perdu"
            await axios.put(
              `http://localhost:8081/api/prospects/${id}`,
              { ...prospectToUpdate, statut: "perdu" },
              { headers: authHeader() }
            );

            fetchProspects();
            notifications.show({
              title: "Succès",
              message: "Le prospect a été marqué comme 'perdu'",
              color: "blue",
            });
          } catch (updateError) {
            console.error("Erreur lors de la mise à jour du statut :", updateError);
            notifications.show({
              title: "Erreur",
              message: "Impossible de mettre à jour le statut du prospect.",
              color: "red",
            });
          }
        } else {
          notifications.show({
            title: "Information",
            message: "Aucune action n'a été effectuée sur le prospect.",
            color: "gray",
          });
        }
      }
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:8081/api/prospects/${editingProspect.id}`,
        editingProspect,
        { headers: authHeader() }
      );
      setEditModalOpen(false);
      fetchProspects();
      notifications.show({
        title: "Succès",
        message: "Le prospect a été mis à jour avec succès",
        color: "green",
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      notifications.show({
        title: "Erreur",
        message: "Impossible de mettre à jour ce prospect. Veuillez vérifier les informations saisies.",
        color: "red",
      });
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post("http://localhost:8081/api/prospects", newProspect, {
        headers: authHeader(),
      });
      setCreateModalOpen(false);
      fetchProspects(); // rafraîchir la liste
      setNewProspect({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        societe: "",
        secteur: "",
        ville: "",
        pays: "",
        codePostal: "",
        description: "",
        statut: "",
        origine: "",
        gestionnaire: "",
      });
      notifications.show({
        title: "Succès",
        message: "Le prospect a été créé avec succès",
        color: "green",
      });
    } catch (error) {
      console.error("Erreur lors de la création :", error);
      notifications.show({
        title: "Erreur",
        message: "Impossible de créer ce prospect. Veuillez vérifier les informations saisies.",
        color: "red",
      });
    }
  };

  const filteredProspects = prospects.filter((p) => {
    const matchFirstName = p.firstName?.toLowerCase().includes(search.firstName.toLowerCase());
    const matchLastName = p.lastName?.toLowerCase().includes(search.lastName.toLowerCase());
    const matchEmail = p.email?.toLowerCase().includes(search.email.toLowerCase());
    const matchPhone = p.phone?.toLowerCase().includes(search.phone.toLowerCase());
    const matchPays = p.pays?.toLowerCase().includes(search.pays.toLowerCase());
    const matchStatut = selectedStatut.length === 0 || selectedStatut.includes(p.statut);
    const matchOrigine = selectedOrigine.length === 0 || selectedOrigine.includes(p.origine);
    return (
      matchFirstName &&
      matchLastName &&
      matchEmail &&
      matchPhone &&
      matchPays &&
      matchStatut &&
      matchOrigine
    );
  });

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%)", padding: "40px 0" }}>
      <Container size="xl">
        <Paper
          shadow="sm"
          p="xl"
          radius="lg"
          mb="xl"
          style={{
            backgroundColor: "#ffffff",
            borderColor: "#e9ecef",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)"
          }}
        >
          <Group position="apart" mb="lg">
            <Group spacing="md">
              <Avatar
                size="md"
                radius="xl"
                color="blue"
                style={{ backgroundColor: "#4299E1" }}
              >
                <IconFilter size={20} />
              </Avatar>
              <div>
                <Title order={3} style={{ color: "#3E5879", fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>
                  Tous les Prospects
                </Title>
                <Text size="sm" color="dimmed" mt={5}>
                  Gérez et suivez vos prospects commerciaux
                </Text>
              </div>
            </Group>
            <Button
              leftIcon={<IconPlus size={18} />}
              radius="xl"
              color="blue"
              onClick={() => setCreateModalOpen(true)} // au lieu de router.push
              style={{ boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)" }}
            >
              Ajouter Prospect
            </Button>
          </Group>
        </Paper>

        <Grid gutter="xl">
          <Grid.Col span={3}>
            <Card
              shadow="sm"
              p="lg"
              radius="md"
              withBorder
              style={{
                backgroundColor: "#ffffff",
                borderColor: "#e9ecef",
                overflow: "hidden",
              }}
            >
              <Card.Section
                p="md"
                style={{
                  backgroundColor: "#EDF2F7",
                  borderBottom: "1px solid #E2E8F0",
                  marginBottom: "15px"
                }}
              >
                <Group spacing="xs">
                  <IconAdjustments size={18} color="#4299E1" />
                  <Text weight={600} size="sm" color="#3E5879">Filtres de recherche</Text>
                </Group>
              </Card.Section>

              <Box p="xs">
                <Tabs
                  defaultValue="champs"
                  radius="md"
                  styles={{
                    tabLabel: {
                      fontWeight: 500,
                    },
                    tab: {
                      '&[data-active]': {
                        color: '#4299E1',
                      },
                    },
                  }}
                >
                  <Tabs.List grow position="center" mb="md">
                    <Tabs.Tab value="champs" icon={<IconSearch size={14} />}>Champs</Tabs.Tab>
                    <Tabs.Tab value="categories" icon={<IconFilter size={14} />}>Catégories</Tabs.Tab>
                  </Tabs.List>

                  <Tabs.Panel value="champs">
                    <Stack spacing="sm">
                      <TextInput
                        placeholder="Prénom"
                        icon={<IconUser size={16} color="#4299E1" />}
                        onChange={(e) => setSearch((prev) => ({ ...prev, firstName: e.currentTarget.value }))}
                        styles={{
                          input: {
                            '&:focus': {
                              borderColor: '#4299E1',
                            },
                            borderRadius: '8px',
                          },
                        }}
                      />
                      <TextInput
                        placeholder="Nom"
                        icon={<IconUser size={16} color="#4299E1" />}
                        onChange={(e) => setSearch((prev) => ({ ...prev, lastName: e.currentTarget.value }))}
                        styles={{
                          input: {
                            '&:focus': {
                              borderColor: '#4299E1',
                            },
                            borderRadius: '8px',
                          },
                        }}
                      />
                      <TextInput
                        placeholder="Email"
                        icon={<IconMail size={16} color="#4299E1" />}
                        onChange={(e) => setSearch((prev) => ({ ...prev, email: e.currentTarget.value }))}
                        styles={{
                          input: {
                            '&:focus': {
                              borderColor: '#4299E1',
                            },
                            borderRadius: '8px',
                          },
                        }}
                      />
                      <TextInput
                        placeholder="Téléphone"
                        icon={<IconPhone size={16} color="#4299E1" />}
                        onChange={(e) => setSearch((prev) => ({ ...prev, phone: e.currentTarget.value }))}
                        styles={{
                          input: {
                            '&:focus': {
                              borderColor: '#4299E1',
                            },
                            borderRadius: '8px',
                          },
                        }}
                      />
                      <TextInput
                        placeholder="Pays"
                        icon={<IconMapPin size={16} color="#4299E1" />}
                        onChange={(e) => setSearch((prev) => ({ ...prev, pays: e.currentTarget.value }))}
                        styles={{
                          input: {
                            '&:focus': {
                              borderColor: '#4299E1',
                            },
                            borderRadius: '8px',
                          },
                        }}
                      />
                    </Stack>
                  </Tabs.Panel>

                  <Tabs.Panel value="categories">
                    <Box mb="md">
                      <Text weight={500} size="sm" color="#4A5568" mb="xs">Origine</Text>
                      <Paper p="xs" radius="md" style={{ backgroundColor: '#F7FAFC', border: '1px solid #E2E8F0' }}>
                        <Stack spacing="xs">
                          {["site_web", "reseau", "salon", "autre"].map((origin) => (
                            <Checkbox
                              key={origin}
                              label={<Text transform="capitalize">{origin.replace('_', ' ')}</Text>}
                              checked={selectedOrigine.includes(origin)}
                              onChange={() => handleOrigineChange(origin)}
                              radius="md"
                              color="blue"
                              styles={{
                                input: { cursor: 'pointer' },
                                label: { cursor: 'pointer' },
                              }}
                            />
                          ))}
                        </Stack>
                      </Paper>
                    </Box>

                    <Box>
                      <Text weight={500} size="sm" color="#4A5568" mb="xs">Statut</Text>
                      <Paper p="xs" radius="md" style={{ backgroundColor: '#F7FAFC', border: '1px solid #E2E8F0' }}>
                        <Stack spacing="xs">
                          {statutOptions.map((statut) => (
                            <Checkbox
                              key={statut}
                              label={
                                <Group spacing="xs">
                                  <Text transform="capitalize">{statut.replace('_', ' ')}</Text>
                                  <Badge
                                    size="xs"
                                    color={
                                      statut === "nouveau" ? "blue" :
                                      statut === "chaud" ? "red" :
                                      statut === "perdu" ? "gray" :
                                      statut === "converti" ? "green" :
                                      "orange"
                                    }
                                    variant="filled"
                                    radius="sm"
                                  >
                                    {filteredProspects.filter(p => p.statut === statut).length}
                                  </Badge>
                                </Group>
                              }
                              checked={selectedStatut.includes(statut)}
                              onChange={() => handleStatutChange(statut)}
                              radius="md"
                              color="blue"
                              styles={{
                                input: { cursor: 'pointer' },
                                label: { cursor: 'pointer' },
                              }}
                            />
                          ))}
                        </Stack>
                      </Paper>
                    </Box>
                  </Tabs.Panel>
                </Tabs>

                <Button
                  fullWidth
                  variant="light"
                  color="blue"
                  mt="xl"
                  radius="md"
                  leftIcon={<IconRefresh size={16} />}
                  onClick={() => {
                    setSearch({ firstName: "", lastName: "", email: "", phone: "", pays: "" });
                    setSelectedStatut([]);
                    setSelectedOrigine([]);
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </Box>
            </Card>
          </Grid.Col>

          <Grid.Col span={9}>
            <Card
              shadow="sm"
              p="lg"
              radius="md"
              withBorder
              style={{
                backgroundColor: "#ffffff",
                borderColor: "#e9ecef",
                overflow: "hidden",
              }}
            >
              <Card.Section
                p="md"
                style={{
                  backgroundColor: "#EDF2F7",
                  borderBottom: "1px solid #E2E8F0",
                  marginBottom: "15px"
                }}
              >
                <Group position="apart">
                  <Group spacing="xs">
                    <IconUserPlus size={18} color="#4299E1" />
                    <Text weight={600} size="sm" color="#3E5879">
                      {filteredProspects.length} prospect{filteredProspects.length !== 1 ? 's' : ''} trouvé{filteredProspects.length !== 1 ? 's' : ''}
                    </Text>
                  </Group>
                  <Button
                    variant="subtle"
                    color="blue"
                    compact
                    leftIcon={<IconRefresh size={14} />}
                    onClick={fetchProspects}
                  >
                    Actualiser
                  </Button>
                </Group>
              </Card.Section>

              <ScrollArea style={{ height: 'calc(100vh - 350px)' }}>
                {loading ? (
                  <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                    <Loader color="blue" size="md" variant="dots" />
                    <Text ml="md" color="dimmed">Chargement des prospects...</Text>
                  </Box>
                ) : (
                  <>
                    {filteredProspects.length === 0 ? (
                      <Box p="xl" style={{ textAlign: 'center' }}>
                        <Text color="dimmed" size="lg" mb="md">Aucun prospect trouvé</Text>
                        <Button
                          variant="light"
                          color="blue"
                          leftIcon={<IconPlus size={16} />}
                          onClick={() => router.push("/crm/prospect")}
                        >
                          Ajouter un prospect
                        </Button>
                      </Box>
                    ) : (
                      <Table
                        striped
                        highlightOnHover
                        withBorder
                        withColumnBorders
                        verticalSpacing="md"
                        horizontalSpacing="md"
                        style={{
                          borderCollapse: 'separate',
                          borderSpacing: 0,
                          borderRadius: '8px',
                          overflow: 'hidden'
                        }}
                      >
                        <thead style={{ backgroundColor: '#f8fafc' }}>
                          <tr>
                            <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4A5568' }}>Prénom</th>
                            <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4A5568' }}>Nom</th>
                            <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4A5568' }}>Email</th>
                            <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4A5568' }}>Téléphone</th>
                            <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4A5568' }}>Pays</th>
                            <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4A5568' }}>Statut</th>
                            <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4A5568' }}>Dernière Action</th>
                            <th style={{ padding: '12px 16px', fontWeight: 600, color: '#4A5568', textAlign: 'center' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProspects.map((p) => (
                            <tr
                              key={p.id}
                              style={{
                                cursor: "pointer",
                                transition: 'background-color 0.2s',
                                backgroundColor: p.statut === "converti" ? "rgba(72, 187, 120, 0.1)" : "inherit",
                              }}
                              onClick={() => router.push(`/crm/prospects/${p.id}`)}
                            >
                              <td style={{
                                padding: '12px 16px',
                                fontWeight: p.statut === "converti" ? 600 : 'normal',
                                color: p.statut === "converti" ? "#2F855A" : "inherit"
                              }}>{p.firstName}</td>
                              <td style={{
                                padding: '12px 16px',
                                fontWeight: p.statut === "converti" ? 600 : 'normal',
                                color: p.statut === "converti" ? "#2F855A" : "inherit"
                              }}>{p.lastName}</td>
                              <td style={{
                                padding: '12px 16px',
                                color: p.statut === "converti" ? "#2F855A" : "inherit"
                              }}>
                                <Group spacing="xs">
                                  <IconMail size={14} color={p.statut === "converti" ? "#2F855A" : "#718096"} />
                                  <Text
                                    size="sm"
                                    weight={p.statut === "converti" ? 500 : 'normal'}
                                    color={p.statut === "converti" ? "#2F855A" : "inherit"}
                                  >
                                    {p.email}
                                  </Text>
                                </Group>
                              </td>
                              <td style={{
                                padding: '12px 16px',
                                color: p.statut === "converti" ? "#2F855A" : "inherit"
                              }}>
                                <Group spacing="xs">
                                  <IconPhone size={14} color={p.statut === "converti" ? "#2F855A" : "#718096"} />
                                  <Text
                                    size="sm"
                                    weight={p.statut === "converti" ? 500 : 'normal'}
                                    color={p.statut === "converti" ? "#2F855A" : "inherit"}
                                  >
                                    {p.phone}
                                  </Text>
                                </Group>
                              </td>
                              <td style={{
                                padding: '12px 16px',
                                color: p.statut === "converti" ? "#2F855A" : "inherit"
                              }}>
                                <Group spacing="xs">
                                  <IconMapPin size={14} color={p.statut === "converti" ? "#2F855A" : "#718096"} />
                                  <Text
                                    size="sm"
                                    weight={p.statut === "converti" ? 500 : 'normal'}
                                    color={p.statut === "converti" ? "#2F855A" : "inherit"}
                                  >
                                    {p.pays}
                                  </Text>
                                </Group>
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <Badge
                                  color={
                                    p.statut === "nouveau" ? "blue" :
                                    p.statut === "chaud" ? "red" :
                                    p.statut === "perdu" ? "gray" :
                                    p.statut === "converti" ? "green" :
                                    "orange"
                                  }
                                  variant="filled"
                                  radius="sm"
                                  style={{ textTransform: 'capitalize' }}
                                >
                                  {p.statut.replace('_', ' ')}
                                </Badge>
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                {(() => {
                                  // Convertir l'ID en chaîne pour correspondre à la clé dans lastActions
                                  const prospectId = String(p.id);
                                  console.log(`Affichage pour prospect ${prospectId}, action:`, lastActions[prospectId]);

                                  // Vérifier si les actions sont en cours de chargement
                                  if (loadingActions) {
                                    return (
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Loader size="sm" />
                                        <Text size="xs" color="dimmed" ml={5}>Chargement...</Text>
                                      </div>
                                    );
                                  }

                                  // Vérifier si l'action existe et a les propriétés nécessaires
                                  const action = lastActions[prospectId];
                                  if (!action) {
                                    return (
                                      <Text size="sm" color="dimmed" italic>
                                        Aucune action
                                      </Text>
                                    );
                                  }

                                  if (action && (action.titre || action.description || action.statut || action.objet)) {
                                    // Afficher l'action exactement comme elle est dans la page détaillée
                                    console.log("Action à afficher:", action);

                                    // Déterminer le statut à afficher
                                    let statusText = "Non commencé";
                                    let statusColor = "gray";

                                    if (action.statut) {
                                      const status = action.statut.toLowerCase();
                                      if (status.includes("termine") || status === "termine") {
                                        statusText = "Terminé";
                                        statusColor = "green";
                                      } else if (status.includes("cours") || status === "en_cours") {
                                        statusText = "En cours";
                                        statusColor = "blue";
                                      } else {
                                        statusText = "Non commencé";
                                        statusColor = "gray";
                                      }
                                    }

                                    // Formater la date
                                    let dateText = "";
                                    try {
                                      const actionDate = new Date(action.dateEcheance || action.dateAction || action.createdAt || Date.now());
                                      dateText = actionDate.toLocaleDateString('fr-FR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                      });
                                    } catch (e) {
                                      console.error("Erreur de formatage de date:", e);
                                      dateText = "Date inconnue";
                                    }

                                    return (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <Text size="sm" weight={500} color="#4A5568">
                                          {action.objet || "Proposition commerciale"}
                                        </Text>
                                        <Text size="xs" color="#718096">
                                          {action.description || "Envoi automatique d'un devis ou contrat."}
                                        </Text>
                                        <Group position="apart" mt={5}>
                                          <Text size="xs" color="#A0AEC0">
                                            {dateText}
                                          </Text>
                                          <Badge color={statusColor} size="sm">
                                            {statusText}
                                          </Badge>
                                        </Group>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <Text size="sm" color="dimmed" italic>
                                        Aucune action
                                      </Text>
                                    );
                                  }
                                })()}
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                <Group position="center" spacing="xs">
                                  <Tooltip label="Modifier" withArrow position="top">
                                    <ActionIcon
                                      color="blue"
                                      variant="light"
                                      onClick={(e) => { e.stopPropagation(); handleEdit(p); }}
                                      radius="xl"
                                    >
                                      <IconEdit size={16} />
                                    </ActionIcon>
                                  </Tooltip>
                                  <Tooltip label="Supprimer" withArrow position="top">
                                    <ActionIcon
                                      color="red"
                                      variant="light"
                                      onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                                      radius="xl"
                                    >
                                      <IconTrash size={16} />
                                    </ActionIcon>
                                  </Tooltip>
                                  <Menu shadow="md" width={200} position="bottom-end">
                                    <Menu.Target>
                                      <ActionIcon variant="subtle" radius="xl">
                                        <IconDotsVertical size={16} />
                                      </ActionIcon>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                      <Menu.Item icon={<IconChevronRight size={14} />} onClick={(e) => { e.stopPropagation(); router.push(`/crm/prospects/${p.id}`); }}>
                                        Voir les détails
                                      </Menu.Item>
                                      <Menu.Divider />
                                      <Menu.Item
                                        color="gray"
                                        icon={<IconTrash size={14} />}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (confirm("Voulez-vous marquer ce prospect comme 'perdu' ?")) {
                                            // Mettre à jour le statut du prospect à "perdu"
                                            axios.put(
                                              `http://localhost:8081/api/prospects/${p.id}`,
                                              { ...p, statut: "perdu" },
                                              { headers: authHeader() }
                                            )
                                            .then(() => {
                                              fetchProspects();
                                              notifications.show({
                                                title: "Succès",
                                                message: "Le prospect a été marqué comme 'perdu'",
                                                color: "blue",
                                              });
                                            })
                                            .catch((error) => {
                                              console.error("Erreur lors de la mise à jour du statut :", error);
                                              notifications.show({
                                                title: "Erreur",
                                                message: "Impossible de mettre à jour le statut du prospect.",
                                                color: "red",
                                              });
                                            });
                                          }
                                        }}
                                      >
                                        Marquer comme perdu
                                      </Menu.Item>
                                    </Menu.Dropdown>
                                  </Menu>
                                </Group>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </>
                )}
              </ScrollArea>
            </Card>
          </Grid.Col>
        </Grid>
      </Container>



      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={<Text weight={700} size="lg" color="#3E5879">Modifier le prospect</Text>}
        centered
        radius="md"
        size="lg"
        padding="xl"
        shadow="xl"
      >
        {editingProspect && (
          <>
            <Group mb="md" position="center">
              <Avatar
                size={60}
                radius={60}
                color="blue"
                style={{ backgroundColor: "#4299E1" }}
              >
                {editingProspect.firstName?.[0]}{editingProspect.lastName?.[0]}
              </Avatar>
            </Group>

            <Divider label="Informations personnelles" labelPosition="center" mb="md" />

            <Grid gutter="md">
              <Grid.Col span={6}>
                <TextInput
                  label="Prénom"
                  value={editingProspect.firstName}
                  onChange={(e) => setEditingProspect({ ...editingProspect, firstName: e.currentTarget.value })}
                  icon={<IconUser size={16} color="#4299E1" />}
                  styles={{
                    input: {
                      '&:focus': {
                        borderColor: '#4299E1',
                      },
                      borderRadius: '8px',
                    },
                    label: {
                      fontWeight: 600,
                      marginBottom: '4px',
                      fontSize: '14px',
                    },
                  }}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Nom"
                  value={editingProspect.lastName}
                  onChange={(e) => setEditingProspect({ ...editingProspect, lastName: e.currentTarget.value })}
                  icon={<IconUser size={16} color="#4299E1" />}
                  styles={{
                    input: {
                      '&:focus': {
                        borderColor: '#4299E1',
                      },
                      borderRadius: '8px',
                    },
                    label: {
                      fontWeight: 600,
                      marginBottom: '4px',
                      fontSize: '14px',
                    },
                  }}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Email"
                  value={editingProspect.email}
                  onChange={(e) => setEditingProspect({ ...editingProspect, email: e.currentTarget.value })}
                  icon={<IconMail size={16} color="#4299E1" />}
                  styles={{
                    input: {
                      '&:focus': {
                        borderColor: '#4299E1',
                      },
                      borderRadius: '8px',
                    },
                    label: {
                      fontWeight: 600,
                      marginBottom: '4px',
                      fontSize: '14px',
                    },
                  }}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Téléphone"
                  value={editingProspect.phone}
                  onChange={(e) => setEditingProspect({ ...editingProspect, phone: e.currentTarget.value })}
                  icon={<IconPhone size={16} color="#4299E1" />}
                  styles={{
                    input: {
                      '&:focus': {
                        borderColor: '#4299E1',
                      },
                      borderRadius: '8px',
                    },
                    label: {
                      fontWeight: 600,
                      marginBottom: '4px',
                      fontSize: '14px',
                    },
                  }}
                />
              </Grid.Col>
            </Grid>

            <Divider label="Informations professionnelles" labelPosition="center" my="md" />

            <Grid gutter="md">
              <Grid.Col span={6}>
                <TextInput
                  label="Société"
                  value={editingProspect.societe}
                  onChange={(e) => setEditingProspect({ ...editingProspect, societe: e.currentTarget.value })}
                  icon={<IconBuildingStore size={16} color="#4299E1" />}
                  styles={{
                    input: {
                      '&:focus': {
                        borderColor: '#4299E1',
                      },
                      borderRadius: '8px',
                    },
                    label: {
                      fontWeight: 600,
                      marginBottom: '4px',
                      fontSize: '14px',
                    },
                  }}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Statut"
                  data={statutOptions.map(s => ({ value: s, label: s.replace('_', ' ') }))}
                  value={editingProspect.statut}
                  onChange={(value) => setEditingProspect({ ...editingProspect, statut: value })}
                  styles={{
                    input: {
                      '&:focus': {
                        borderColor: '#4299E1',
                      },
                      borderRadius: '8px',
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
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Origine"
                  data={["site_web", "reseau", "salon", "autre"].map(o => ({ value: o, label: o.replace('_', ' ') }))}
                  value={editingProspect.origine}
                  onChange={(value) => setEditingProspect({ ...editingProspect, origine: value })}
                  styles={{
                    input: {
                      '&:focus': {
                        borderColor: '#4299E1',
                      },
                      borderRadius: '8px',
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
              </Grid.Col>
            </Grid>

            <Divider label="Adresse" labelPosition="center" my="md" />

            <Grid gutter="md">
              <Grid.Col span={6}>
                <TextInput
                  label="Ville"
                  value={editingProspect.ville}
                  onChange={(e) => setEditingProspect({ ...editingProspect, ville: e.currentTarget.value })}
                  icon={<IconMapPin size={16} color="#4299E1" />}
                  styles={{
                    input: {
                      '&:focus': {
                        borderColor: '#4299E1',
                      },
                      borderRadius: '8px',
                    },
                    label: {
                      fontWeight: 600,
                      marginBottom: '4px',
                      fontSize: '14px',
                    },
                  }}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Pays"
                  value={editingProspect.pays}
                  onChange={(e) => setEditingProspect({ ...editingProspect, pays: e.currentTarget.value })}
                  icon={<IconMapPin size={16} color="#4299E1" />}
                  styles={{
                    input: {
                      '&:focus': {
                        borderColor: '#4299E1',
                      },
                      borderRadius: '8px',
                    },
                    label: {
                      fontWeight: 600,
                      marginBottom: '4px',
                      fontSize: '14px',
                    },
                  }}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Code Postal"
                  value={editingProspect.codePostal}
                  onChange={(e) => setEditingProspect({ ...editingProspect, codePostal: e.currentTarget.value })}
                  icon={<IconMapPin size={16} color="#4299E1" />}
                  styles={{
                    input: {
                      '&:focus': {
                        borderColor: '#4299E1',
                      },
                      borderRadius: '8px',
                    },
                    label: {
                      fontWeight: 600,
                      marginBottom: '4px',
                      fontSize: '14px',
                    },
                  }}
                />
              </Grid.Col>
            </Grid>

            <Divider label="Notes" labelPosition="center" my="md" />

            <TextInput
              label="Description"
              value={editingProspect.description}
              onChange={(e) => setEditingProspect({ ...editingProspect, description: e.currentTarget.value })}
              styles={{
                input: {
                  '&:focus': {
                    borderColor: '#4299E1',
                  },
                  borderRadius: '8px',
                },
                label: {
                  fontWeight: 600,
                  marginBottom: '4px',
                  fontSize: '14px',
                },
              }}
            />

            <Group position="right" mt="xl">
              <Button variant="light" color="gray" onClick={() => setEditModalOpen(false)} radius="md">Annuler</Button>
              <Button
                color="blue"
                onClick={handleUpdate}
                radius="md"
                leftIcon={<IconEdit size={16} />}
              >
                Enregistrer les modifications
              </Button>
            </Group>
          </>
        )}
      </Modal>

      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={<Text weight={700} size="lg" color="#3E5879">Ajouter un prospect</Text>}
        centered
        radius="md"
        size="lg"
        padding="xl"
        shadow="xl"
      >
        <Grid gutter="md">
          <Grid.Col span={6}>
            <TextInput label="Prénom" value={newProspect.firstName} onChange={(e) => setNewProspect({ ...newProspect, firstName: e.currentTarget.value })} icon={<IconUser size={16} color="#4299E1" />} />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput label="Nom" value={newProspect.lastName} onChange={(e) => setNewProspect({ ...newProspect, lastName: e.currentTarget.value })} icon={<IconUser size={16} color="#4299E1" />} />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput label="Email" value={newProspect.email} onChange={(e) => setNewProspect({ ...newProspect, email: e.currentTarget.value })} icon={<IconMail size={16} color="#4299E1" />} />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput label="Téléphone" value={newProspect.phone} onChange={(e) => setNewProspect({ ...newProspect, phone: e.currentTarget.value })} icon={<IconPhone size={16} color="#4299E1" />} />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput label="Société" value={newProspect.societe} onChange={(e) => setNewProspect({ ...newProspect, societe: e.currentTarget.value })} icon={<IconBuildingStore size={16} color="#4299E1" />} />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput label="Secteur" value={newProspect.secteur} onChange={(e) => setNewProspect({ ...newProspect, secteur: e.currentTarget.value })} icon={<IconBuildingStore size={16} color="#4299E1" />} />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select label="Statut" data={statutOptions.map(s => ({ value: s, label: s.replace('_', ' ') }))} value={newProspect.statut} onChange={(value) => setNewProspect({ ...newProspect, statut: value || "" })} />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select label="Origine" data={["site_web", "reseau", "salon", "autre"].map(o => ({ value: o, label: o.replace('_', ' ') }))} value={newProspect.origine} onChange={(value) => setNewProspect({ ...newProspect, origine: value || "" })} />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput label="Ville" value={newProspect.ville} onChange={(e) => setNewProspect({ ...newProspect, ville: e.currentTarget.value })} icon={<IconMapPin size={16} color="#4299E1" />} />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput label="Pays" value={newProspect.pays} onChange={(e) => setNewProspect({ ...newProspect, pays: e.currentTarget.value })} icon={<IconMapPin size={16} color="#4299E1" />} />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput label="Code Postal" value={newProspect.codePostal} onChange={(e) => setNewProspect({ ...newProspect, codePostal: e.currentTarget.value })} icon={<IconMapPin size={16} color="#4299E1" />} />
          </Grid.Col>
          <Grid.Col span={12}>
            <TextInput label="Description" value={newProspect.description} onChange={(e) => setNewProspect({ ...newProspect, description: e.currentTarget.value })} />
          </Grid.Col>
          <Grid.Col span={12}>
            <TextInput label="Email du gestionnaire (Keycloak)" value={newProspect.gestionnaire} onChange={(e) => setNewProspect({ ...newProspect, gestionnaire: e.currentTarget.value })} />
          </Grid.Col>
        </Grid>

        <Group position="right" mt="xl">
          <Button variant="light" color="gray" onClick={() => setCreateModalOpen(false)} radius="md">Annuler</Button>
          <Button color="blue" onClick={handleCreate} radius="md" leftIcon={<IconPlus size={16} />}>Créer</Button>
        </Group>
      </Modal>
    </div>
  );
}