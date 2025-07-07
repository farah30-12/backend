import React, { useEffect, useState } from "react";
import {
  Stack,
  TextInput,
  ScrollArea,
  Title,
  Button,
  Group,
  Modal,
  Checkbox,
  Text,
  Paper,
  Divider,
  Box,
  ActionIcon,
  Loader,
} from "@mantine/core";
import { IconPlus, IconSearch, IconUsers, IconUserPlus } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import ConversationItem from "./ConversationItem";
import { useAuth } from "src/context/AuthContext";

interface ChatTarget {
  id: string;
  name: string;
  type: "user" | "group";
}

interface Props {
  onSelectUser: (user: ChatTarget) => void;
}

interface User {
  idKeycloak: string;
  postgresId: number;
  firstName: string;
  lastName: string;
  lastMessageTime: string;
}

interface Group {
  id: number;
  name: string;
  lastMessageTime?: string;
}

export default function ConversationList({ onSelectUser }: Props) {
  const { keycloak, authHeader } = useAuth();
  const keycloakId = keycloak?.tokenParsed?.sub;

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [conversationUsers, setConversationUsers] = useState<User[]>([]);
  const [allKeycloakUsers, setAllKeycloakUsers] = useState<User[]>([]);
  const [conversationGroups, setConversationGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [unreadPrivate, setUnreadPrivate] = useState<Record<string, number>>({});
  const [unreadGroup, setUnreadGroup] = useState<Record<string, number>>({});
  const [unreadByRecipients, setUnreadByRecipients] = useState<Record<string, number>>({});
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [mergedList, setMergedList] = useState<any[]>([]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!keycloakId) return;
      try {
        const res = await fetch(
          `http://localhost:8081/test/keycloak/user/by-keycloak/${keycloakId}`,
          { headers: authHeader() }
        );
        const data = await res.json();
        setCurrentUserId(data.id);
      } catch (err) {
        console.error("Erreur user connecté :", err);
      }
    };
    fetchCurrentUser();
  }, [keycloakId, authHeader]);

  const fetchData = async () => {
    if (!currentUserId) return;
    try {
      const [
        resConversations,
        resKeycloak,
        resGroups,
        resUnreadPrivate,
        resUnreadGroup,
      ] = await Promise.all([
        fetch(`http://localhost:8081/api/messages/conversation-users?currentUserId=${currentUserId}`, { headers: authHeader() }),
        fetch("http://localhost:8081/test/keycloak/all-users", { headers: authHeader() }),
        fetch(`http://localhost:8081/api/groups/groups-with-messages/${currentUserId}`, { headers: authHeader() }),
        fetch(`http://localhost:8081/api/messages/unread/private/${currentUserId}`, { headers: authHeader() }).then(res => {
          console.log("🔍 Appel API unread-private:", res.status, res.ok);
          return res;
        }),
        fetch(`http://localhost:8081/api/messages/unread/groups/${currentUserId}`, { headers: authHeader() }),
      ]);

      const convUsers = await resConversations.json();
      const keycloakUsers = await resKeycloak.json();
      const groups = await resGroups.json();
      console.log("🧪 Groupes avec messages :", groups);
      const unreadPrivateData = await resUnreadPrivate.json();
      const unreadGroupData = await resUnreadGroup.json();

      console.log("✅ Données unread-private:", unreadPrivateData);

      const unreadPrivateFormatted: Record<string, number> = {};
      Object.entries(unreadPrivateData).forEach(([k, v]) => {
        unreadPrivateFormatted[String(k)] = v as number;
      });
      setUnreadPrivate(unreadPrivateFormatted);

      console.log("🔴 Messages non lus reçus:", unreadPrivateFormatted);

      // Afficher un log détaillé pour chaque utilisateur avec des messages non lus
      Object.entries(unreadPrivateFormatted).forEach(([userId, count]) => {
        if (count > 0) {
          console.log(`🔔 L'utilisateur avec l'ID ${userId} vous a envoyé ${count} message(s) non lu(s)`);
        }
      });

      const unreadGroupFormatted: Record<string, number> = {};
      Object.entries(unreadGroupData).forEach(([k, v]) => {
        unreadGroupFormatted[String(k)] = v as number;
      });
      setUnreadGroup(unreadGroupFormatted);

      // Nous n'utilisons plus les messages non lus par les destinataires
      setUnreadByRecipients({});

      const formattedConvUsers: User[] = Array.isArray(convUsers)
        ? convUsers.filter((u: any) => u.idKeycloak && u.postgresId != null).map((u: any) => ({
            idKeycloak: u.idKeycloak,
            postgresId: u.postgresId,
            firstName: u.firstName ?? "",
            lastName: u.lastName ?? "",
            lastMessageTime: u.lastMessageTime ?? "",
          }))
        : [];

      const formattedKeycloakUsers: User[] = Array.isArray(keycloakUsers)
        ? keycloakUsers.filter((u: any) => u.id !== keycloakId).map((u: any) => ({
            idKeycloak: u.id,
            postgresId: u.postgresId,
            firstName: u.firstName ?? "",
            lastName: u.lastName ?? "",
            lastMessageTime: u.lastMessageTime ?? "",
          }))
        : [];

      const formattedGroups: Group[] = Array.isArray(groups)
        ? groups
            .filter((g: any) => g.id && g.name)
            .map((g: any) => ({
              id: g.id,
              name: g.name,
              lastMessageTime: g.lastMessageTime ?? "", // s'assurer que ce champ existe
            }))
        : [];

      setConversationUsers(formattedConvUsers);
      setConversationGroups(formattedGroups);
      setAllKeycloakUsers(formattedKeycloakUsers);

      const mergedConversations = [
        ...formattedConvUsers.map((user) => ({
          id: user.idKeycloak,
          name: `${user.firstName} ${user.lastName}`,
          lastMessageTime: user.lastMessageTime,
          type: "user",
          unread: unreadPrivateFormatted[String(user.postgresId)] || 0,
          unreadByRecipient: 0,
          senderName: `${user.firstName} ${user.lastName}`,
        })),
        ...formattedGroups.map((group) => ({
          id: String(group.id),
          name: group.name,
          lastMessageTime: group.lastMessageTime ?? "",
          type: "group",
          unread: unreadGroupFormatted[String(group.id)] || 0,
          unreadByRecipient: 0, // Pour les groupes, on ne gère pas encore cette fonctionnalité
          senderName: "Group",
        })),
      ];
      const globallySorted = mergedConversations.sort(
        (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );

      setMergedList(globallySorted);

    } catch (err) {
      console.error("Erreur chargement utilisateurs :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUserId, keycloakId, authHeader]);

  useEffect(() => {
    // Gestionnaire d'événement pour rafraîchir les conversations
    const handler = () => fetchData();
    window.addEventListener("refreshConversations", handler);

    // Rafraîchir automatiquement toutes les 10 secondes
    const intervalId = setInterval(() => {
      console.log("🔄 Rafraîchissement automatique des conversations");
      fetchData();
    }, 10000);

    return () => {
      window.removeEventListener("refreshConversations", handler);
      clearInterval(intervalId);
    };
  }, [currentUserId]);

  const toggleSelected = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || !currentUserId) return;

    const dto = {
      name: groupName,
      isClosed: false,
      description: "",
      members: [
        { userId: currentUserId.toString(), nickName: "", isAdmin: true },
        ...selectedUsers.map((userId) => ({
          userId,
          nickName: "",
          isAdmin: false,
        })),
      ],
    };

    try {
      const res = await fetch("http://localhost:8081/api/groups/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader(),
        },
        body: JSON.stringify(dto),
      });

      if (!res.ok) throw new Error("Erreur lors de la création du groupe");

      const created = await res.json();
      notifications.show({
        title: "Groupe créé",
        message: `Le groupe « ${created.name} » a été créé avec succès`,
        color: "teal",
      });

      onSelectUser({ id: String(created.id), name: created.name, type: "group" });
      setGroupName("");
      setSelectedUsers([]);
      setModalOpened(false);

      // ⏳ délai court pour laisser le backend créer le message ou groupe
      setTimeout(() => window.dispatchEvent(new Event("refreshConversations")), 300);
    } catch (err) {
      console.error("Erreur création groupe :", err);
      notifications.show({
        title: "Erreur",
        message: "Impossible de créer le groupe",
        color: "red",
      });
    }
  };

  return (
    <Stack spacing="xs" style={{ height: "100%", width: "100%", padding: "10px" }}>
      <Group position="apart" style={{ marginBottom: "10px" }}>
        <Title order={4}>Messagerie</Title>
        <Group spacing="xs">
          <Button
            size="xs"
            onClick={() => setModalOpened(true)}
            leftIcon={<IconPlus size={16} />}
            style={{ padding: "0 10px" }}
          >
            Nouveau groupe
          </Button>
        </Group>
      </Group>

      <TextInput
        placeholder="Rechercher un utilisateur ou groupe..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.currentTarget.value)}
        style={{ marginBottom: 10 }}
        icon={<IconSearch size={16} />}
      />

      <ScrollArea style={{ height: "calc(100% - 80px)", padding: "4px" }}>
        {loading ? (
          <Text align="center" color="dimmed">Chargement...</Text>
        ) : (
          <>
            {(searchTerm.trim()
              ? [...mergedList.filter((item) =>
                  item.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
                ),
                // Ajouter les utilisateurs Keycloak qui correspondent à la recherche mais qui ne sont pas dans mergedList
                ...allKeycloakUsers
                  .filter((user) =>
                    // Vérifier si l'utilisateur correspond à la recherche
                    (`${user.firstName} ${user.lastName}`).toLowerCase().includes(searchTerm.toLowerCase().trim()) &&
                    // Vérifier si l'utilisateur n'est pas déjà dans mergedList
                    !mergedList.some(item => item.type === "user" && item.id === user.idKeycloak)
                  )
                  .map(user => ({
                    id: user.idKeycloak,
                    name: `${user.firstName} ${user.lastName}`,
                    lastMessageTime: "",
                    type: "user",
                    unread: 0,
                    unreadByRecipient: 0,
                    senderName: `${user.firstName} ${user.lastName}`,
                  }))
              ]
              : mergedList
            ).map((item) => (
              <ConversationItem
                key={item.id}
                conversation={{
                  id: item.id,
                  name: item.name,
                  lastMessage: "Dernier message...",
                  lastMessageTime: item.lastMessageTime,
                  unread: item.unread,
                  unreadByRecipient: item.unreadByRecipient,
                  senderName: item.senderName,
                }}
                onClick={async () => {
                  console.log(`👆 Clic sur la conversation avec ${item.name}`);

                  // Si c'est un utilisateur existant (avec des messages) et qu'il y a des messages non lus
                  if (item.lastMessageTime && item.unread && item.unread > 0) {
                    console.log(`🔍 Marquage des messages comme lus pour ${item.name} (${item.unread} message(s) non lu(s))`);

                    try {
                      // Utiliser l'URL correcte pour marquer les messages comme lus
                      let url: string;
                      if (item.type === "user") {
                        // Pour les conversations privées, nous avons besoin de l'ID postgres
                        const userPostgresId = allKeycloakUsers.find(u => u.idKeycloak === item.id)?.postgresId;
                        if (!userPostgresId) {
                          console.error(`❌ Impossible de trouver l'ID postgres pour l'utilisateur ${item.name}`);
                          return;
                        }
                        url = `http://localhost:8081/api/messages/mark-as-seen?currentUserId=${currentUserId}&otherUserId=${userPostgresId}`;
                      } else {
                        // Pour les groupes, utiliser l'URL existante
                        url = `http://localhost:8081/api/messages/mark-read/group?currentUserId=${currentUserId}&groupId=${item.id}`;
                      }

                      console.log(`🔍 Appel API pour marquer les messages comme lus: ${url}`);
                      const res = await fetch(url, { method: "PUT", headers: authHeader() });

                      if (res.ok) {
                        console.log(`✅ Messages marqués comme lus pour ${item.name} (statut: ${res.status})`);
                        // Rafraîchir la liste des conversations pour mettre à jour les compteurs
                        window.dispatchEvent(new Event("refreshConversations"));

                        // Un seul rafraîchissement est suffisant maintenant que nous avons optimisé les appels API
                      } else {
                        console.error(`❌ Erreur lors du marquage des messages comme lus pour ${item.name} (statut: ${res.status})`);
                        const errorText = await res.text();
                        console.error(`Détails de l'erreur: ${errorText}`);
                      }
                    } catch (error) {
                      console.error("Erreur lors du marquage des messages comme lus:", error);
                    }
                  } else {
                    console.log(`ℹ️ Pas de messages non lus pour ${item.name}`);
                  }

                  // Dans tous les cas, sélectionner l'utilisateur ou le groupe
                  onSelectUser({ id: item.id, name: item.name, type: item.type });
                }}
              />
            ))}
            {!loading && mergedList.length === 0 && (
              <Text align="center" color="dimmed" mt="md">
                Vous n’avez encore discuté avec aucun utilisateur.
              </Text>
            )}
          </>
        )}
      </ScrollArea>


      <Modal opened={modalOpened} onClose={() => setModalOpened(false)} title="Créer un groupe">
        <TextInput
          label="Nom du groupe"
          value={groupName}
          onChange={(e) => setGroupName(e.currentTarget.value)}
          mb="sm"
        />
        {allKeycloakUsers.filter((u) => u.postgresId != null).map((u) => {
          const userIdStr = String(u.postgresId);
          return (
            <Checkbox
              key={`checkbox-${userIdStr}`}
              label={`${u.firstName} ${u.lastName}`}
              checked={selectedUsers.includes(userIdStr)}
              onChange={() => toggleSelected(userIdStr)}
              mb={4}
            />
          );
        })}
        <Button fullWidth mt="md" onClick={handleCreateGroup}>Créer</Button>
      </Modal>
    </Stack>
  );
}