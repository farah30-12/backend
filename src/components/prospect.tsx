import { useState } from "react";
import {
  AppShell,
  Navbar,
  Header,
  Button,
  Text,
  Group,
  Stack,
  Title,
  Paper,
  Divider,
  Badge,
  Container,
  Select,
  ActionIcon,
  Modal,
  TextInput,
  Textarea,
  ScrollArea,
  Flex,
  Box,
  Card,
} from '@mantine/core';
import { IconPlus, IconEdit, IconEye, IconList } from '@tabler/icons-react';

export default function CRMInterface() {
  const [prospects, setProspects] = useState([
    {
      id: 1,
      firstName: 'Mahdi',
      lastName: 'Ben Ali',
      email: 'mahdi@benali.tn',
      phone: '+216 20 123 456',
      entreprise: 'Ben Ali Consulting',
      statut: 'Chaud',
      classification: 'Chaud',
      dateContact: '08/04/2025',
      prochaineRelance: '15/04/2025',
      commentaire: 'Intéressé par nos services, à relancer après réception du devis.',
      actions: [
        { actionType: 'Appel de qualification', date: '10/04/2025', commentaire: 'Qualification réussie.' },
        { actionType: 'Proposition commerciale', date: '12/04/2025', commentaire: 'Proposition envoyée.' }
      ]
    },
  ]);

  const [openedDetails, setOpenedDetails] = useState(false);
  const [openedActions, setOpenedActions] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [newAction, setNewAction] = useState({ actionType: '', commentaire: '', date: new Date().toISOString().split('T')[0] });

  const handleViewDetails = (prospectId) => {
    const prospect = prospects.find((prospect) => prospect.id === prospectId);
    if (prospect) {
      setSelectedProspect(prospect);
      setOpenedDetails(true);
    }
  };

  const handleViewActions = (prospectId) => {
    const prospect = prospects.find((prospect) => prospect.id === prospectId);
    if (prospect) {
      setSelectedProspect(prospect);
      setOpenedActions(true);
    }
  };

  const handleAddAction = () => {
    const updatedProspects = prospects.map((prospect) => {
      if (prospect.id === selectedProspect.id) {
        const updatedProspect = { ...prospect, actions: [...prospect.actions, newAction] };
        return updatedProspect;
      }
      return prospect;
    });
    setProspects(updatedProspects);
    setNewAction({ actionType: '', commentaire: '', date: new Date().toISOString().split('T')[0] });
  };

  const getProspectsByClassification = (classification) => {
    return prospects.filter((prospect) => prospect.classification === classification);
  };

  return (
    <AppShell
      padding="md"
      navbar={<Navbar width={{ base: 280 }} p="md"><Title order={4} color="blue">📁 Navigation CRM</Title></Navbar>}
      header={
        <Header height={60} p="md" style={{ backgroundColor: "#e0f7ff" }}>
          <Group position="apart">
            <Title order={3} color="blue">🌟 Tableau de bord CRM</Title>
            <Button color="blue" leftIcon={<IconPlus />}>Nouveau Prospect</Button>
          </Group>
        </Header>
      }
    >
      <Container>
        <Title order={3} color="blue" mb="md">🔄 Pipeline des Prospects</Title>

        <Group align="start" noWrap style={{ overflowX: 'auto' }}>
          {['Nouveau', 'À relancer', 'Chaud', 'Perdu', 'Converti en client'].map((category) => (
            <Stack key={category} spacing="sm" w={250}>
              <Title order={4}>{category}</Title>
              {getProspectsByClassification(category).map((prospect) => (
                <Card key={prospect.id} shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack spacing={4}>
                    <Text weight={600}>{prospect.firstName} {prospect.lastName}</Text>
                    <Text size="sm" color="dimmed">{prospect.entreprise}</Text>
                    <Badge color="blue" variant="light">{prospect.statut}</Badge>
                    <Text size="xs">{prospect.commentaire}</Text>
                    <Group spacing="xs" mt="sm">
                      <ActionIcon color="blue" variant="light" onClick={() => handleViewDetails(prospect.id)}>
                        <IconEye size={18} />
                      </ActionIcon>
                      <ActionIcon color="green" variant="light" onClick={() => handleViewActions(prospect.id)}>
                        <IconList size={18} />
                      </ActionIcon>
                    </Group>
                  </Stack>
                </Card>
              ))}
            </Stack>
          ))}
        </Group>

        {/* Modale Actions */}
        <Modal opened={openedActions} onClose={() => setOpenedActions(false)} title={`📝 Actions pour ${selectedProspect?.firstName} ${selectedProspect?.lastName}`} size="lg">
          <ScrollArea h={400}>
            <Stack spacing="sm">
              {selectedProspect?.actions.map((action, index) => (
                <Paper key={index} p="md" withBorder shadow="xs" radius="md" style={{ backgroundColor: '#f7f9fb' }}>
                  <Text fw={500}>📅 {action.date}</Text>
                  <Text>🔹 {action.actionType}</Text>
                  <Text size="sm" color="dimmed">🗒️ {action.commentaire}</Text>
                </Paper>
              ))}
              <Divider my="md" />
              <Title order={5}>➕ Nouvelle action</Title>
              <Select
                label="Type d'action"
                placeholder="Sélectionner"
                data={[
                  { value: "Appel ou email de qualification", label: "Appel ou email de qualification" },
                  { value: "Présentation du service", label: "Présentation du service" },
                  { value: "Proposition commerciale", label: "Proposition commerciale" },
                  { value: "Gestion des objections", label: "Gestion des objections" },
                  { value: "Suivi post-vente et fidélisation", label: "Suivi post-vente et fidélisation" },
                  { value: "Closing (Signature du contrat)", label: "Closing (Signature du contrat)" },
                ]}
                value={newAction.actionType}
                onChange={(val) => setNewAction({ ...newAction, actionType: val || '' })}
              />
              <TextInput
                label="Date"
                type="date"
                value={newAction.date}
                onChange={(e) => setNewAction({ ...newAction, date: e.target.value })}
              />
              <Textarea
                label="Commentaire"
                value={newAction.commentaire}
                onChange={(e) => setNewAction({ ...newAction, commentaire: e.target.value })}
              />
              <Button color="teal" fullWidth mt="md" onClick={handleAddAction} disabled={!newAction.actionType || !newAction.date}>Ajouter l'action</Button>
            </Stack>
          </ScrollArea>
        </Modal>

        {/* Modale Détails */}
        <Modal opened={openedDetails} onClose={() => setOpenedDetails(false)} title={`👤 Détails de ${selectedProspect?.firstName} ${selectedProspect?.lastName}`} size="md">
          {selectedProspect && (
            <Stack spacing="xs">
              <Text><strong>Entreprise :</strong> {selectedProspect.entreprise}</Text>
              <Text><strong>Email :</strong> {selectedProspect.email}</Text>
              <Text><strong>Téléphone :</strong> {selectedProspect.phone}</Text>
              <Text><strong>Date de contact :</strong> {selectedProspect.dateContact}</Text>
              <Text><strong>Prochaine relance :</strong> {selectedProspect.prochaineRelance}</Text>
              <Text><strong>Statut :</strong> {selectedProspect.statut}</Text>
              <Select
                label="Classification"
                value={selectedProspect.classification}
                onChange={(newClassification) => {
                  if (!newClassification) return;
                  const updated = prospects.map((p) =>
                    p.id === selectedProspect.id ? { ...p, classification: newClassification } : p
                  );
                  setProspects(updated);
                  setSelectedProspect((prev) => prev ? { ...prev, classification: newClassification } : null);
                }}
                data={[
                  { value: 'Nouveau', label: 'Nouveau' },
                  { value: 'À relancer', label: 'À relancer' },
                  { value: 'Chaud', label: 'Chaud' },
                  { value: 'Perdu', label: 'Perdu' },
                  { value: 'Converti en client', label: 'Converti en client' },
                ]}
                withinPortal
              />
              <Text><strong>Commentaire :</strong> {selectedProspect.commentaire}</Text>
            </Stack>
          )}
        </Modal>
      </Container>
    </AppShell>
  );
}///////hata hthy behy 