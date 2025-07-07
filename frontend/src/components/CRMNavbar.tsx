import { Navbar, Stack, Text, Button, Divider, ThemeIcon } from "@mantine/core";
import { IconUser, IconBriefcase, IconCalendar, IconLogout, IconPlus } from "@tabler/icons-react";
import Link from "next/link";

export default function CRMNavbar() {
  return (
    <Navbar width={{ base: 250 }} p="md" style={{ backgroundColor: "#f8fbff" }}>
      <Stack spacing="md">
        <Text size="xl" weight={700} color="blue">CRM Menu</Text>

        <Link href="/crm" passHref>
          <Button variant="light" leftIcon={<IconUser size={18} />} fullWidth>
            Prospects
          </Button>
        </Link>

        <Link href="/clients" passHref>
          <Button variant="light" leftIcon={<IconBriefcase size={18} />} fullWidth>
            Clients
          </Button>
        </Link>

        <Link href="/actions" passHref>
          <Button variant="light" leftIcon={<IconCalendar size={18} />} fullWidth>
            Actions
          </Button>
        </Link>

        <Divider />

        <Button variant="outline" color="green" leftIcon={<IconPlus size={18} />} fullWidth>
          Ajouter
        </Button>

        <Button variant="subtle" color="red" leftIcon={<IconLogout size={18} />} fullWidth>
          Déconnexion
        </Button>
      </Stack>
    </Navbar>
  );
}
