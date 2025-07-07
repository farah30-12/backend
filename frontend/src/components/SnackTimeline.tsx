import React from 'react';
import {
  Box,
  Text,
  ThemeIcon,
  Paper,
  Group,
  Badge,
  Container,
  Tooltip
} from "@mantine/core";
import {
  IconCalendarEvent,
  IconPhoneCall,
  IconMail,
  IconFileText,
  IconUserCheck,
  IconPresentationAnalytics,
  IconMessageCircle,
  IconCheck,
  IconClock,
  IconAlertCircle,
  IconInfoCircle
} from "@tabler/icons-react";
import styles from '../../styles/SnackTimeline.module.css';

interface Action {
  id: number;
  objet: string;
  statut: string;
  dateEcheance: string;
  dateRappel?: string;
  managerEmail?: string;
  contact?: string;
  description: string;
  prospect?: { id: number };
}

interface Props {
  actions: Action[];
  onDuplicate?: (actionId: number) => void;
  onEdit?: (actionId: number) => void;
  onDelete?: (actionId: number) => void;
}

const iconMap: { [key: string]: JSX.Element } = {
  "Email de qualification": <IconMail size={18} />,
  "Appel de qualification": <IconPhoneCall size={18} />,
  "Appel de suivi": <IconPhoneCall size={18} />,
  "demo": <IconPresentationAnalytics size={18} />,
  "Proposition commerciale": <IconFileText size={18} />,
  "Closing": <IconUserCheck size={18} />,
  "Gestion des objections": <IconMessageCircle size={18} />,
  "Présentation du service": <IconPresentationAnalytics size={18} />,
  "Suivi post-vente": <IconUserCheck size={18} />,
};

const colorMap: { [key: string]: string } = {
  "Email de qualification": "blue",
  "Appel de qualification": "green",
  "Appel de suivi": "green",
  "demo": "violet",
  "Proposition commerciale": "orange",
  "Closing": "teal",
  "Gestion des objections": "red",
  "Présentation du service": "indigo",
  "Suivi post-vente": "cyan",
};

const statusColorMap: { [key: string]: string } = {
  "non_commence": "gray",
  "en_cours": "blue",
  "termine": "green",
};

const statusIconMap: { [key: string]: JSX.Element } = {
  "non_commence": <IconClock size={14} />,
  "en_cours": <IconInfoCircle size={14} />,
  "termine": <IconCheck size={14} />,
};

// Fonction pour obtenir la couleur en fonction de l'index
const getColor = (index: number) => {
  // Couleurs de la timeline comme dans l'image
  const colors = [
    '#F9D949', // jaune
    '#F9A826', // orange
    '#F26A4F', // rouge-orange
    '#E64980', // rose
    '#9C36B5', // violet
    '#6741D9', // indigo
    '#3B82F6', // bleu
    '#0CA678', // vert-bleu
    '#22C55E', // vert
  ];

  return colors[index % colors.length];
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    fullDate: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
    year: date.getFullYear().toString(),
    isToday: new Date().toDateString() === date.toDateString(),
    isPast: date < new Date(),
    isFuture: date > new Date(),
  };
};

export default function SnackTimeline({ actions, onDuplicate, onEdit, onDelete }: Props) {
  // Trier les actions par date d'échéance (de la plus ancienne à la plus récente)
  const sortedActions = [...actions].sort(
    (a, b) => new Date(a.dateEcheance).getTime() - new Date(b.dateEcheance).getTime()
  );

  // Si aucune action, afficher un message
  if (sortedActions.length === 0) {
    return (
      <Container p="xl">
        <Paper p="xl" radius="lg" withBorder shadow="sm" sx={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <IconCalendarEvent size={48} stroke={1.5} color="#3E5879" style={{ marginBottom: '16px' }} />
          <Text weight={700} size="lg" color="#3E5879" mb="md">
            Aucune action pour ce prospect
          </Text>
          <Text size="sm" color="dimmed">
            Ajoutez des actions pour suivre l'évolution de ce prospect dans le temps.
          </Text>
        </Paper>
      </Container>
    );
  }

  // Calculer la largeur totale nécessaire
  const totalWidth = sortedActions.length * 180;
  const containerWidth = Math.max(totalWidth, 800);

  return (
    <Box className={styles.timelineContainer}>
      <Box sx={{ width: containerWidth, maxWidth: '100%', position: 'relative' }}>
        {/* Ligne de temps principale */}
        <Box className={styles.timelineLine}>
          {/* Segments colorés de la ligne */}
          {sortedActions.map((action, index) => {
            if (index === sortedActions.length - 1) return null;

            const color = getColor(index);
            const startPos = `${(index / (sortedActions.length - 1)) * 100}%`;
            const endPos = `${((index + 1) / (sortedActions.length - 1)) * 100}%`;

            return (
              <Box
                key={`segment-${index}`}
                sx={{
                  position: 'absolute',
                  left: startPos,
                  width: `calc(${endPos} - ${startPos})`,
                  height: '4px',
                  backgroundColor: color,
                  top: '0',
                  zIndex: 1
                }}
              />
            );
          })}

          {/* Points avec icônes */}
          {sortedActions.map((action, index) => {
            const color = getColor(index);
            const position = `${(index / (sortedActions.length - 1)) * 100}%`;
            const icon = iconMap[action.objet] || <IconCalendarEvent size={20} />;
            const { year, date, isToday } = formatDate(action.dateEcheance);

            return (
              <Box
                key={action.id}
                sx={{
                  position: 'absolute',
                  left: position,
                  transform: 'translateX(-50%)',
                  zIndex: 2
                }}
              >
                {/* Cercle coloré avec icône */}
                <ThemeIcon
                  size={56}
                  radius="xl"
                  className={styles.timelineIcon}
                  sx={{
                    backgroundColor: color,
                    boxShadow: `0 2px 8px ${color}40`
                  }}
                >
                  {icon}
                </ThemeIcon>

                {/* Année */}
                <Text
                  weight={700}
                  size="xl"
                  className={styles.timelineYear}
                  sx={{ color }}
                >
                  {year}
                </Text>

                {/* Contenu de l'action */}
                <Paper
                  p="md"
                  radius="md"
                  withBorder
                  shadow="sm"
                  className={styles.timelineContent}
                  sx={{
                    borderTop: `3px solid ${color}`,
                    backgroundColor: 'white'
                  }}
                >
                  <Text weight={700} size="sm" color={color} mb="xs">
                    {action.objet}
                  </Text>
                  <Text size="xs" color="dimmed" lineClamp={2}>
                    {action.description || "Aucune description"}
                  </Text>
                  {action.dateRappel && (
                    <Group spacing="xs" mt="xs">
                      <Badge
                        color="orange"
                        variant="outline"
                        radius="sm"
                        leftSection={<IconAlertCircle size={12} />}
                        size="xs"
                      >
                        Rappel: {formatDate(action.dateRappel).date}
                      </Badge>
                    </Group>
                  )}
                </Paper>
              </Box>
            );
          })}
        </Box>

        {/* Cercles de début et fin */}
        <Box
          className={styles.startEndCircle}
          sx={{
            left: '0',
            backgroundColor: '#F9D949',
            boxShadow: '0 2px 8px rgba(249, 217, 73, 0.4)'
          }}
        >
          <Text weight={700} size="sm" color="white">
            Début
          </Text>
        </Box>

        <Box
          className={styles.startEndCircle}
          sx={{
            right: '0',
            backgroundColor: '#22C55E',
            boxShadow: '0 2px 8px rgba(34, 197, 94, 0.4)'
          }}
        >
          <Text weight={700} size="sm" color="white">
            Fin
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
