import React, { useState, useEffect } from "react";
import {
  ScrollArea,
  TextInput,
  Button,
  Group,
  Card,
  Text,
  Paper,
  FileButton,
  Title,
} from "@mantine/core";
import { IconSend, IconFileUpload } from "@tabler/icons-react";
import { useAuth } from "src/context/AuthContext";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

interface ChatTarget {
  id: string;
  name: string;
  type: "user";
}

interface ChatWindowProps {
  selectedUser: ChatTarget | null;
}

export default function ChatWindow({ selectedUser }: ChatWindowProps) {
  const { keycloak, authHeader } = useAuth();
  const keycloakId = keycloak?.tokenParsed?.sub;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>("");

  useEffect(() => {
    if (!keycloakId) return;

    fetch(`http://localhost:8081/test/keycloak/user/by-keycloak/${keycloakId}`, {
      headers: authHeader(),
    })
      .then((res) => res.json())
      .then((data) => {
        setCurrentUserId(data.id);
        setCurrentUsername(data.username || data.firstName || "Moi");
      })
      .catch((err) => console.error("❌ Erreur chargement utilisateur:", err));
  }, [keycloakId]);

  useEffect(() => {
    if (!selectedUser || !currentUserId) return;

    fetch(
      `http://localhost:8081/api/messages?user1=${currentUserId}&user2=${selectedUser.id}`,
      { headers: authHeader() }
    )
      .then((res) => res.json())
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch((err) => console.error("❌ Erreur chargement messages:", err));
  }, [selectedUser, currentUserId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !currentUserId) return;

    const messageData = {
      content: newMessage,
      sentById: currentUserId,
      receivedById: selectedUser.id,
    };

    const res = await fetch("http://localhost:8081/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
      },
      body: JSON.stringify(messageData),
    });

    if (res.ok) {
      const savedMessage = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: savedMessage.id,
          sender: currentUsername,
          text: savedMessage.content,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      setNewMessage("");
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    const res = await fetch(`http://localhost:8081/api/messages/${messageId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
      },
      body: JSON.stringify({ content: newContent }),
    });

    if (res.ok) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, text: newContent } : msg
        )
      );
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    const res = await fetch(`http://localhost:8081/api/messages/${messageId}`, {
      method: "DELETE",
      headers: authHeader(),
    });

    if (res.ok) {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    }
  };

  return (
    <Paper shadow="md" p="lg" radius="lg" style={{ height: "75vh", display: "flex", flexDirection: "column", backgroundColor: "#f9fafb" }}>
      {selectedUser && <Title order={4} mb="sm">💬 {selectedUser.name}</Title>}

      <ScrollArea style={{ flexGrow: 1, marginBottom: 16, padding: "0 16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {messages.map((message) => (
            <div key={message.id} style={{ display: "flex", justifyContent: message.sender === currentUsername ? "flex-end" : "flex-start" }}>
              <Card shadow="sm" radius="md" p="md" style={{ maxWidth: "60%", backgroundColor: message.sender === currentUsername ? "#007bff" : "#e9ecef", color: message.sender === currentUsername ? "white" : "black", borderRadius: message.sender === currentUsername ? "20px 20px 0px 20px" : "20px 20px 20px 0px" }}>
                <Text size="sm" weight={500}>{message.sender}</Text>
                <Text>{message.text}</Text>
                <Text size="xs" color="gray" align="right" mt={4}>{message.timestamp}</Text>
                {message.sender === currentUsername && (
                  <Group spacing={4} position="right" mt="xs">
                    <Button size="xs" color="yellow" onClick={() => { const newText = prompt("✏️ Nouveau message :", message.text); if (newText) handleEditMessage(message.id, newText); }}>Modifier</Button>
                    <Button size="xs" color="red" onClick={() => handleDeleteMessage(message.id)}>Supprimer</Button>
                  </Group>
                )}
              </Card>
            </div>
          ))}
        </div>
      </ScrollArea>

      <Group spacing="xs" position="center">
        <TextInput placeholder="Écrire un message..." value={newMessage} onChange={(e) => setNewMessage(e.currentTarget.value)} style={{ flexGrow: 1 }} />
        <FileButton onChange={() => {}} accept="*">
          {(props) => <Button {...props} leftIcon={<IconFileUpload size={18} />} variant="outline" color="gray">Fichier</Button>}
        </FileButton>
        <Button leftIcon={<IconSend size={18} />} onClick={handleSendMessage} variant="gradient" gradient={{ from: "teal", to: "blue", deg: 60 }}>Envoyer</Button>
      </Group>
    </Paper>
  );
}