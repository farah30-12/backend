/*import { useState } from "react";
import {
  Button,
  Modal,
  Grid,
  TextInput,
  Select,
  Group,
  Text,
} from "@mantine/core";
import { IconPlus, IconUser, IconMail, IconPhone, IconBuildingStore, IconMapPin } from "@tabler/icons-react";
import axios from "axios";
import { authHeader } from "src/context/AuthContext";

export default function ProspectList() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newProspect, setNewProspect] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    societe: "",
    ville: "",
    pays: "",
    codePostal: "",
    description: "",
    statut: "",
    origine: "",
    gestionnaire: "",
  });

  const statutOptions = ["Nouveau", "À relancer", "Chaud", "Perdu", "Converti en client"];

  const handleCreate = async () => {
    try {
      const res = await axios.post("http://localhost:8081/api/prospects", newProspect, {
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
        ville: "",
        pays: "",
        codePostal: "",
        description: "",
        statut: "",
        origine: "",
        gestionnaire: "",
      });
    } catch (error) {
      console.error("Erreur lors de la création :", error);
      alert("Erreur lors de la création du prospect.");
    }
  };

  return (
    <div>
      <Button
        leftIcon={<IconPlus size={18} />}
        radius="xl"
        color="blue"
        onClick={() => setCreateModalOpen(true)} // Ouvre le modal
        style={{ boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)" }}
      >
        Ajouter Prospect
      </Button>

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
*/