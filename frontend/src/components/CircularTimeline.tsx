import React from 'react';
import styles from '../../styles/CircularTimeline.module.css';
import { Box, Text, Group, Paper, ThemeIcon, Badge, Stack } from '@mantine/core';
import {
  IconCalendarEvent,
  IconCheck,
  IconClock,
  IconMail,
  IconPhone,
  IconFileText,
  IconUser,
  IconBriefcase,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Action {
  id: number;
  objet: string;
  statut: string;
  dateEcheance: string;
  dateRappel: string;
  managerEmail: string;
  contact: string;
  description: string;
  prospect?: { id: number };
  parentAction?: { id: number; objet: string } | null;
}

interface CircularTimelineProps {
  actions: Action[];
}

// Fonction pour obtenir l'icône en fonction de l'objet de l'action
const getActionIcon = (objet: string) => {
  const lowerObjet = objet.toLowerCase();

  if (lowerObjet.includes('email') || lowerObjet.includes('mail')) {
    return <IconMail size={20} />;
  } else if (lowerObjet.includes('appel') || lowerObjet.includes('téléphone')) {
    return <IconPhone size={20} />;
  } else if (lowerObjet.includes('proposition') || lowerObjet.includes('devis')) {
    return <IconFileText size={20} />;
  } else if (lowerObjet.includes('closing') || lowerObjet.includes('contrat')) {
    return <IconBriefcase size={20} />;
  } else if (lowerObjet.includes('suivi')) {
    return <IconUser size={20} />;
  } else {
    return <IconCalendarEvent size={20} />;
  }
};

// Fonction pour obtenir la couleur en fonction du statut
const getStatusColor = (statut: string) => {
  switch (statut) {
    case 'termine':
      return 'teal';
    case 'en_cours':
      return 'indigo';
    case 'non_commence':
      return 'orange';
    default:
      return 'gray';
  }
};

// Fonction pour formater la date
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return format(date, 'dd MMM yyyy', { locale: fr });
  } catch (e) {
    return dateString;
  }
};

const CircularTimeline: React.FC<CircularTimelineProps> = ({ actions }) => {
  // Trier les actions par date d'échéance (de la plus récente à la plus ancienne)
  const sortedActions = [...actions].sort((a, b) => {
    return new Date(b.dateEcheance).getTime() - new Date(a.dateEcheance).getTime();
  });

  // Si aucune action, afficher un message au centre
  if (sortedActions.length === 0) {
    return (
      <Box className={styles.timelineContainer} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Paper p="xl" radius="lg" withBorder shadow="sm" sx={{ maxWidth: '400px', textAlign: 'center' }}>
          <IconCalendarEvent size={48} stroke={1.5} color="#3E5879" style={{ marginBottom: '16px' }} />
          <Text weight={700} size="lg" color="#3E5879" mb="md">
            Aucune action pour ce prospect
          </Text>
          <Text size="sm" color="dimmed">
            Ajoutez des actions pour suivre l'évolution de ce prospect dans le temps.
          </Text>
        </Paper>
      </Box>
    );
  }

  return (
    <Box className={styles.timelineContainer}>
      <svg className={styles.timelineCircle} width="100%" height="100%">
        <circle
          cx="50%"
          cy="50%"
          r="40%"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
      </svg>

      {sortedActions.length > 0 && sortedActions.map((action, index) => {
        // Calculer la position sur le cercle
        const angle = (index * 360) / sortedActions.length;
        const radians = (angle * Math.PI) / 180;
        const radius = 40; // en pourcentage

        // Calculer les coordonnées x et y
        const x = 50 + radius * Math.cos(radians);
        const y = 50 + radius * Math.sin(radians);

        // Déterminer si l'élément est à gauche ou à droite pour l'alignement du texte
        const isRight = x > 50;

        return (
          <Box
            key={action.id}
            className={styles.timelineItem}
            style={{
              '--index': index,
              left: `${x}%`,
              top: `${y}%`,
            } as React.CSSProperties}
          >
            <Paper
              p="md"
              radius="lg"
              withBorder
              shadow="sm"
              className={styles.timelineItemContent}
              sx={{
                textAlign: isRight ? 'left' : 'right',
                marginLeft: isRight ? '20px' : 'auto',
                marginRight: isRight ? 'auto' : '20px',
              }}
            >
              <Group position={isRight ? 'left' : 'right'} mb="xs">
                <ThemeIcon
                  size="xl"
                  radius="xl"
                  color={getStatusColor(action.statut)}
                  variant="light"
                >
                  {getActionIcon(action.objet)}
                </ThemeIcon>
                <Text weight={700} size="md" color="#3E5879">
                  {action.objet}
                </Text>
              </Group>

              <Text size="sm" color="dimmed" mb="xs" align={isRight ? 'left' : 'right'}>
                {action.description || "Aucune description"}
              </Text>

              <Stack spacing={5}>
                <Group position={isRight ? 'left' : 'right'} spacing="xs">
                  <ThemeIcon size="sm" radius="xl" color="blue" variant="light">
                    <IconCalendarEvent size={12} />
                  </ThemeIcon>
                  <Text size="xs" color="#4A5568">
                    Échéance: {formatDate(action.dateEcheance)}
                  </Text>
                </Group>

                {action.dateRappel && (
                  <Group position={isRight ? 'left' : 'right'} spacing="xs">
                    <ThemeIcon size="sm" radius="xl" color="orange" variant="light">
                      <IconClock size={12} />
                    </ThemeIcon>
                    <Text size="xs" color="#4A5568">
                      Rappel: {formatDate(action.dateRappel)}
                    </Text>
                  </Group>
                )}

                <Group position={isRight ? 'left' : 'right'} spacing="xs" mt="xs">
                  <Badge
                    color={getStatusColor(action.statut)}
                    variant="light"
                    size="sm"
                    radius="sm"
                  >
                    {action.statut === 'termine' ? 'Terminé' :
                     action.statut === 'en_cours' ? 'En cours' :
                     action.statut === 'non_commence' ? 'À faire' : action.statut}
                  </Badge>

                  {action.parentAction && (
                    <Badge color="gray" variant="outline" size="sm" radius="sm">
                      Basé sur: {action.parentAction.objet}
                    </Badge>
                  )}
                </Group>
              </Stack>
            </Paper>

            <ThemeIcon
              size="lg"
              radius="xl"
              color={getStatusColor(action.statut)}
              className={styles.timelineIcon}
              style={{
                [isRight ? 'left' : 'right']: 0,
              }}
            >
              {action.statut === 'termine' ? (
                <IconCheck size={16} />
              ) : (
                getActionIcon(action.objet)
              )}
            </ThemeIcon>
          </Box>
        );
      })}

      {/* Centre du cercle */}
      <Box className={styles.timelineCenter}>
        <Paper
          p="lg"
          radius="xl"
          withBorder
          shadow="md"
          className={styles.centerContent}
        >
          <Text weight={700} size="xl" color="#3E5879">
            {sortedActions.length}
          </Text>
          <Text weight={500} size="sm" color="#4A5568">
            {sortedActions.length > 1 ? 'Actions' : 'Action'}
          </Text>
        </Paper>
      </Box>
    </Box>
  );
};

export default CircularTimeline;
