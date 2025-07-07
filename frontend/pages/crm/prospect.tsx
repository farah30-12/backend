import React from "react";
import { Container, Divider, Title } from "@mantine/core";
import ProspectForm from "src/components/ProspectForm";
 // ✅ ajuste selon ton chemin réel

const ProspectsPage = () => {
  return (
    <Container size="lg" p="md">
      <Title order={2} mb="lg">Gestion des Prospects</Title>

      {/* 🧾 Formulaire pour ajouter un nouveau prospect */}
      <ProspectForm />

    

      {/* 📋 Affichage du tableau des actions */}
     
    </Container>
  );
};

export default ProspectsPage;
