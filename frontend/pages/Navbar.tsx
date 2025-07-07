import React from "react";
import { Button, Group } from "@mantine/core";
import Link from "next/link";

const Navbar = () => {
  return (
    <Group align="center" spacing="md" mt="md">
      <Link href="/adduser" passHref>
        <Button component="a" variant="outline" color="blue">
          Ajouter Utilisateur
        </Button>
      </Link>
      <Link href="/userlist" passHref>
        <Button component="a" variant="outline" color="green">
          Liste des Utilisateurs
        </Button>
      </Link>
    </Group>
  );
};

export default Navbar;
