// ✅ ChatInput.tsx
/*import React, { useState } from "react";
import { Group, TextInput, Button, FileButton } from "@mantine/core";
import { IconSend, IconFileUpload } from "@tabler/icons-react";

interface ChatTarget {
  id: number; // ← maintenant c’est l’ID PostgreSQL
  name: string;
  type: "user" | "group";
}

interface ChatInputProps {
  currentUserId: number;
  chatTarget: ChatTarget;
  authHeader: () => { Authorization: string };
  onMessageSent: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ currentUserId, chatTarget, authHeader, onMessageSent }) => {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim() && !file) return;

    const formData = new FormData();
    formData.append("content", message);
    formData.append("sentById", String(currentUserId));
    if (file) formData.append("file", file);

    const url =
      chatTarget.type === "group"
        ? `http://localhost:8081/api/messages/group`
        : `http://localhost:8081/api/messages`;

    if (chatTarget.type === "group") {
      formData.append("groupId", String(chatTarget.id));
    } else {
      formData.append("receivedById", String(chatTarget.id));
    }

    try {
      setLoading(true);
      const res = await fetch(url, {
        method: "POST",
        headers: authHeader(), // ← important pour Keycloak
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Erreur envoi:", text);
        throw new Error(text);
      }

      setMessage("");
      setFile(null);
      onMessageSent(); // 🔁 mise à jour des messages
    } catch (err) {
      console.error("Erreur envoi:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Group spacing="xs" mt="md">
      <TextInput
        placeholder="Écrire un message..."
        value={message}
        onChange={(e) => setMessage(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSend();
        }}
        style={{ flexGrow: 1 }}
      />

      <FileButton onChange={setFile} accept="*">
        {(props) => (
          <Button {...props} variant="outline" leftIcon={<IconFileUpload />}>
            Fichier
          </Button>
        )}
      </FileButton>

      <Button onClick={handleSend} loading={loading} leftIcon={<IconSend />}>
        Envoyer
      </Button>
    </Group>
  );
};

export default ChatInput;
*/