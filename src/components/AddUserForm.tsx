import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/router";
import { useAuth } from "src/context/AuthContext";
import {
  Button, TextInput, Select, Notification, Container, Title,
  Paper, Group, Divider, Stack, Center
} from "@mantine/core";
import { IconUserPlus, IconArrowBack, IconAt, IconLock, IconPhone, IconIdBadge, IconUser, IconBriefcase } from "@tabler/icons-react";

const AddUserForm = () => {
  const { keycloak } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  // ✅ Initialiser les champs du formulaire
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // ✅ Charger les informations de l'utilisateur à modifier
  const fetchUserData = async () => {
    try {
      if (!id) return;
      const token = keycloak?.token;
      if (!token) throw new Error("Token JWT manquant.");

      const response = await fetch(`http://localhost:8081/test/keycloak/user/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erreur lors de la récupération des données de l'utilisateur.");

      const data = await response.json();
      setUserName(data.username || "");
      setEmail(data.email || "");
      setFirstName(data.firstName || "");
      setLastName(data.lastName || "");
      setJobTitle(data.jobTitle || "");
      setPhoneNumber(data.phoneNumber || "");
      setRole(data.roles?.[0] || "user");
    } catch (error: any) {
      console.error("Erreur lors du chargement des données de l'utilisateur:", error);
      setToast(`Erreur: ${error.message}`);
    }
  };

  useEffect(() => {
    if (id) fetchUserData();
  }, [id]);

  // ✅ Réinitialiser les champs du formulaire
  const resetForm = () => {
    setUserName("");
    setEmail("");
    setPassword("");
    setRole("user");
    setFirstName("");
    setLastName("");
    setJobTitle("");
    setPhoneNumber("");
  };

  // ✅ Fonction de soumission du formulaire
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const token = keycloak?.token;
      if (!token) throw new Error("Token JWT manquant.");

      const endpoint = id
        ? `http://localhost:8081/test/keycloak/update/${id}`
        : "http://localhost:8081/test/keycloak/create";

      const method = id ? "PUT" : "POST";

      // ✅ Vérifier et formater les données
      const payload = {
        username: userName,
        email,
        firstName,
        lastName,
        enabled: true,
        credentials: [
          {
            type: "password",
            value: password,
            temporary: false,
          },
        ],
        attributes: {
          jobTitle: [jobTitle],
          phoneNumber: [phoneNumber],
        },
        realmRoles: [role],
      };

      console.log("Données envoyées :", JSON.stringify(payload, null, 2));

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur lors de la requête :", errorText);
        throw new Error(`Erreur lors de la création ou de la mise à jour : ${response.status} - ${errorText}`);
      }

      setToast(id ? "Utilisateur mis à jour avec succès!" : "Utilisateur créé avec succès!");

      // ✅ Réinitialiser le formulaire après la création
      resetForm();

      // ✅ Redirection après la création
      router.push("/userlist");
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour :", error.message);
      setToast(`Erreur: ${error.message}`);
    }
  };

  return (
    <Container size="sm" mt="xl">
      <Paper shadow="xl" p="xl" radius="md">
        <Center>
          <Title order={2} mb="md" style={{ fontFamily: "Roboto, sans-serif", color: "#1c7ed6" }}>
            {id ? "📝 Modifier l'utilisateur" : "➕ Ajouter un utilisateur"}
          </Title>
        </Center>

        {toast && (
          <Notification
            color="red"
            onClose={() => setToast(null)}
            style={{ marginBottom: "16px" }}
          >
            {toast}
          </Notification>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <TextInput
              label="Nom d'utilisateur"
              placeholder="Entrez le nom d'utilisateur"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              icon={<IconUser size={18} />}
              required
            />

            <TextInput
              label="Email"
              placeholder="exemple@domaine.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<IconAt size={18} />}
              required
            />

            <TextInput
              label="Mot de passe"
              placeholder="Entrez un mot de passe sécurisé"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<IconLock size={18} />}
              type="password"
              required
            />

            <TextInput
              label="Prénom"
              placeholder="Prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              icon={<IconIdBadge size={18} />}
              required
            />

            <TextInput
              label="Nom"
              placeholder="Nom"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              icon={<IconIdBadge size={18} />}
              required
            />

            <TextInput
              label="Titre de poste"
              placeholder="Ex: Développeur, Manager..."
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              icon={<IconBriefcase size={18} />}
              required
            />

            <TextInput
              label="Numéro de téléphone"
              placeholder="+33 6 12 34 56 78"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              icon={<IconPhone size={18} />}
              required
            />

            <Select
              label="Rôle"
              value={role}
              onChange={(value) => setRole(value!)}
              data={[
                { value: "user", label: "Utilisateur" },
                { value: "admin", label: "Administrateur" },
              ]}
              placeholder="Sélectionnez un rôle"
              required
            />

            <Group position="center" mt="lg">
              <Button type="submit" color="blue" size="md" radius="md" leftIcon={<IconUserPlus size={18} />}>
                {id ? "Enregistrer les modifications" : "Créer l'utilisateur"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default AddUserForm;
