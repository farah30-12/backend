import {
  Container,
  Grid,
  Paper,
  Title,
  Text,
  Stack,
  Button,
  Group,
  TextInput,
  Checkbox,
  Select,
  Modal,
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from 'src/context/AuthContext';

interface Action {
  id: number;
  objet: string;
  statut: string;
  dateEcheance: string;
  dateRappel: string;
  managerEmail: string;
  contact: string;
  description: string;
  prospect?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

const columns = ['Non commencé', 'En cours', 'Terminé'];

const normalizeStatut = (s: string) => s?.trim().toLowerCase();
const getStatutColumn = (statut: string) => {
  const norm = normalizeStatut(statut);
  if (["non commencé", "non_commencée", "non_commencee", "non_commence"].includes(norm)) return 'Non commencé';
  if (["en cours", "en_cours", "encours"].includes(norm)) return 'En cours';
  if (["terminé", "termine"].includes(norm)) return 'Terminé';
  return 'Autre';
};

export default function ActionBoard() {
  const router = useRouter();
  const { authHeader } = useAuth();
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const [statutsFiltrés, setStatutsFiltrés] = useState<string[]>(columns);
  const [searchObjet, setSearchObjet] = useState('');
  const [searchManager, setSearchManager] = useState('');
  const [searchDate, setSearchDate] = useState('');

  const fetchActions = async () => {
    try {
      const res = await axios.get('http://localhost:8081/api/actions', {
        headers: authHeader(),
      });
      setActions(res.data);
    } catch (err) {
      console.error('❌ Erreur chargement des actions :', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const updateStatut = async (id: number, newStatut: string) => {
    try {
      await axios.put(
        `http://localhost:8081/api/actions/${id}`,
        { statut: newStatut },
        { headers: authHeader() }
      );
      setActions(prev => prev.map(a => a.id === id ? { ...a, statut: newStatut } : a));
    } catch (err) {
      console.error("❌ Erreur mise à jour du statut :", err);
    }
  };

  const filteredActions = actions.filter((a) =>
    statutsFiltrés.includes(getStatutColumn(a.statut)) &&
    (searchObjet === '' || a.objet?.toLowerCase().includes(searchObjet.toLowerCase())) &&
    (searchManager === '' || a.managerEmail?.toLowerCase().includes(searchManager.toLowerCase())) &&
    (searchDate === '' || a.dateEcheance?.includes(searchDate))
  );

  const handleAddAction = () => router.push('/crm/actions');
  const openDetailsModal = (action: Action) => {
    setSelectedAction(action);
    setModalOpened(true);
  };

  if (loading) return <Text>Chargement...</Text>;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #3E5879, #D8C4B6)',
      padding: '40px 0',
      fontFamily: 'Poppins, sans-serif',
      position: 'relative',
    }}>
      <Group align="start" noWrap spacing="lg" px="xl">
        <Paper
          withBorder
          p="md"
          style={{
            minWidth: 320,
            height: "calc(100vh - 100px)",
            overflowY: "auto",
            backgroundColor: "#F5EFE7",
            borderRadius: "20px",
          }}
        >
          <Title order={4} mb="sm">🎯 Filtres de gestion d'action</Title>
          <TextInput label="Objet" value={searchObjet} onChange={(e) => setSearchObjet(e.currentTarget.value)} mb="sm" />
          <TextInput label="Gestionnaire" value={searchManager} onChange={(e) => setSearchManager(e.currentTarget.value)} mb="sm" />
          <TextInput label="Date d’échéance" value={searchDate} onChange={(e) => setSearchDate(e.currentTarget.value)} mb="sm" />
          <Title order={6} mt="md">Par statut</Title>
          <Stack spacing="xs">
            {columns.map((col) => (
              <Checkbox
                key={col}
                label={col}
                checked={statutsFiltrés.includes(col)}
                onChange={(e) => {
                  const newVals = e.currentTarget.checked
                    ? [...statutsFiltrés, col]
                    : statutsFiltrés.filter((s) => s !== col);
                  setStatutsFiltrés(newVals);
                }}
              />
            ))}
          </Stack>
        </Paper>

        <Container fluid>
          <Group position="apart" mb="lg">
            <Title order={2} style={{ color: 'white' }}>📋 Tableau des Actions</Title>
            <Button onClick={handleAddAction} radius="xl" variant="white" color="gray">+ Ajouter une action</Button>
          </Group>

          <Grid grow>
            {columns.map((statutColonne) => (
              <Grid.Col span={4} key={statutColonne}>
                <Paper shadow="xs" p="md" withBorder style={{ backgroundColor: '#D8C4B6', borderRadius: 20 }}>
                  <Title order={4} mb="md">{statutColonne}</Title>
                  <Stack>
                    {filteredActions
                      .filter((a) => getStatutColumn(a.statut) === statutColonne)
                      .map((action) => (
                        <Paper
                          key={action.id}
                          p="sm"
                          shadow="xs"
                          radius="md"
                          withBorder
                          onClick={() => openDetailsModal(action)}
                          style={{ cursor: 'pointer', backgroundColor: '#F5EFE7' }}
                        >
                          <Text fw={500}>{action.objet}</Text>
                          <Text size="sm" color="dimmed">📅 {action.dateEcheance} — 🔁 {action.dateRappel}</Text>
                          <Text size="sm">👤 {action.managerEmail}</Text>
                          <Text size="sm" color="dimmed">📝 {action.description}</Text>
                          {action.prospect?.id && (
                            <Text
                              size="sm"
                              color="blue"
                              style={{ textDecoration: 'underline', cursor: 'pointer' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/crm/prospects/${action.prospect?.id}`);
                              }}
                            >
                              🔗 {action.prospect.firstName} {action.prospect.lastName}
                            </Text>
                          )}
                          <Select
                            label="Changer le statut"
                            data={[
                              { value: "non_commence", label: "Non commencé" },
                              { value: "en_cours", label: "En cours" },
                              { value: "termine", label: "Terminé" },
                            ]}
                            value={normalizeStatut(action.statut)}
                            onChange={(value) => value && updateStatut(action.id, value)}
                            mt="sm"
                          />
                        </Paper>
                      ))}
                    {filteredActions.filter((a) => getStatutColumn(a.statut) === statutColonne).length === 0 && (
                      <Text size="sm" color="dimmed">Aucune tâche trouvée.</Text>
                    )}
                  </Stack>
                </Paper>
              </Grid.Col>
            ))}
          </Grid>
        </Container>
      </Group>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="📝 Détails de l'action"
        centered
        size="lg"
        styles={{
          title: { fontFamily: 'Poppins, sans-serif', fontWeight: 600 },
          body: { backgroundColor: '#F5EFE7', borderRadius: 15 },
        }}
      >
        {selectedAction && (
          <Paper p="lg" radius="md" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Stack spacing="xs">
              <Text><strong>Objet :</strong> {selectedAction.objet}</Text>
              <Text><strong>Statut :</strong> {selectedAction.statut}</Text>
              <Text><strong>Date d’échéance :</strong> {selectedAction.dateEcheance}</Text>
              <Text><strong>Date de rappel :</strong> {selectedAction.dateRappel}</Text>
              <Text><strong>Gestionnaire :</strong> {selectedAction.managerEmail}</Text>
              <Text><strong>Description :</strong> {selectedAction.description}</Text>
              <Text><strong>Contact :</strong> {selectedAction.contact}</Text>
              {selectedAction.prospect && (
                <Text><strong>Prospect :</strong> {selectedAction.prospect.firstName} {selectedAction.prospect.lastName}</Text>
              )}
            </Stack>
          </Paper>
        )}
      </Modal>

      <Button
        variant="filled"
        color="gray"
        leftIcon={<IconArrowLeft />}
        onClick={() => window.location.href = "http://localhost:3000"}
        style={{
          position: "fixed",
          bottom: 20,
          left: 20,
          zIndex: 1000,
          borderRadius: "30px",
        }}
      >
        Retour à l'accueil
      </Button>
    </div>
  );
}
