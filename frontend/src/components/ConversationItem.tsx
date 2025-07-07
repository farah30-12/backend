import React from "react";
import { Paper, Group, Text } from "@mantine/core";

interface Props {
  conversation: {
    id: string;
    name: string;
    lastMessage: string;
    lastMessageTime?: string;
    unread?: number;
    unreadByRecipient?: number;
    senderName: string;
  };
  onClick: () => void;
}

export default function ConversationItem({ conversation, onClick }: Props) {
  // Déterminer si nous avons des messages non lus (uniquement pour les messages reçus)
  const hasUnread = conversation.unread && conversation.unread > 0;
  // Déterminer si c'est un nouvel utilisateur (pas encore de conversation)
  const isNewUser = conversation.lastMessage === "Dernier message..." && !conversation.lastMessageTime;

  // Log pour déboguer
  console.log(`Conversation ${conversation.name}: unread=${conversation.unread}, isNewUser=${isNewUser}`);

  // Si nous avons des messages non lus, afficher un log plus détaillé
  if (hasUnread) {
    console.log(`🔴 ${conversation.name} a ${conversation.unread} message(s) non lu(s)`);
  }

  return (
    <Paper
      withBorder
      radius="xl"
      p="md"
      onClick={onClick}
      style={{
        cursor: "pointer",
        transition: "0.3s ease",
        position: "relative",
        backgroundColor: hasUnread ? "#f0f9ff" : isNewUser ? "#f9f0ff" : "#ffffff", // Fond selon le statut
        border: hasUnread ? "2px solid #1890ff" : isNewUser ? "1px dashed #722ed1" : "1px solid #e0e0e0", // Bordure selon le statut
        boxShadow: hasUnread ? "0 4px 12px rgba(24,144,255,0.2)" : isNewUser ? "0 4px 12px rgba(114,46,209,0.1)" : "0 4px 8px rgba(0,0,0,0.03)",
        overflow: "hidden", // ✅ éviter débordement
        marginBottom: "8px",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hasUnread ? "#e6f7ff" : isNewUser ? "#f0e6ff" : "#e6fffa")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = hasUnread ? "#f0f9ff" : isNewUser ? "#f9f0ff" : "#ffffff")}
    >
      <Group position="apart" noWrap>
        <div style={{ width: "calc(100% - 40px)" }}> {/* ✅ pour que le badge ne coupe pas le texte */}
          <Text size="sm" fw={hasUnread ? 700 : isNewUser ? 600 : 500} truncate style={{ color: hasUnread ? "#1890ff" : isNewUser ? "#722ed1" : "inherit" }}>
            {conversation.name}
            {hasUnread && <span style={{ color: "#ff4d4f", marginLeft: "5px" }}>•</span>}
            {isNewUser && <span style={{ color: "#722ed1", marginLeft: "5px", fontSize: "12px" }}>(nouveau)</span>}
          </Text>
          <Text size="xs" color={hasUnread ? "dark" : isNewUser ? "dimmed" : "gray"} truncate>
            <span style={{ color: hasUnread ? "#1890ff" : isNewUser ? "#722ed1" : "#007074", fontWeight: hasUnread ? 600 : isNewUser ? 500 : 400 }}>
              {conversation.senderName}
            </span>
            {isNewUser ? " - Démarrer une conversation" : `: ${conversation.lastMessage}`}
          </Text>
        </div>

        {/* Indicateur pour les messages non lus par moi */}
        {hasUnread && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "#ff4d4f",
              zIndex: 2,
              boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
              animation: "pulse 2s infinite",
            }}
            title={`${conversation.unread} nouveau(x) message(s) non lu(s)`}
          />
        )}


      </Group>
    </Paper>
  );
}
