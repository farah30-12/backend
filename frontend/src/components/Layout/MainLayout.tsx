import React from 'react';
import { useRouter } from 'next/router';
import {
  AppShell,
  Navbar,
  Header,
  Group,
  Title,
  Divider,
  UnstyledButton,
  Text,
  Box,
  ActionIcon,
  Tooltip,
  Button,
} from '@mantine/core';
import {
  IconLogout,
  IconUserPlus,
  IconList,
  IconMessage,
  IconUsers,
  IconPlus,
  IconBell,
  IconDashboard,
  IconClipboardList,
} from '@tabler/icons-react';
import { useAuth } from 'src/context/AuthContext';

interface SidebarButtonProps {
  icon: React.FC<{ size: number }>;
  label: string;
  onClick: () => void;
  active?: boolean;
}

function SidebarButton({ icon: Icon, label, onClick, active = false }: SidebarButtonProps) {
  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 20px',
        borderRadius: '10px',
        color: '#2c3e50',
        backgroundColor: active ? '#e7f5ff' : '#f8fbff',
        transition: 'all 0.3s ease',
        marginBottom: '8px',
        width: '100%',
        boxShadow: active ? '0 4px 8px rgba(0, 0, 0, 0.05)' : 'none',
        transform: active ? 'translateY(-2px)' : 'none',
        border: active ? '1px solid #d0ebff' : '1px solid transparent',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = '#e7f5ff';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.05)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.border = '1px solid #d0ebff';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = '#f8fbff';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.border = '1px solid transparent';
        }
      }}
    >
      <div style={{ color: '#4dabf7' }}>
        <Icon size={24} />
      </div>
      <Text size="md" weight={600} style={{ color: '#2c3e50' }}>
        {label}
      </Text>
    </UnstyledButton>
  );
}

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { keycloak, isAuthenticated, login, logout } = useAuth();
  const router = useRouter();
  const currentPath = router.pathname;

  const isAdmin = keycloak?.tokenParsed?.realm_access?.roles?.includes('admin') || false;
  const isUser = keycloak?.tokenParsed?.realm_access?.roles?.includes('user') || false;

  const handleAddUserClick = () => router.push('/AddUserForm');
  const handleUserListClick = () => router.push('/userlist');
  const handleMessagingClick = () => router.push('/messaging');
  const handleProjectsClick = () => router.push('/projects');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        height: '60px',
        background: 'linear-gradient(135deg, #e7f5ff 0%, #d0ebff 100%)',
        color: '#2c3e50',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 16px',
        borderBottom: '1px solid #a5d8ff',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
      }}>
        <div />
        <Group>
          {isAuthenticated && (
            <>
              <Tooltip label="Notifications">
                <ActionIcon variant="light" size="lg" color="blue">
                  <IconBell size={20} />
                </ActionIcon>
              </Tooltip>
              <Button
                variant="gradient"
                gradient={{ from: "#74c0fc", to: "#4dabf7", deg: 45 }}
                style={{
                  boxShadow: '0 4px 14px rgba(77, 171, 247, 0.3)',
                  transition: 'all 0.3s ease',
                  color: 'white'
                }}
                onClick={logout}
              >
                <IconLogout size={20} />
              </Button>
            </>
          )}
        </Group>
      </div>

      {/* Main content area with sidebar and content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{
          width: '260px',
          background: 'linear-gradient(180deg, #f8fbff 0%, #e7f5ff 100%)',
          color: '#2c3e50',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '2px 0 10px rgba(0, 0, 0, 0.05)',
          borderRight: '1px solid #d0ebff'
        }}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Title order={2} style={{
              color: '#4dabf7',
              fontWeight: 800
            }}>
              Qu²Data
            </Title>
            <Divider
              color="#d0ebff"
              my="sm"
              style={{ width: '80%', margin: '10px auto' }}
            />
          </div>

          {isAuthenticated && (
            <div style={{ flex: 1 }}>
              {isAdmin && (
                <Box>
                  <SidebarButton
                    icon={IconUserPlus}
                    label="Ajouter un Utilisateur"
                    onClick={handleAddUserClick}
                    active={currentPath === '/AddUserForm'}
                  />
                  <SidebarButton
                    icon={IconUsers}
                    label="Liste des Utilisateurs"
                    onClick={handleUserListClick}
                    active={currentPath === '/userlist'}
                  />
                </Box>
              )}
              {(isAdmin || isUser) && (
                <Box>
                  <SidebarButton
                    icon={IconMessage}
                    label="Messagerie"
                    onClick={handleMessagingClick}
                    active={currentPath === '/messaging'}
                  />
                  <SidebarButton
                    icon={IconUsers}
                    label="Prospects"
                    onClick={() => router.push('/crm/List')}
                    active={currentPath.startsWith('/crm/List') || currentPath.startsWith('/crm/prospects')}
                  />
                  <SidebarButton
                    icon={IconList}
                    label="Actions"
                    onClick={() => router.push('/crm/actions')}
                    active={currentPath.startsWith('/crm/actions')}
                  />
                  <SidebarButton
                    icon={IconUserPlus}
                    label="Clients"
                    onClick={() => router.push('/crm/clients')}
                    active={currentPath.startsWith('/crm/clients')}
                  />
                  {/* Dashboard - Accessible uniquement aux administrateurs */}
                  {isAdmin && (
                    <SidebarButton
                      icon={IconDashboard}
                      label="Dashboard"
                      onClick={() => router.push('/crm/dashboard')}
                      active={currentPath.startsWith('/crm/dashboard')}
                    />
                  )}
                  <SidebarButton
                    icon={IconClipboardList}
                    label="Projets"
                    onClick={handleProjectsClick}
                    active={currentPath === '/projects'}
                  />

                </Box>
              )}
            </div>
          )}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
