import React from 'react';
import { Container, Title, Divider } from '@mantine/core';
import ActionBoard from 'src/components/ActionBoard'; // ✅


export default function ProspectPage() {
  return (
    <Container fluid p="md">
      <Title order={2} mb="md">Gestion des Prospects</Title>

      <Divider my="sm" label="Tableau des Actions" labelPosition="center" />

      {/* 💡 Affiche le tableau Kanban des actions ici */}
      <ActionBoard />
    </Container>
  );
}
