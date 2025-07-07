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
  Select,
  Textarea,
  Switch,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "src/context/AuthContext";

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
  const { authHeader, keycloak } = useAuth();
  const headers = authHeader();

  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [showManualForm, setShowManualForm] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [templates, setTemplates] = useState<Action[]>([]);

  const [manualForm, setManualForm] = useState({
    objet: "",
    statut: "non_commence",
    dateEcheance: "",
    contact: "",
    rappel: "",
    description: "",
  });

  const fetchProspectDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:8081/api/prospects/${id}`, { headers });
      setProspect(res.data);
    } catch (err) {
      console.error("❌ Erreur chargement prospect :", err);
    }
  };

  const fetchActions = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/actions", { headers });
      const filtered = res.data.filter((a: any) => a.prospect?.id === Number(id));
      setActions(filtered);
    } catch (err) {
      console.error("❌ Erreur chargement actions :", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/actions/templates", { headers });
      setTemplates(res.data);
    } catch (err) {
      console.error("❌ Erreur chargement templates :", err);
    }
  };

  const handleDuplicate = async (templateId: number) => {
    try {
      await axios.post(`http://localhost:8081/api/actions/duplicate/${templateId}`, {
        managerEmail: keycloak.tokenParsed?.email,
        dateEcheance: new Date().toISOString().split("T")[0],
        contact: "prospect",
        prospect: { id: Number(id) },
      }, { headers });

      notifications.show({
        title: "✅ Action créée",
        message: "Action prédéfinie ajoutée avec succès",
        color: "green",
      });

      setAddModalOpen(false);
      fetchActions();
    } catch (err) {
      console.error("❌ Erreur duplication action :", err);
      notifications.show({
        title: "Erreur",
        message: "Impossible de dupliquer l'action",
        color: "red",
      });
    }
  };

  useEffect(() => {
    if (id) {
      fetchProspectDetails();
      fetchActions();
      fetchTemplates();
    }
  }, [id]);

  if (loading) {
    return (
      <Container mt="xl">
        <Group position="center">
          <Loader />
        </Group>
      </Container>
    );
  }

  if (!prospect) {
    return (
      <Container>
        <Title color="red">❌ Prospect introuvable</Title>
      </Container>
    );
  }

  return (
    <Container size="md" mt="xl">
      <Title order={3} mb="md">Détails du prospect</Title>
      <Text><strong>Nom :</strong> {prospect.firstName} {prospect.lastName}</Text>
      <Text><strong>Email :</strong> {prospect.email}</Text>

      <Button onClick={() => setAddModalOpen(true)} color="blue" mt="md" mb="md">
        ➕ Ajouter action prédéfinie
      </Button>

      <Modal
        opened={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Choisir une action prédéfinie"
        centered
      >
        <Stack>
          {templates.map((template) => (
            <Paper
              key={template.id}
              withBorder
              p="md"
              style={{ cursor: "pointer" }}
              onClick={() => handleDuplicate(template.id)}
            >
              <Title order={5}>{template.objet}</Title>
              <Text size="sm" color="dimmed">{template.description}</Text>
            </Paper>
          ))}
        </Stack>
      </Modal>
    </Container>
  );
}
