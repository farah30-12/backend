import { useState } from "react";
import {
  AppShell,
  Navbar,
  Header,
  Button,
  Text,
  Group,
  Stack,
  Tabs,
  Title,
  Modal,
  TextInput,
  Textarea,
  Paper,
  ScrollArea,
  Divider,
} from "@mantine/core";
import { IconUser, IconBriefcase, IconCalendar, IconFile } from "@tabler/icons-react";

// ✅ Liste des actions prédéfinies
const predefinedActions = [
  {
    label: "Appel ou email de qualification",
    description: "Confirmer son intérêt et identifier ses besoins. Poser des questions clés : budget, décisions, échéances, problèmes à résoudre.",
    value: "qualification_call",
  },
  {
    label: "Présentation du service",
    description: "Démo personnalisée. Mise en avant des bénéfices par rapport aux besoins identifiés.",
    value: "service_presentation",
  },
  {
    label: "Proposition commerciale",
    description: "Envoi d’une offre personnalisée ou d’un contrat. Suivi par email ou appel pour finaliser la vente.",
    value: "commercial_offer",
  },
  {
    label: "Suivi post-vente et fidélisation",
    description: "Onboarding client et envoi de ressources utiles.",
    value: "post_sale_followup",
  },
  {
    label: "Gestion des objections",
    description: "Répondre aux préoccupations du prospect. Offrir un essai gratuit ou une garantie pour lever les doutes.",
    value: "objection_handling",
  },
  {
    label: "Closing (Signature du contrat)",
    description: "Validation et négociation finale. Envoi des documents contractuels et activation du service.",
    value: "closing",
  },
];

export default function CRMInterface() {
  const [activeTab, setActiveTab] = useState("actions");
  const [actionForm, setActionForm] = useState({
    action_type: "",
    feedback: "",
    action_status: "",
    fromTemplate: null,
  });

  const [actions, setActions] = useState([]);  // Liste des actions ajoutées par l'utilisateur

  // Gère les changements dans les champs du formulaire d'action
  const handleInputChange = (field, value) => {
    setActionForm({ ...actionForm, [field]: value });
  };

  // Ajoute une action avec son feedback à la liste des actions
  const handleAddAction = () => {
    setActions([...actions, actionForm]);
    setActionForm({
      action_type: "",
      feedback: "",
      action_status: "",
      fromTemplate: null,
    });
  };

  return (
    <AppShell
      padding="md"
      navbar={<Navbar width={{ base: 300 }} p="xs"><Title order={4} color="blue">CRM Navigation</Title></Navbar>}
      header={
        <Header height={60} p="xs" style={{ backgroundColor: "#e0f2ff" }}>
          <Group position="apart">
            <Title order={3} color="blue">🌟 CRM Dashboard</Title>
          </Group>
        </Header>
      }
    >
      <Tabs value={activeTab} onTabChange={setActiveTab} color="blue">
        <Tabs.List>
          <Tabs.Tab value="prospects" icon={<IconUser size={16} />}>Prospects</Tabs.Tab>
          <Tabs.Tab value="clients" icon={<IconBriefcase size={16} />}>Clients</Tabs.Tab>
          <Tabs.Tab value="actions" icon={<IconCalendar size={16} />}>Actions</Tabs.Tab>
          <Tabs.Tab value="documents" icon={<IconFile size={16} />}>Documents</Tabs.Tab>
        </Tabs.List>

        {/* Panel pour les actions */}
        <Tabs.Panel value="actions" pt="xs">
          <Stack spacing="xl">
            <Title order={4} color="blue">📋 Actions Prédéfinies</Title>

            {/* Liste des actions prédéfinies */}
            {predefinedActions.map((action, index) => (
              <Button
                key={index}
                color="blue"
                fullWidth
                variant="outline"
                onClick={() => {
                  setActionForm({
                    ...actionForm,
                    action_type: action.label,
                    feedback: action.description,
                    fromTemplate: action.value, // Marque cette action comme prédéfinie
                  });
                }}
              >
                {action.label}
              </Button>
            ))}

            <Divider my="md" label="Ajouter un Feedback" />

            {/* Formulaire pour ajouter un feedback */}
            <TextInput
              label="Type d'action"
              value={actionForm.action_type}
              onChange={(e) => handleInputChange("action_type", e.target.value)}
              disabled
            />
            <Textarea
              label="Feedback de l'action"
              value={actionForm.feedback}
              onChange={(e) => handleInputChange("feedback", e.target.value)}
            />
            <TextInput
              label="État de l'action"
              value={actionForm.action_status}
              onChange={(e) => handleInputChange("action_status", e.target.value)}
            />
            <Button color="orange" onClick={handleAddAction}>Ajouter Action</Button>

            <Divider label="Liste des Actions" my="md" />

            {/* Affichage des actions ajoutées */}
            {actions.length === 0 ? (
              <Text color="dimmed">Aucune action ajoutée.</Text>
            ) : (
              actions.map((action, index) => (
                <Paper key={index} p="md" radius="md" withBorder shadow="xs" style={{ backgroundColor: "#fff8e1" }}>
                  <Text weight={600} color="orange.7">Type : {action.action_type}</Text>
                  <Text>Feedback : {action.feedback}</Text>
                  <Text>État : {action.action_status}</Text>
                </Paper>
              ))
            )}
          </Stack>
        </Tabs.Panel>

        {/* Panel pour les autres tabs */}
        <Tabs.Panel value="prospects" pt="xs">
          <Text>Prospects Panel</Text>
        </Tabs.Panel>
        <Tabs.Panel value="clients" pt="xs">
          <Text>Clients Panel</Text>
        </Tabs.Panel>
        <Tabs.Panel value="documents" pt="xs">
          <Text>Documents Panel</Text>
        </Tabs.Panel>
      </Tabs>
    </AppShell>
  );
}
