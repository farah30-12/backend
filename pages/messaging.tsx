import React, { useState } from 'react';
import { Text, Group, Title, Box, Container } from '@mantine/core';
import ConversationList from 'src/components/ConversationList';
import ChatWindow from 'src/components/ChatWindow';
import { IconMessageCircle } from '@tabler/icons-react';

// Utiliser la même interface ChatTarget que dans ConversationList.tsx
interface ChatTarget {
  id: string;
  name: string;
  type: "user" | "group";
}

export default function Messaging() {
  const [selectedUser, setSelectedUser] = useState<ChatTarget | null>(null);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100%',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#4299E1',
        padding: '15px 20px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        zIndex: 10
      }}>
        <Group position="apart">
          <Group>
            <IconMessageCircle size={28} color="white" />
            <Title order={3} style={{ color: 'white', fontFamily: 'Poppins, sans-serif' }}>
              Messagerie
            </Title>
          </Group>
          <Box>
            <Text size="sm" color="white" weight={500}>
              {selectedUser ? `Discussion avec ${selectedUser.name}` : 'Sélectionnez une conversation'}
            </Text>
          </Box>
        </Group>
      </div>

      {/* Main content */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%)'
      }}>
        {/* Sidebar */}
        <div style={{
          width: '300px',
          backgroundColor: 'white',
          borderRight: '1px solid #e9ecef',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)',
          overflow: 'auto'
        }}>
          <ConversationList onSelectUser={setSelectedUser} />
        </div>

        {/* Chat area */}
        <div style={{
          flex: 1,
          padding: '10px',
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <Container size="xl" style={{ width: '100%', padding: 0 }}>
            <ChatWindow selectedUser={selectedUser} />
          </Container>
        </div>
      </div>
    </div>
  );
}
