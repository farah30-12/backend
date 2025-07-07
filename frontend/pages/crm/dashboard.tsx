import React, { useState } from 'react';
import {
  Container,
  Title,
  Paper,
  Group,
  Text,
  Tabs,
  Box,
  ThemeIcon,
  Button,
  Card,
  Loader,
  Avatar,
  useMantineTheme,
} from '@mantine/core';
import {
  IconChartBar,
  IconChartPie,
  IconChartLine,
  IconArrowLeft,
  IconRefresh,
  IconMaximize,
  IconMinimize,
} from '@tabler/icons-react';
import { useRouter } from 'next/router';
import withAuth from '../../src/helpers/HOC/withAuth';

// URLs des dashboards Power BI (à remplacer par vos URLs réelles)
const DASHBOARD_URLS = [
  'https://app.powerbi.com/view?r=eyJrIjoiYzdjOWVmOTQtYTZlYy00MzEwLThiZGItNWEzNDdkN2RmZTk1IiwidCI6IjE3YjNlZTEzLTY2NGYtNDJhNS1hZjRjLTI3OGE0ODg5ODJjZCJ9',
  'https://app.powerbi.com/view?r=eyJrIjoiMzcwZDllZDAtYzhlOS00MGZmLWFmNjQtM2M1ODhlODljMGI1IiwidCI6IjE3YjNlZTEzLTY2NGYtNDJhNS1hZjRjLTI3OGE0ODg5ODJjZCJ9',
  'https://app.powerbi.com/view?r=eyJrIjoiZGYyZDNjOTAtNzJlNy00MzZhLWJiNDYtMzUyZTBiZTMzMDA4IiwidCI6IjE3YjNlZTEzLTY2NGYtNDJhNS1hZjRjLTI3OGE0ODg5ODJjZCJ9',
];

// Titres et descriptions des dashboards
const DASHBOARD_INFO = [
  {
    title: 'Vue d\'ensemble',
    description: 'Aperçu global des performances commerciales',
    icon: <IconChartBar size={18} />,
    color: 'blue',
  },
  {
    title: 'Analyse des prospects',
    description: 'Statistiques détaillées sur les prospects et leur conversion',
    icon: <IconChartPie size={18} />,
    color: 'violet',
  },
  {
    title: 'Prévisions',
    description: 'Prévisions de vente et tendances futures',
    icon: <IconChartLine size={18} />,
    color: 'teal',
  },
];

function CRMDashboard() {
  const router = useRouter();
  const theme = useMantineTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState([true, true, true]);

  // Fonction pour marquer un dashboard comme chargé
  const handleIframeLoad = (index: number) => {
    const newLoadingState = [...isLoading];
    newLoadingState[index] = false;
    setIsLoading(newLoadingState);
  };

  // Fonction pour basculer en mode plein écran
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Fonction pour rafraîchir le dashboard actif
  const refreshDashboard = () => {
    const newLoadingState = [...isLoading];
    newLoadingState[activeTab] = true;
    setIsLoading(newLoadingState);

    // Recharger l'iframe
    const iframe = document.getElementById(`dashboard-iframe-${activeTab}`) as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  return (
    <Container fluid={isFullscreen} p={isFullscreen ? 0 : 'xl'} style={{
      maxWidth: isFullscreen ? '100%' : 1400,
      height: isFullscreen ? '100vh' : 'auto',
      transition: 'all 0.3s ease',
    }}>
      {!isFullscreen && (
        <>
          <Group position="apart" mb="md">
            <Group>
              <Button
                variant="light"
                color="blue"
                leftIcon={<IconArrowLeft size={16} />}
                onClick={() => router.push('/')}
                radius="xl"
                style={{ boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)' }}
              >
                Retour
              </Button>
              <Title order={2} style={{ color: '#3E5879', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                Tableau de bord CRM
              </Title>
            </Group>
            <Group>
              <Button
                variant="subtle"
                color="gray"
                leftIcon={<IconRefresh size={16} />}
                onClick={refreshDashboard}
                radius="xl"
                disabled={isLoading[activeTab]}
              >
                Actualiser
              </Button>
              <Button
                variant="subtle"
                color="blue"
                leftIcon={isFullscreen ? <IconMinimize size={16} /> : <IconMaximize size={16} />}
                onClick={toggleFullscreen}
                radius="xl"
              >
                {isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
              </Button>
            </Group>
          </Group>

          <Card shadow="sm" p="lg" radius="lg" withBorder mb="xl" style={{ backgroundColor: '#ffffff' }}>
            <Card.Section p="md" style={{ backgroundColor: '#EDF2F7', borderBottom: '1px solid #E2E8F0' }}>
              <Group position="apart">
                <Group>
                  <Avatar
                    size="md"
                    radius="xl"
                    color={DASHBOARD_INFO[activeTab].color}
                  >
                    {DASHBOARD_INFO[activeTab].icon}
                  </Avatar>
                  <div>
                    <Text weight={600} size="lg" color="#3E5879">
                      {DASHBOARD_INFO[activeTab].title}
                    </Text>
                    <Text size="sm" color="dimmed">
                      {DASHBOARD_INFO[activeTab].description}
                    </Text>
                  </div>
                </Group>
              </Group>
            </Card.Section>
          </Card>
        </>
      )}

      <Paper
        shadow="sm"
        radius={isFullscreen ? 0 : 'lg'}
        p={0}
        withBorder
        style={{
          overflow: 'hidden',
          height: isFullscreen ? 'calc(100vh - 60px)' : 'calc(100vh - 280px)',
          position: 'relative',
        }}
      >
        <Tabs
          value={activeTab.toString()}
          onTabChange={(value) => setActiveTab(parseInt(value || '0'))}
          variant="pills"
          radius="xl"
          style={{
            position: 'absolute',
            top: 15,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '5px',
            borderRadius: '30px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Tabs.List>
            {DASHBOARD_INFO.map((dashboard, index) => (
              <Tabs.Tab
                key={index}
                value={index.toString()}
                icon={dashboard.icon}
                style={{
                  fontWeight: 600,
                  padding: '8px 16px',
                }}
              >
                {!isFullscreen && dashboard.title}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>

        {DASHBOARD_INFO.map((dashboard, index) => (
          <div
            key={index}
            style={{
              display: activeTab === index ? 'block' : 'none',
              height: '100%',
              position: 'relative',
            }}
          >
            {isLoading[index] && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8fafc',
                zIndex: 10,
              }}>
                <div style={{ textAlign: 'center' }}>
                  <Loader size="lg" color={dashboard.color} variant="dots" />
                  <Text mt="md" color="dimmed">Chargement du tableau de bord...</Text>
                </div>
              </div>
            )}
            <iframe
              id={`dashboard-iframe-${index}`}
              src={DASHBOARD_URLS[index]}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              onLoad={() => handleIframeLoad(index)}
              title={`Dashboard ${dashboard.title}`}
              allowFullScreen
            />
          </div>
        ))}
      </Paper>
    </Container>
  );
}

// Protéger le dashboard CRM avec le rôle admin uniquement
export default withAuth(CRMDashboard, "admin");