import React, { useEffect, useState } from "react";
import {
  Stack,
  Text,
  Loader,
  Avatar,
  Group,
  Button,
  Modal,
  Select,
  Checkbox,
} from "@mantine/core";
import { useAuth } from "src/context/AuthContext";

interface Member {
  userId: number;
  nickName?: string;
  isAdmin: boolean;
}

interface KeycloakUser {
  postgresId: number;
  firstName: string;
  lastName: string;
}

interface Props {
  groupId: string;
}

export default function GroupDetails({ groupId }: Props) {
  const { authHeader } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [userMap, setUserMap] = useState<Map<number, KeycloakUser>>(new Map());
  const [allUsers, setAllUsers] = useState<KeycloakUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpened, setModalOpened] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isAdminNewUser, setIsAdminNewUser] = useState(false);

  const fetchMembers = async () => {
    const res = await fetch(`http://localhost:8081/api/groups/${groupId}/members`, {
      headers: authHeader(),
    });
    const data = await res.json();
    setMembers(data);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resMembers, resUsers] = await Promise.all([
          fetch(`http://localhost:8081/api/groups/${groupId}/members`, {
            headers: authHeader(),
          }),
          fetch("http://localhost:8081/test/keycloak/all-users", {
            headers: authHeader(),
          }),
        ]);

        const membersData = await resMembers.json();
        const usersData = await resUsers.json();

        setMembers(membersData);

        const map = new Map<number, KeycloakUser>();
        usersData.forEach((u: any) => {
          if (u.postgresId) {
            map.set(u.postgresId, {
              postgresId: u.postgresId,
              firstName: u.firstName ?? "",
              lastName: u.lastName ?? "",
            });
          }
        });

        setUserMap(map);
        setAllUsers(usersData.filter((u: any) => u.postgresId));
      } catch (err) {
        console.error("Erreur chargement membres ou utilisateurs :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId, authHeader]);

  const handleRemove = async (userId: number) => {
    try {
      await fetch(`http://localhost:8081/api/groups/${groupId}/remove-member/${userId}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      await fetchMembers();
    } catch (err) {
      console.error("Erreur suppression membre :", err);
    }
  };

  const handleAddUser = async () => {
    if (!selectedUserId) return;

    try {
      await fetch(`http://localhost:8081/api/groups/${groupId}/add-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader(),
        },
        body: JSON.stringify({
          userId: parseInt(selectedUserId),
          isAdmin: isAdminNewUser,
          nickName: "",
        }),
      });

      setModalOpened(false);
      setSelectedUserId(null);
      setIsAdminNewUser(false);
      await fetchMembers();
    } catch (err) {
      console.error("Erreur ajout membre :", err);
    }
  };

  if (loading) return <Loader />;
  if (members.length === 0) return <Text>Aucun membre trouvé dans ce groupe.</Text>;

  return (
    <Stack>
      <Button onClick={() => setModalOpened(true)}>➕ Ajouter un membre</Button>

      {members.map((member, index) => {
        const userInfo = userMap.get(member.userId);
        const fullName = userInfo
          ? `${userInfo.firstName} ${userInfo.lastName}`
          : "Inconnu";

        return (
          <Group key={index} spacing="sm">
            <Avatar radius="xl" />
            <Stack spacing={0} style={{ flexGrow: 1 }}>
              <Text>
                {fullName}
                {member.isAdmin && <strong> (admin)</strong>}
              </Text>
              {member.nickName && (
                <Text size="xs" color="dimmed">
                  Pseudo: {member.nickName}
                </Text>
              )}
            </Stack>
            <Button color="red" size="xs" onClick={() => handleRemove(member.userId)}>
              Supprimer
            </Button>
          </Group>
        );
      })}

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Ajouter un membre"
      >
        <Select
          label="Rechercher un utilisateur à ajouter"
          placeholder="Commencez à taper un nom..."
          searchable
          nothingFound="Aucun utilisateur trouvé"
          maxDropdownHeight={200}
          dropdownPosition="bottom"
          withinPortal
          data={allUsers
            .filter((u) => !members.some((m) => m.userId === u.postgresId))
            .map((u) => ({
              value: String(u.postgresId),
              label: `${u.firstName} ${u.lastName} (ID: ${u.postgresId})`,
            }))
            .sort((a, b) => a.label.localeCompare(b.label))
          }
          value={selectedUserId}
          onChange={setSelectedUserId}
        />

        <Checkbox
          label="Rendre admin ce membre"
          checked={isAdminNewUser}
          onChange={(event) => setIsAdminNewUser(event.currentTarget.checked)}
          mt="sm"
        />

        <Button mt="md" fullWidth onClick={handleAddUser}>
          Ajouter
        </Button>
      </Modal>
    </Stack>
  );
}
