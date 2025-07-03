import {
  TextInput,
  Textarea,
  Select,
  Switch,
  Button,
  Group,
  Container,
  Title,
  Stack,
  Paper,
  Text,
  Card,
  Divider,
  ScrollArea,
} from "@mantine/core";
import { IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import { DateInput, TimeInput } from "@mantine/dates";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import axios from "axios";
import { useAuth } from "src/context/AuthContext";

const initialManualActions = [
  {
    label: "Appel de qualification",
    value: "manual_call",
    description:
      "● Appeler le prospect pour confirmer son intérêt et poser des questions clés.",
  },
  {
    label: "Présentation du service",
    value: "service_presentation",
    description:
      "● Démo personnalisée.\n● Mise en avant des bénéfices par rapport aux besoins identifiés.",
  },
  {
    label: "Gestion des objections",
    value: "objection_handling",
    description:
      "● Répondre aux préoccupations (prix, concurrence, timing…).\n● Offrir un essai gratuit ou une garantie.",
  },
];

const programmableActions = [
  {
    label: "Email de qualification",
    value: "email_qualification",
    description:
      "● Envoyer un email pour identifier les besoins, échéances, budget du prospect.",
  },
  {
    label: "Proposition commerciale",
    value: "commercial_offer",
    description:
      "● Envoi automatique d’un devis, d’une offre personnalisée ou d’un contrat.",
  },
  {
    label: "Suivi post-vente et fidélisation",
    value: "post_sale_followup",
    description:
      "● Onboarding client et envoi de ressources utiles après la vente.",
  },
  {
    label: "Closing (Signature du contrat)",
    value: "closing",
    description:
      "● Envoi automatique du contrat pour signature + activation du service.",
  },
];

const patternSteps = [
  "Appel de qualification",
  "Email de qualification",
  "Présentation du service",
  "Proposition commerciale",
  "Gestion des objections",
  "Closing",
  "Suivi post-vente",
];

const contactTypes = [
  { value: "contact", label: "Contact" },
  { value: "prospect", label: "Client potentiel" },
];

const actionStatusOptions = [
  { value: "non_commence", label: "Non commencé" },
  { value: "en_cours", label: "En cours" },
  { value: "termine", label: "Terminé" },
];

export default function AddActionForm() {
  const { authHeader } = useAuth();
  const router = useRouter();

  const [manager, setManager] = useState("");
  const [action, setAction] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [contactType, setContactType] = useState<string | null>("contact");
  const [status, setStatus] = useState<string | null>("non_commence");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDate, setReminderDate] = useState<Date | null>(null);
  const [reminderTime, setReminderTime] = useState<string>("");
  const [description, setDescription] = useState("");
  const [prospectId, setProspectId] = useState<string | null>(null);
  const [prospectOptions, setProspectOptions] = useState<{ value: string; label: string }[]>([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [manualActions, setManualActions] = useState(initialManualActions);
  const [showAddManualForm, setShowAddManualForm] = useState(false);
  const [newManualLabel, setNewManualLabel] = useState("");
  const [newManualDescription, setNewManualDescription] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8081/api/prospects", { headers: authHeader() })
      .then((res) => {
        const options = res.data.map((prospect: any) => ({
          value: prospect.id.toString(),
          label: `${prospect.firstName || ""} ${prospect.lastName || ""}`,
        }));
        setProspectOptions(options);
      })
      .catch((err) => {
        console.error("Erreur chargement prospects :", err);
      });
  }, []);

  const handleSubmit = async () => {
    const dateRappel =
      reminderEnabled && reminderDate && reminderTime
        ? dayjs(reminderDate)
            .hour(Number(reminderTime.split(":"))[0])
            .minute(Number(reminderTime.split(":"))[1])
            .toISOString()
        : null;

    const payload = {
      managerEmail: manager,
      objet: action,
      statut: status,
      dateEcheance: dueDate ? dayjs(dueDate).toISOString() : null,
      dateRappel: dateRappel,
      contact: contactType,
      description,
      prospect: {
        id: Number(prospectId),
      },
    };

    try {
      await axios.post("http://localhost:8081/api/actions", payload, {
        headers: authHeader(),
      });
      alert("✅ Action ajoutée avec succès !");
      router.push('http://localhost:3000');
    } catch (err) {
      console.error("❌ Erreur lors de la création :", err);
      alert("Erreur lors de la création de l'action.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #EDF2F7, #E2E8F0)", padding: "40px 0" }}>
      <Container size="xl" px="lg" style={{ maxWidth: "1200px" }}>
        <Paper shadow="sm" p="xl" radius="lg" style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}>
          <Title order={2} mb="xl" align="center" style={{ fontFamily: 'Poppins, sans-serif', color: '#3E5879' }}>
            Créer une nouvelle action
          </Title>

          {/* 🤖 Actions programmables */}
          <Group mb="xs" align="center">
            <Title order={4} style={{ color: '#4C6EF5', fontFamily: 'Poppins, sans-serif' }}>🤖 Actions programmables</Title>
            <Text size="sm" color="dimmed" style={{ marginLeft: 10 }}>Actions automatisées pour gagner du temps</Text>
          </Group>
          <Group spacing="md" mb="xl" grow>
            {programmableActions.map((item) => (
              <Paper
                key={item.value}
                shadow="sm"
                p="md"
                radius="md"
                withBorder
                style={{
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  backgroundColor: "#f9fbfd",
                  minHeight: 160,
                  flex: 1,
                  borderColor: '#E2E8F0',
                  borderLeft: '3px solid #4C6EF5',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#eef3f8";
                  e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f9fbfd";
                  e.currentTarget.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Title order={5} color="indigo" mb={5}>{item.label}</Title>
                <Divider my="xs" />
                <Text size="sm" color="dimmed" style={{ whiteSpace: "pre-line" }}>{item.description}</Text>
              </Paper>
            ))}
          </Group>

          {/* 📌 Actions manuelles */}
          <Group mb="xs" align="center">
            <Title order={4} style={{ color: '#4C6EF5', fontFamily: 'Poppins, sans-serif' }}>📌 Actions manuelles</Title>
            <Text size="sm" color="dimmed" style={{ marginLeft: 10 }}>Actions personnalisées selon vos besoins</Text>
          </Group>
          <Stack spacing="md" mb="xl">
            {manualActions.map((item, index) => (
              <Paper
                key={item.value}
                shadow="sm"
                p="md"
                radius="md"
                withBorder
                style={{
                  backgroundColor: "#fdfcfa",
                  transition: "all 0.2s ease",
                  borderColor: '#E2E8F0',
                  borderLeft: '3px solid #4C6EF5',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
                }}
                sx={{
                  '&:hover': {
                    backgroundColor: '#f7f9fc',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <Group position="apart" align="start">
                  <div style={{ flex: 1 }}>
                    <Title order={5} color="indigo" mb={5}>{item.label}</Title>
                    <Divider my="xs" />
                    <Text size="sm" color="dimmed" style={{ whiteSpace: "pre-line" }}>{item.description}</Text>
                  </div>

                  <Group spacing="xs">
                    <Button
                      size="xs"
                      variant="light"
                      radius="xl"
                      style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' }}
                      onClick={() => {
                        const newLabel = prompt("Modifier le titre :", item.label);
                        const newDesc = prompt("Modifier la description :", item.description);
                        if (newLabel && newDesc) {
                          const updated = [...manualActions];
                          updated[index] = { ...item, label: newLabel, description: newDesc };
                          setManualActions(updated);
                        }
                      }}
                    >
                      <IconEdit size={16} />
                    </Button>
                    <Button
                      size="xs"
                      variant="light"
                      color="red"
                      radius="xl"
                      style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' }}
                      onClick={() => {
                        if (confirm("Voulez-vous supprimer cette action ?")) {
                          const updated = manualActions.filter((_, i) => i !== index);
                          setManualActions(updated);
                        }
                      }}
                    >
                      <IconTrash size={16} />
                    </Button>
                  </Group>
                </Group>
              </Paper>
            ))}

            {/* ➕ Ajouter une nouvelle action manuelle */}
            <Stack align="flex-end">
              {!showAddManualForm ? (
                <Button onClick={() => setShowAddManualForm(true)} color="indigo" variant="light" radius="md" leftIcon={<IconPlus size={16} />} style={{ boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)' }}>
                  + Ajouter une action manuelle
                </Button>
              ) : (
                <Paper p="md" radius="md" withBorder style={{ width: "100%", maxWidth: 500 }}>
                  <Stack spacing="xs">
                    <TextInput
                      label="Titre de l'action"
                      placeholder="Ex : Relance téléphonique"
                      value={newManualLabel}
                      onChange={(e) => setNewManualLabel(e.currentTarget.value)}
                      required
                    />
                    <Textarea
                      label="Description"
                      placeholder="Détail de l'action à effectuer"
                      minRows={3}
                      value={newManualDescription}
                      onChange={(e) => setNewManualDescription(e.currentTarget.value)}
                      required
                    />
                    <Group position="apart" mt="xs">
                      <Button variant="default" onClick={() => setShowAddManualForm(false)}>
                        Annuler
                      </Button>
                      <Button
                        color="indigo"
                        onClick={() => {
                          if (!newManualLabel || !newManualDescription) return;
                          const newAction = {
                            label: newManualLabel,
                            value: `manual_${Date.now()}`,
                            description: newManualDescription,
                          };
                          setManualActions([...manualActions, newAction]);
                          setNewManualLabel("");
                          setNewManualDescription("");
                          setShowAddManualForm(false);
                        }}
                      >
                        Ajouter
                      </Button>
                    </Group>
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Stack>

          {showCustomForm && (
            <Stack spacing="sm" mt="sm">
              <TextInput label="Email du gestionnaire" value={manager} onChange={(e) => setManager(e.currentTarget.value)} required />
              <TextInput label="Objet de la tâche" value={action || ""} onChange={(e) => setAction(e.currentTarget.value)} required />
              <Select label="Statut" data={actionStatusOptions} value={status} onChange={setStatus} required />
              <DateInput label="Date d'échéance" value={dueDate} onChange={setDueDate} required />
              <Select label="Type de contact" data={contactTypes} value={contactType} onChange={setContactType} required />
              <Select label="Associer à un prospect" data={prospectOptions} value={prospectId} onChange={setProspectId} searchable required />
              <Switch label="Activer un rappel" checked={reminderEnabled} onChange={(event) => setReminderEnabled(event.currentTarget.checked)} />
              {reminderEnabled && (
                <Group grow>
                  <DateInput label="Date de rappel" value={reminderDate} onChange={setReminderDate} required />
                  <TimeInput label="Heure de rappel" value={reminderTime} onChange={(e) => setReminderTime(e.currentTarget.value)} required placeholder="HH:mm" />
                </Group>
              )}
              <Textarea label="Description" minRows={3} value={description} onChange={(e) => setDescription(e.currentTarget.value)} />
              <Group position="right" mt="xl">
                <Button onClick={handleSubmit} color="indigo" radius="xl">Enregistrer</Button>
              </Group>
            </Stack>
          )}
        </Paper>

        {/* 🧩 Étapes visuelles */}
        <Paper withBorder p="md" mt="xl" style={{ backgroundColor: "#f0f4f8" }}>
          <Title order={4} mb="md" style={{ color: '#4C6EF5', fontFamily: 'Poppins, sans-serif' }}>🧩 Pattern : Cycle complet de vente</Title>
          <ScrollArea type="scroll" offsetScrollbars>
            <Group spacing="md" noWrap>
              {patternSteps.map((step, index) => (
                <Card key={index} withBorder shadow="sm" radius="md" p="sm" style={{
                  minWidth: 180,
                  textAlign: "center",
                  backgroundColor: index % 2 === 0 ? '#F0F4FF' : '#F5F7FF',
                  borderLeft: '3px solid #4C6EF5',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
                }}>
                  <Text weight={600}>{`Étape ${index + 1}`}</Text>
                  <Divider my="xs" />
                  <Text size="sm">{step}</Text>
                </Card>
              ))}
            </Group>
          </ScrollArea>
        </Paper>
      </Container>


    </div>
  );
}
