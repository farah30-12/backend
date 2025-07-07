// Code final avec liaison prospect dans le formulaire d'action global
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
  Select,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
  IconUser,
  IconPhone,
  IconMail,
  IconPlus,
  IconBriefcase,
  IconCalendar,
  IconFile,
} from "@tabler/icons-react";

const predefinedActions = [
  { label: "Appel ou email de qualification", value: "qualification_call", description: "Confirmer son intérêt et identifier ses besoins." },
  { label: "Présentation du service", value: "service_presentation", description: "Démo personnalisée et mise en avant des bénéfices." },
  { label: "Proposition commerciale", value: "commercial_offer", description: "Envoi d’une offre personnalisée ou d’un contrat." },
  { label: "Suivi post-vente et fidélisation", value: "post_sale_followup", description: "Onboarding client et envoi de ressources utiles." },
  { label: "Gestion des objections", value: "objection_handling", description: "Répondre aux préoccupations du prospect." },
  { label: "Closing (Signature du contrat)", value: "closing", description: "Finalisation de la vente et signature du contrat." },
];

export default function CRMInterface() {
  const [activeTab, setActiveTab] = useState("prospects");
  const [opened, setOpened] = useState(false);
  const [showProspectModal, setShowProspectModal] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState(null);

  const [prospects, setProspects] = useState([]);
  const [clients, setClients] = useState([]);
  const [actions, setActions] = useState([]);

  const [form, setForm] = useState({ name: "", first_name: "", email: "", phone: "", address: "", comment: "" });
  const [clientForm, setClientForm] = useState({ client_type: "", conversion_date: new Date() });
  const [actionForm, setActionForm] = useState({
    action_type: "",
    action_date: new Date(),
    result: "",
    comment: "",
    fromTemplate: null,
    prospectId: null,
    prospectFirstName: "",
    prospectLastName: "",
    prospectEmail: "",
  });

  const handleInputChange = (field, value, context = "prospect") => {
    if (context === "prospect") setForm({ ...form, [field]: value });
    else if (context === "client") setClientForm({ ...clientForm, [field]: value });
    else if (context === "action") setActionForm({ ...actionForm, [field]: value });
  };

  const handleAddProspect = () => {
    const newProspect = { ...form, id: Date.now() };
    setProspects([...prospects, newProspect]);
    setForm({ name: "", first_name: "", email: "", phone: "", address: "", comment: "" });
    setOpened(false);
  };

  const handleAddClient = () => {
    setClients([...clients, clientForm]);
    setClientForm({ client_type: "", conversion_date: new Date() });
  };

  const handleAddAction = () => {
    if (!actionForm.prospectId) {
      alert("Veuillez sélectionner un prospect avant d'ajouter une action.");
      return;
    }
    setActions([...actions, actionForm]);
    setActionForm({
      action_type: "",
      action_date: new Date(),
      result: "",
      comment: "",
      fromTemplate: null,
      prospectId: null,
      prospectFirstName: "",
      prospectLastName: "",
      prospectEmail: "",
    });
  };

  return (
    <AppShell
      padding="md"
      navbar={<Navbar width={{ base: 300 }} p="xs"><Title order={4} color="blue">CRM Navigation</Title></Navbar>}
      header={<Header height={60} p="xs" style={{ backgroundColor: "#e0f2ff" }}><Group position="apart"><Title order={3} color="blue">🌟 CRM Dashboard</Title><Button color="indigo" leftIcon={<IconPlus />} onClick={() => setOpened(true)}>Nouveau Prospect</Button></Group></Header>}
    >
      <Tabs value={activeTab} onTabChange={setActiveTab} color="blue">
        <Tabs.List>
          <Tabs.Tab value="prospects" icon={<IconUser size={16} />}>Prospects</Tabs.Tab>
          <Tabs.Tab value="clients" icon={<IconBriefcase size={16} />}>Clients</Tabs.Tab>
          <Tabs.Tab value="actions" icon={<IconCalendar size={16} />}>Actions</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="prospects" pt="xs">
          <ScrollArea h={500}>
            <Stack spacing="sm">
              {prospects.map((prospect, index) => (
                <Paper key={index} p="md" radius="md" withBorder shadow="xs" style={{ backgroundColor: "#f0f9ff", cursor: "pointer" }} onClick={() => {
                  setSelectedProspect(prospect);
                  setShowProspectModal(true);
                }}>
                  <Text weight={700} size="lg" color="blue.8">{prospect.first_name} {prospect.name}</Text>
                  <Text size="sm" color="gray"><IconMail size={14} /> {prospect.email}</Text>
                  <Text size="sm" color="gray"><IconPhone size={14} /> {prospect.phone}</Text>
                  <Text size="sm">Adresse: {prospect.address}</Text>
                  <Divider my="sm" />
                  <Text size="sm" italic color="blue">Commentaire: {prospect.comment}</Text>
                </Paper>
              ))}
            </Stack>
          </ScrollArea>
        </Tabs.Panel>

        <Tabs.Panel value="actions" pt="xs">
          <Stack>
            <Select
              label="Choisir un prospect"
              placeholder="Sélectionner un prospect"
              data={prospects.map((p) => ({ value: p.id.toString(), label: `${p.first_name} ${p.name} (${p.email})` }))}
              value={actionForm.prospectId?.toString() || null}
              onChange={(val) => {
                const prospect = prospects.find((p) => p.id.toString() === val);
                if (prospect) {
                  setActionForm({
                    ...actionForm,
                    prospectId: prospect.id,
                    prospectFirstName: prospect.first_name,
                    prospectLastName: prospect.name,
                    prospectEmail: prospect.email,
                  });
                }
              }}
            />

            <Select
              label="Choisir une action prédéfinie"
              data={predefinedActions.map((action) => ({ value: action.value, label: action.label }))}
              value={actionForm.fromTemplate}
              onChange={(val) => {
                const selected = predefinedActions.find((a) => a.value === val);
                if (selected) {
                  setActionForm({
                    ...actionForm,
                    fromTemplate: selected.value,
                    action_type: selected.label,
                    comment: selected.description,
                  });
                }
              }}
              placeholder="Sélectionner une action"
              clearable
            />

            <TextInput label="Type d'action" value={actionForm.action_type} onChange={(e) => handleInputChange("action_type", e.target.value, "action")} />
            <DateInput label="Date d'action" value={actionForm.action_date} onChange={(val) => handleInputChange("action_date", val, "action")} />
            <TextInput label="Résultat" value={actionForm.result} onChange={(e) => handleInputChange("result", e.target.value, "action")} />
            <Textarea label="Commentaire" value={actionForm.comment} onChange={(e) => handleInputChange("comment", e.target.value, "action")} />
            <Button color="orange" onClick={handleAddAction}>Ajouter Action</Button>

            <Divider label="Liste des Actions" my="md" />
            {actions.map((action, index) => (
              <Paper key={index} p="md" radius="md" withBorder shadow="xs" style={{ backgroundColor: "#fff8e1" }}>
                <Text weight={600} color="orange.7">Type : {action.action_type}</Text>
                <Text>Date : {action.action_date.toDateString()}</Text>
                <Text>Résultat : {action.result}</Text>
                <Text size="sm" italic>Commentaire : {action.comment}</Text>
                <Text size="sm" color="gray">Pour : {action.prospectFirstName} {action.prospectLastName} ({action.prospectEmail})</Text>
              </Paper>
            ))}
          </Stack>
        </Tabs.Panel>
      </Tabs>

      <Modal opened={opened} onClose={() => setOpened(false)} title="Ajouter un prospect">
        <Stack>
          <TextInput label="Nom" value={form.name} onChange={(e) => handleInputChange("name", e.target.value)} />
          <TextInput label="Prénom" value={form.first_name} onChange={(e) => handleInputChange("first_name", e.target.value)} />
          <TextInput label="Email" value={form.email} onChange={(e) => handleInputChange("email", e.target.value)} />
          <TextInput label="Téléphone" value={form.phone} onChange={(e) => handleInputChange("phone", e.target.value)} />
          <TextInput label="Adresse" value={form.address} onChange={(e) => handleInputChange("address", e.target.value)} />
          <Textarea label="Commentaire" value={form.comment} onChange={(e) => handleInputChange("comment", e.target.value)} />
          <Button onClick={handleAddProspect} color="blue">Enregistrer</Button>
        </Stack>
      </Modal>

      <Modal opened={showProspectModal} onClose={() => setShowProspectModal(false)} title="Détail du prospect">
        {selectedProspect && (
          <Stack>
            <Text weight={700} size="lg">{selectedProspect.first_name} {selectedProspect.name}</Text>
            <Text size="sm">Email : {selectedProspect.email}</Text>
            <Text size="sm">Téléphone : {selectedProspect.phone}</Text>
            <Text size="sm">Adresse : {selectedProspect.address}</Text>
            <Text size="sm">Commentaire : {selectedProspect.comment}</Text>
          </Stack>
        )}
      </Modal>
    </AppShell>
  );
}