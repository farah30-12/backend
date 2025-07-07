// ✅ ChatWindow.tsx (version finale avec notifications intégrées)
import React, { useState, useEffect, useRef } from "react";
import {
  ScrollArea,
  TextInput,
  Button,
  Group,
  Card,
  Text,
  Paper,
  Title,
  Loader,

  Modal,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconSend,
  IconTrash,
  IconUsers,
  IconFileUpload,
} from "@tabler/icons-react";
import { useAuth } from "src/context/AuthContext";
import GroupDetails from "./GroupDetails";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

interface RawApiMessage {
  id: number;
  content: string;
  timestamp: string;
  senderId?: number;
  firstName?: string;
  lastName?: string;
  sentBy?: {
    id: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    idKeycloak?: string;
  } | null;
  receivedBy?: { id: number } | null;
}

interface Message {
  id: string;
  sender: string;
  senderFullName?: string; // Prénom et nom de l'expéditeur pour les conversations de groupe
  text: string;
  timestamp: string;
  canDelete: boolean;
}

interface ChatTarget {
  id: string;
  name: string;
  type: "user" | "group";
}

interface ChatWindowProps {
  selectedUser: ChatTarget | null;
  refreshConversationList?: () => void;
}

export default function ChatWindow({ selectedUser, refreshConversationList }: ChatWindowProps) {
  const { keycloak, authHeader } = useAuth();
  const keycloakId = keycloak?.tokenParsed?.sub;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>("Moi");
  const [receiverPostgresId, setReceiverPostgresId] = useState<number | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [groupModalOpened, setGroupModalOpened] = useState(false);

  const viewport = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: "smooth" });
  };

  // Cache pour stocker les ID postgres déjà récupérés
  const [postgresIdCache, setPostgresIdCache] = useState<Record<string, number>>({});

  const getPostgresId = async (keycloakId: string): Promise<number | null> => {
    // Vérifier si l'ID est déjà dans le cache
    if (postgresIdCache[keycloakId]) {
      console.log(`✅ ID postgres trouvé dans le cache pour ${keycloakId}: ${postgresIdCache[keycloakId]}`);
      return postgresIdCache[keycloakId];
    }

    try {
      console.log(`🔍 Récupération de l'ID postgres pour ${keycloakId}...`);
      const res = await fetch(`http://localhost:8081/test/keycloak/user/by-keycloak/${keycloakId}`, {
        headers: authHeader(),
      });
      if (!res.ok) throw new Error("Utilisateur introuvable");
      const data = await res.json();

      // Mettre à jour le cache
      setPostgresIdCache(prev => ({ ...prev, [keycloakId]: data.id }));

      // Nous n'avons plus besoin de mettre à jour le cache des informations utilisateur

      console.log(`✅ ID postgres récupéré pour ${keycloakId}: ${data.id}`);
      return data.id;
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération de l'ID postgres pour ${keycloakId}:`, error);
      return null;
    }
  };



  useEffect(() => {
    if (!keycloakId) return;

    const loadCurrentUser = async () => {
      try {
        console.log(`🔍 Chargement des informations de l'utilisateur courant (${keycloakId})...`);
        const startTime = performance.now();

        const res = await fetch(`http://localhost:8081/test/keycloak/user/by-keycloak/${keycloakId}`, {
          headers: authHeader(),
        });

        if (!res.ok) throw new Error("Utilisateur connecté non trouvé");
        const data = await res.json();

        setCurrentUserId(data.id);
        setCurrentUsername(data.username || data.firstName || "Moi");

        // Mettre à jour le cache des ID postgres
        setPostgresIdCache(prev => ({ ...prev, [keycloakId]: data.id }));

        const endTime = performance.now();
        console.log(`✅ Informations utilisateur chargées en ${(endTime - startTime).toFixed(2)}ms`);
      } catch (err: any) {
        console.error(`❌ Erreur chargement utilisateur:`, err);
        setError(`Erreur chargement utilisateur: ${err.message}`);
      }
    };

    loadCurrentUser();
  }, [keycloakId, authHeader]);

  useEffect(() => {
    if (!selectedUser || !currentUserId) return;

    const fetchMessages = async () => {
      setMessages([]);
      setIsLoadingMessages(true);
      setNewMessage("");
      setFile(null);

      try {
        // Marquer les messages comme lus lorsqu'on ouvre la conversation
        if (selectedUser.type === "user") {
          console.log(`🔍 Marquage des messages comme lus pour la conversation avec ${selectedUser.name}`);

          // Utiliser l'URL correcte pour marquer les messages comme lus
          console.log(`🔍 Récupération de l'ID postgres et chargement des messages pour ${selectedUser.name}...`);

          // Récupérer l'ID postgres
          const targetId = await getPostgresId(selectedUser.id);
          if (!targetId) throw new Error("ID utilisateur introuvable");

          setReceiverPostgresId(targetId);

          // Exécuter les deux appels API en parallèle pour gagner du temps
          const markAsSeenUrl = `http://localhost:8081/api/messages/mark-as-seen?currentUserId=${currentUserId}&otherUserId=${targetId}`;
          const messagesUrl = `http://localhost:8081/api/messages/between-users?user1=${currentUserId}&user2=${targetId}`;

          console.log(`🔍 Appels API parallèles:
          1. ${markAsSeenUrl}
          2. ${messagesUrl}`);

          const [markReadResponse, messagesResponse] = await Promise.all([
            fetch(markAsSeenUrl, { method: "PUT", headers: authHeader() }),
            fetch(messagesUrl, { headers: authHeader() })
          ]);

          // Traiter la réponse de mark-as-seen
          if (markReadResponse.ok) {
            console.log(`✅ Messages marqués comme lus pour ${selectedUser.name} (statut: ${markReadResponse.status})`);
            // Rafraîchir la liste des conversations pour mettre à jour les compteurs
            window.dispatchEvent(new Event("refreshConversations"));
          } else {
            console.error(`❌ Erreur lors du marquage des messages comme lus pour ${selectedUser.name} (statut: ${markReadResponse.status})`);
            const errorText = await markReadResponse.text();
            console.error(`Détails de l'erreur: ${errorText}`);
          }

          // Traiter la réponse des messages
          if (!messagesResponse.ok) {
            throw new Error(`Erreur lors du chargement des messages: ${messagesResponse.status}`);
          }

          const raw: RawApiMessage[] = await messagesResponse.json();

          const formatted = raw.map((m) => ({
            id: String(m.id),
            sender: m.sentBy?.id === currentUserId ? currentUsername : selectedUser.name,
            text: m.content,
            timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            canDelete: m.sentBy?.id === currentUserId,
          }));
          setMessages(formatted);
        } else if (selectedUser.type === "group") {
          // Marquer les messages du groupe comme lus
          console.log(`🔍 Marquage des messages comme lus pour le groupe ${selectedUser.name}`);

          // Exécuter les deux appels API en parallèle pour gagner du temps
          const markAsReadUrl = `http://localhost:8081/api/messages/mark-read/group?currentUserId=${currentUserId}&groupId=${selectedUser.id}`;
          const messagesUrl = `http://localhost:8081/api/messages/group/${selectedUser.id}`;

          console.log(`🔍 Appels API parallèles pour le groupe:
          1. ${markAsReadUrl}
          2. ${messagesUrl}`);

          const [markReadResponse, messagesResponse] = await Promise.all([
            fetch(markAsReadUrl, { method: "PUT", headers: authHeader() }),
            fetch(messagesUrl, { headers: authHeader() })
          ]);

          // Traiter la réponse de mark-read-group
          if (markReadResponse.ok) {
            console.log(`✅ Messages du groupe marqués comme lus pour ${selectedUser.name} (statut: ${markReadResponse.status})`);
            // Rafraîchir la liste des conversations pour mettre à jour les compteurs
            window.dispatchEvent(new Event("refreshConversations"));
          } else {
            console.error(`❌ Erreur lors du marquage des messages du groupe comme lus pour ${selectedUser.name} (statut: ${markReadResponse.status})`);
            const errorText = await markReadResponse.text();
            console.error(`Détails de l'erreur: ${errorText}`);
          }

          // Traiter la réponse des messages
          if (!messagesResponse.ok) {
            throw new Error(`Erreur lors du chargement des messages du groupe: ${messagesResponse.status}`);
          }

          const raw: RawApiMessage[] = await messagesResponse.json();

          // Afficher la structure des données reçues pour le débogage
          console.log("📊 Données brutes des messages de groupe:", JSON.stringify(raw, null, 2));

          // Vérifier si les messages contiennent les informations de l'expéditeur
          if (raw.length > 0) {
            console.log("📊 Structure du premier message:", JSON.stringify(raw[0], null, 2));
            console.log("📊 Structure de sentBy:", JSON.stringify(raw[0].sentBy, null, 2));

            // Vérifier tous les champs disponibles dans sentBy
            const sentBy = raw[0].sentBy;
            if (sentBy) {
              console.log("📊 Champs disponibles dans sentBy:");
              Object.keys(sentBy).forEach(key => {
                console.log(`   - ${key}: ${JSON.stringify(sentBy[key])}`);
              });
            }
          }

          // Tester les API disponibles
          console.log("🔍 Test des API disponibles...");

          // Tester l'API de récupération des utilisateurs
          fetch(`http://localhost:8081/test/keycloak/all-users`, {
            headers: authHeader(),
          })
          .then(res => {
            console.log(`📊 API all-users status: ${res.status}`);
            if (res.ok) return res.json();
            throw new Error("API all-users non disponible");
          })
          .then(data => {
            console.log("📊 API all-users response:", data);
          })
          .catch(error => {
            console.error("❌ Erreur API all-users:", error);
          });

          // Tester l'API de récupération des utilisateurs Keycloak
          fetch(`http://localhost:8081/test/keycloak/all-keycloak-users`, {
            headers: authHeader(),
          })
          .then(res => {
            console.log(`📊 API all-keycloak-users status: ${res.status}`);
            if (res.ok) return res.json();
            throw new Error("API all-keycloak-users non disponible");
          })
          .then(data => {
            console.log("📊 API all-keycloak-users response:", data);
          })
          .catch(error => {
            console.error("❌ Erreur API all-keycloak-users:", error);
          });

          // Tester l'API de récupération des utilisateurs avec détails
          fetch(`http://localhost:8081/test/users`, {
            headers: authHeader(),
          })
          .then(res => {
            console.log(`📊 API users status: ${res.status}`);
            if (res.ok) return res.json();
            console.log("➡️ Statut de la réponse :", res.status);
            throw new Error("API users non disponible");
          })
          .then(data => {
            console.log("📊 API users response:", data);
          })
          .catch(error => {
            console.error("❌ Erreur API users:", error);
          });

          // Nous n'avons plus besoin de récupérer les informations des utilisateurs
          // car nous utilisons directement le nom d'utilisateur comme nom complet
          console.log("📊 Utilisation directe des noms d'utilisateur pour les messages");

          const formatted = raw.map((m) => {
            // Vérifier si le message est envoyé par l'utilisateur courant
            // Soit en comparant l'ID dans sentBy, soit en comparant senderId
            const isMine = (m.sentBy?.id === currentUserId) || (m.senderId === currentUserId);

            // Déterminer le nom de l'expéditeur
            const senderName = isMine ? currentUsername : m.sentBy?.username || "Membre";

            // Utiliser firstName et lastName s'ils sont disponibles directement dans le message
            // Sinon, essayer de les récupérer depuis sentBy
            let senderFullName = "";
            if (m.firstName && m.lastName) {
              senderFullName = `${m.firstName} ${m.lastName}`;
              console.log(`📊 Message ${m.id} - Nom complet trouvé directement dans le message: ${senderFullName}`);
            } else if (m.sentBy?.firstName && m.sentBy?.lastName) {
              senderFullName = `${m.sentBy.firstName} ${m.sentBy.lastName}`;
              console.log(`📊 Message ${m.id} - Nom complet trouvé dans sentBy: ${senderFullName}`);
            } else {
              senderFullName = senderName;
              console.log(`📊 Message ${m.id} - Utilisation du nom d'utilisateur par défaut: ${senderFullName}`);
            }

            return {
              id: String(m.id),
              sender: senderName,
              senderFullName: senderFullName,
              text: m.content,
              timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              canDelete: isMine,
            };
          });
          setMessages(formatted);
        }
        setTimeout(scrollToBottom, 100);
      } catch (err: any) {
        setError(`Erreur chargement messages: ${err.message}`);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedUser, currentUserId, authHeader]);

  useEffect(() => {
    if (!selectedUser || !currentUserId) return;

    const socket = new SockJS("http://localhost:8081/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("✅ WebSocket connecté pour l'utilisateur", currentUserId);

        // Subscribe to personal notifications for all messages
        client.subscribe(`/topic/user/${currentUserId}`, (msg) => {
          try {
            console.log("📩 Message WebSocket reçu:", msg.body);
            const body = JSON.parse(msg.body);

            // Afficher une notification uniquement pour les messages reçus d'autres utilisateurs
            if (body.sentBy && body.sentBy.id !== currentUserId) {
              // C'est un message d'un autre utilisateur
              notifications.show({
                title: `📩 Nouveau message reçu`,
                message: body.content || "Nouveau message",
                color: "blue",
              });

              console.log("🔔 Notification affichée pour le message reçu");

              // Rafraîchir la liste des conversations pour mettre à jour les compteurs
              // uniquement pour les messages reçus d'autres utilisateurs
              window.dispatchEvent(new Event("refreshConversations"));

              // Mettre à jour les messages si on est dans la conversation avec cet utilisateur
              if (selectedUser.type === "user") {
                setMessages((prev) => [
                  ...prev,
                  {
                    id: String(body.id),
                    sender: selectedUser.name,
                    text: body.content,
                    timestamp: new Date(body.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                    canDelete: false,
                  },
                ]);
                scrollToBottom();
              }
            }
          } catch (error) {
            console.error("❌ Erreur traitement message WebSocket:", error);
          }
        });

        // Subscribe to group messages if in a group chat
        if (selectedUser.type === "group") {
          client.subscribe(`/topic/group/${selectedUser.id}`, (msg) => {
            try {
              console.log("👥 Message groupe WebSocket reçu:", msg.body);
              const body = JSON.parse(msg.body);

              if (body.sentBy?.id !== currentUserId) {
                // Notification pour message de groupe
                notifications.show({
                  title: `💬 Message groupe de ${body.sentBy?.username || "Membre"}`,
                  message: body.content || "Nouveau message dans le groupe",
                  color: "green",
                });

                console.log("🔔 Notification affichée pour le message de groupe");

                // Rafraîchir la liste des conversations pour mettre à jour les compteurs
                // uniquement pour les messages reçus d'autres utilisateurs
                window.dispatchEvent(new Event("refreshConversations"));

                // Afficher la structure des données reçues pour le débogage
                console.log("📊 Message WebSocket reçu:", JSON.stringify(body, null, 2));
                console.log("📊 Structure de sentBy:", JSON.stringify(body.sentBy, null, 2));

                // Utiliser firstName et lastName s'ils sont disponibles directement dans le message
                // Sinon, essayer de les récupérer depuis sentBy
                let senderFullName = "";
                if (body.firstName && body.lastName) {
                  senderFullName = `${body.firstName} ${body.lastName}`;
                  console.log("📊 Nom complet trouvé directement dans le message WebSocket:", senderFullName);
                } else if (body.sentBy?.firstName && body.sentBy?.lastName) {
                  senderFullName = `${body.sentBy.firstName} ${body.sentBy.lastName}`;
                  console.log("📊 Nom complet trouvé dans sentBy du message WebSocket:", senderFullName);
                } else {
                  senderFullName = body.sentBy?.username || "Membre";
                  console.log("📊 Utilisation du nom d'utilisateur par défaut pour le message WebSocket:", senderFullName);
                }

                console.log("📊 Expéditeur final du message WebSocket:", senderFullName);

                setMessages((prev) => [
                  ...prev,
                  {
                    id: String(body.id),
                    sender: body.sentBy?.username || "Membre",
                    senderFullName: senderFullName,
                    text: body.content,
                    timestamp: new Date(body.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                    canDelete: false,
                  },
                ]);
                scrollToBottom();
              }
            } catch (error) {
              console.error("❌ Erreur traitement message groupe WebSocket:", error);
            }
          });
        }
      },
      onStompError: (frame) => {
        console.error("❌ Erreur STOMP :", frame);
      },
    });

    client.activate();
    return () => {
      client.deactivate();
    };
  }, [selectedUser, currentUserId]);


  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !file) || !currentUserId || !selectedUser) return;
    setIsSending(true);
    try {
      // La notification d'envoi a été supprimée à la demande de l'utilisateur

      // Préparer le contenu du message
      let messageContent = newMessage.trim();

      // Si un fichier est sélectionné, le convertir en base64 et l'ajouter au contenu
      if (file) {
        try {
          const base64 = await fileToBase64(file);
          // Format: FILE_NAME:nom_du_fichier|contenu_base64
          messageContent = `FILE_NAME:${file.name}|${base64}`;
          console.log("📊 Fichier converti en base64");
        } catch (fileError) {
          console.error("❌ Erreur lors de la conversion du fichier en base64:", fileError);
          notifications.show({
            title: "Erreur fichier",
            message: "Impossible de traiter le fichier. Veuillez réessayer.",
            color: "red"
          });
          setIsSending(false);
          return;
        }
      }

      let res: Response;
      const formData = new FormData();
      formData.append("content", messageContent);
      formData.append("sentById", currentUserId.toString());
      if (selectedUser.type === "group") {
        formData.append("groupId", selectedUser.id);
        // Ne pas ajouter le fichier au formData car il est déjà dans le contenu
        res = await fetch("http://localhost:8081/api/messages/group", {
          method: "POST",
          headers: authHeader(),
          body: formData,
        });
      } else {
        if (!receiverPostgresId) throw new Error("Receiver ID manquant");
        formData.append("receivedById", receiverPostgresId.toString());
        // Ne pas ajouter le fichier au formData car il est déjà dans le contenu
        res = await fetch("http://localhost:8081/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeader(),
          },
          body: JSON.stringify({
            sentById: currentUserId,
            receivedById: receiverPostgresId,
            content: messageContent,
          }),
        });

      }

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Échec envoi message: ${msg}`);
      }

      const saved = await res.json();
      // Afficher la structure des données reçues pour le débogage
      console.log("📊 Message envoyé (réponse):", JSON.stringify(saved, null, 2));

      // Ajouter le message à la liste des messages
      setMessages((prev) => [...prev, {
        id: String(saved.id),
        sender: currentUsername,
        senderFullName: "", // Pas besoin d'afficher notre propre nom
        text: saved.content,
        timestamp: new Date(saved.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        canDelete: true,
      }]);

      // La notification de confirmation a été supprimée à la demande de l'utilisateur

      setNewMessage("");
      setFile(null);
      setTimeout(scrollToBottom, 100);

      // Ne pas rafraîchir les compteurs de messages non lus après l'envoi d'un message
      // car l'expéditeur ne doit pas voir de notification pour ses propres messages
      if (refreshConversationList) refreshConversationList();
    } catch (err: any) {
      notifications.show({ title: "Erreur", message: err.message, color: "red" });
    } finally {
      setIsSending(false);
    }
  };

  // Fonction pour convertir un fichier en base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // La fonction isBase64File a été supprimée car elle n'était pas utilisée

  // Fonction pour extraire le type MIME d'un fichier base64
  const getMimeType = (base64: string): string => {
    const match = base64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
    return match ? match[1] : "";
  };

  // Fonction pour extraire le nom du fichier d'un message
  const getFileName = (text: string): string => {
    const match = text.match(/^FILE_NAME:([^|]+)\|/);
    return match ? match[1] : "fichier";
  };

  // Fonction pour extraire le contenu base64 d'un message
  const getFileContent = (text: string): string => {
    const match = text.match(/\|(.+)$/);
    return match ? match[1] : text;
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const res = await fetch(`http://localhost:8081/api/messages/delete-message/${messageId}`, {
        method: "PUT",
        headers: authHeader(),
      });
      if (!res.ok) throw new Error("Erreur suppression message");
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, text: "Message supprimé" } : msg))
      );
      notifications.show({ title: "Message supprimé", message: "Message bien supprimé ", color: "orange" });
    } catch (err: any) {
      notifications.show({ title: "Erreur suppression", message: err.message, color: "red" });
    }
  };

  return (
    <Paper
      shadow="md"
      p="lg"
      radius="lg"
      style={{
        height: "calc(100vh - 120px)",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f0fdfa",
        borderRadius: "1rem",
        width: "100%",
        margin: "0 auto",
        maxWidth: "100%"
      }}>
      {!selectedUser ? (
        <Text align="center" color="dimmed" style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          Sélectionnez une conversation pour commencer.
        </Text>
      ) : (
        <>
          <Group position="apart" mb="sm">
            <Title order={4} style={{ color: "#007074" }}>💬 {selectedUser.name}</Title>
            {selectedUser.type === "group" && (
              <Button size="xs" variant="light" styles={{ root: { backgroundColor: "#007074", color: "white" } }} leftIcon={<IconUsers size={16} />} onClick={() => setGroupModalOpened(true)}>
                Membres
              </Button>
            )}
          </Group>

          {error && <Text color="red" size="sm">{error}</Text>}

          <ScrollArea viewportRef={viewport} style={{ flexGrow: 1, marginBottom: 16 }}>
            {isLoadingMessages ? (
              <Group position="center" py="xl">
                <div style={{ textAlign: 'center' }}>
                  <Loader color="#007074" size="lg" />
                  <Text color="dimmed" mt={10}>Chargement des messages...</Text>
                </div>
              </Group>
            ) : (
              messages.map((msg) => {
                const isMine = msg.sender === currentUsername;
                const isHovered = hoveredMessageId === msg.id;

                return (
                  <Group
                    key={msg.id}
                    position={isMine ? "right" : "left"}
                    onMouseEnter={() => setHoveredMessageId(msg.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}>
                    <Card
                      radius="xl"
                      shadow="sm"
                      style={{ maxWidth: "60%", background: isMine ? "#c4f1f9" : "#e0f2f1", color: "#1f2937", borderRadius: "1rem", padding: "0.75rem", position: "relative" }}>
                      {!isMine && selectedUser?.type === "group" && (
                        <Text size="sm" weight={700} color="#007074" mb={6} style={{ borderBottom: '1px solid #e0f2f1', paddingBottom: '4px' }}>
                          {msg.senderFullName || msg.sender}
                        </Text>
                      )}

                      {/* Vérifier si le message contient un fichier */}
                      {msg.text.startsWith("FILE_NAME:") ? (
                        <div>
                          <Text mb={8}>
                            <strong>📎 Pièce jointe:</strong> {getFileName(msg.text)}
                          </Text>
                          {(() => {
                            const fileContent = getFileContent(msg.text);
                            const mimeType = getMimeType(fileContent);

                            // Afficher différemment selon le type de fichier
                            if (mimeType.startsWith("image/")) {
                              // Image
                              return (
                                <div style={{ maxWidth: "100%", marginBottom: 8 }}>
                                  <img
                                    src={fileContent}
                                    alt={getFileName(msg.text)}
                                    style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "8px" }}
                                  />
                                </div>
                              );
                            } else if (mimeType.startsWith("video/")) {
                              // Vidéo
                              return (
                                <div style={{ maxWidth: "100%", marginBottom: 8 }}>
                                  <video
                                    src={fileContent}
                                    controls
                                    style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "8px" }}
                                  />
                                </div>
                              );
                            } else if (mimeType.startsWith("audio/")) {
                              // Audio
                              return (
                                <div style={{ maxWidth: "100%", marginBottom: 8 }}>
                                  <audio
                                    src={fileContent}
                                    controls
                                    style={{ maxWidth: "100%" }}
                                  />
                                </div>
                              );
                            } else {
                              // Autres types de fichiers (PDF, documents, etc.)
                              return (
                                <Button
                                  component="a"
                                  href={fileContent}
                                  download={getFileName(msg.text)}
                                  variant="outline"
                                  size="sm"
                                  leftIcon={<IconFileUpload size={16} />}
                                  mb={8}
                                >
                                  Télécharger {getFileName(msg.text)}
                                </Button>
                              );
                            }
                          })()}
                        </div>
                      ) : (
                        <Text>{msg.text}</Text>
                      )}

                      <Text size="xs" color="dimmed" align="right">{msg.timestamp}</Text>
                      {msg.canDelete && msg.text !== "Message supprimé" && isHovered && (
                        <Button size="xs" variant="subtle" color="red" radius="xl" style={{ position: "absolute", top: 2, right: 2, backgroundColor: "#fff0f0" }} onClick={() => handleDeleteMessage(msg.id)}>
                          <IconTrash size={14} />
                        </Button>
                      )}
                    </Card>
                  </Group>
                );
              })
            )}
          </ScrollArea>

          <div>
            {file && (
              <Group spacing="xs" mb={8} p={8} style={{ backgroundColor: "#e0f7fa", borderRadius: "8px" }}>
                <Text size="sm">
                  <strong>📎 Fichier sélectionné:</strong> {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </Text>
                <Button
                  size="xs"
                  variant="subtle"
                  color="red"
                  onClick={() => setFile(null)}
                  style={{ marginLeft: "auto" }}
                >
                  Supprimer
                </Button>
              </Group>
            )}

            <Group spacing="xs">
              <TextInput
                radius="xl"
                style={{ flexGrow: 1 }}
                placeholder="Écrire un message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) handleSendMessage();
                }}
              />
              {/* Le bouton de pièce jointe a été supprimé */}
              <Button
                onClick={handleSendMessage}
                loading={isSending}
                radius="xl"
                styles={{ root: { backgroundColor: "#007074", color: "white" } }}
                leftIcon={<IconSend />}
              >
                Envoyer
              </Button>
            </Group>
          </div>

          <Modal opened={groupModalOpened} onClose={() => setGroupModalOpened(false)} title="Membres du groupe">
            {selectedUser?.type === "group" && <GroupDetails groupId={selectedUser.id} />}
          </Modal>
        </>
      )}
    </Paper>
  );
}