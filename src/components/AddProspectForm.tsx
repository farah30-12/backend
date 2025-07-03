/*import { useState } from "react";
import {
  TextInput,
  Textarea,
  Select,
  Button,
  DateInput,
  Stack,
  Paper
} from "@mantine/core";

export default function AddProspectForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    status: "",
    leadType: "",
    nextReminder: new Date(),
    comment: "",
  });

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log("✅ Prospect ajouté :", form);
    // ➕ ici tu peux l'envoyer vers ton backend
  };

  return (
    <Paper shadow="xs" radius="md" p="lg" withBorder>
      <Stack spacing="md">
        <TextInput
          label="Prénom"
          value={form.firstName}
          onChange={(e) => handleChange("firstName", e.target.value)}
        />
        <TextInput
          label="Nom"
          value={form.lastName}
          onChange={(e) => handleChange("lastName", e.target.value)}
        />
        <TextInput
          label="Email"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />
        <Select
          label="Statut"
          data={["Nouveau", "À relancer", "En négociation", "Chaud", "Perdu"]}
          value={form.status}
          onChange={(val) => handleChange("status", val)}
        />
        <Select
          label="Type de lead"
          data={[
            "Lead froid (pas prêt)",
            "Concurrent",
            "Sans budget",
            "Non qualifié",
          ]}
          value={form.leadType}
          onChange={(val) => handleChange("leadType", val)}
        />
        <DateInput
          label="Prochaine relance"
          value={form.nextReminder}
          onChange={(val) => handleChange("nextReminder", val)}
        />
        <Textarea
          label="Commentaire"
          value={form.comment}
          onChange={(e) => handleChange("comment", e.target.value)}
        />
        <Button color="blue" onClick={handleSubmit}>
          Ajouter le prospect
        </Button>
      </Stack>
    </Paper>
  );
}
*/