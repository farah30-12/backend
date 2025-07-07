import React, { useState } from "react";
import {
  TextInput,
  Textarea,
  Select,
  Button,
  Title,
  Group,
  Container,
  Paper,
  Grid,
} from "@mantine/core";
import { useRouter } from "next/router";
import axios from "axios";
import { useAuth } from "src/context/AuthContext";

export default function ProspectForm() {
  const router = useRouter();
  const { authHeader } = useAuth();

  const [form, setForm] = useState({
    gestionnaire: "",
    firstName: "",
    lastName: "",
    phone: "",
    secteur: "",
    societe: "",
    email: "",
    origine: "",
    statut: "",
    pays: "",
    ville: "",
    codePostal: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Créer un nouvel objet prospect avec un ID généré
      const newProspect = {
        ...form,
        id: Math.floor(Math.random() * 10000) + 1000, // ID aléatoire
        createdAt: new Date().toISOString()
      };

      console.log("Création d'un nouveau prospect :", newProspect);

      // Récupérer les prospects existants du localStorage
      const existingProspects = JSON.parse(localStorage.getItem('demoProspects') || '[]');

      // Ajouter le nouveau prospect
      const updatedProspects = [...existingProspects, newProspect];

      // Enregistrer dans le localStorage
      localStorage.setItem('demoProspects', JSON.stringify(updatedProspects));

      console.log("✅ Prospect ajouté avec succès ! Total prospects:", updatedProspects.length);

      // Afficher un message de succès
      alert(`Prospect ${form.firstName} ${form.lastName} ajouté avec succès !`);

      // Redirection vers la liste des prospects
      router.push("/crm/List");
    } catch (error: any) {
      console.error("❌ Erreur lors de la création du prospect :", error);
      alert(`Erreur lors de la création du prospect : ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container size="lg">
      <Title order={2} mb="md">Créer un Prospect</Title>
      <Paper shadow="xs" p="lg" radius="md" withBorder>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Email du Gestionnaire"
                value={form.gestionnaire}
                onChange={(e) => handleChange("gestionnaire", e.target.value)}
                placeholder="ex: gestionnaire@email.com"
                required
              />
              <TextInput label="Prénom" value={form.firstName} onChange={(e) => handleChange("firstName", e.target.value)} required />
              <TextInput label="Nom" value={form.lastName} onChange={(e) => handleChange("lastName", e.target.value)} required />
              <TextInput label="Téléphone" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
              <TextInput label="Société" value={form.societe} onChange={(e) => handleChange("societe", e.target.value)} />
              <TextInput label="Email du Prospect" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput label="Secteur" value={form.secteur} onChange={(e) => handleChange("secteur", e.target.value)} />
              <Select
                label="Origine du Prospect"
                data={[
                  { value: "site_web", label: "Site Web" },
                  { value: "salon", label: "Salon" },
                  { value: "reseau", label: "Réseau" },
                  { value: "autre", label: "Autre" },
                ]}
                value={form.origine}
                onChange={(value) => handleChange("origine", value || "")}
              />
              <Select
                label="Statut du Prospect"
                data={["nouveau", "a_relancer", "perdu", "chaud"]}
                value={form.statut}
                onChange={(value) => handleChange("statut", value || "")}
              />
              <TextInput label="Pays" value={form.pays} onChange={(e) => handleChange("pays", e.target.value)} />
              <TextInput label="Ville" value={form.ville} onChange={(e) => handleChange("ville", e.target.value)} />
              <TextInput label="Code postal" value={form.codePostal} onChange={(e) => handleChange("codePostal", e.target.value)} />
              <Textarea label="Description" value={form.description} onChange={(e) => handleChange("description", e.target.value)} minRows={3} />
            </Grid.Col>
          </Grid>

          <Group position="apart" mt="md">
            <Button variant="outline" color="gray" onClick={() => router.back()}>
              Retour
            </Button>
            <Button type="submit" variant="filled" color="blue" loading={isSubmitting}>
              Enregistrer
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}
