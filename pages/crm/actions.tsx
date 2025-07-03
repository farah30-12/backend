// pages/crm/actions.tsx
import { Container, Title } from "@mantine/core";
import AddActionForm from "src/components/AddActionForm";

const ActionsPage = () => {
  return (
    <Container size="lg" p="md">
      <Title order={2} mb="lg">Créer une Action</Title>

      <AddActionForm />
    </Container>
  );
};

export default ActionsPage;
