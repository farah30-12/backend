import React from 'react';
import {
  Box,
  Text,
  ThemeIcon,
  Paper,
  Group,
  Badge,
  Avatar,
  Container,
  Stack
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
  IconInfoCircle,
  IconClipboard
} from "@tabler/icons-react";
import styles from '../../styles/SimpleVerticalTimeline.module.css';

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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    fullDate: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
    isToday: new Date().toDateString() === date.toDateString(),
    isPast: date < new Date(),
    isFuture: date > new Date(),
  };
};

export default function SimpleVerticalTimeline({ actions }: Props) {
  // Trier les actions par date d'échéance (les plus récentes en haut)
  const sortedActions = [...actions].sort(
    (a, b) => new Date(b.dateEcheance).getTime() - new Date(a.dateEcheance).getTime()
  );

  // Si aucune action, afficher un message
  if (sortedActions.length === 0) {
    return (
      <Box className={styles.timelineEmpty}>
        <ThemeIcon size={50} radius={50} color="gray" mx="auto" mb="md">
          <IconClipboard size={24} />
        </ThemeIcon>
        <Text color="dimmed" size="lg" mb="md">Aucune action liée à ce prospect</Text>
        <Text size="sm" color="dimmed">
          Ajoutez des actions pour suivre l'évolution de ce prospect dans le temps.
        </Text>
      </Box>
    );
  }

  return (
    <Box className={styles.timelineContainer}>
      {sortedActions.map((action) => {
        const { date, time, fullDate, isToday, isPast } = formatDate(action.dateEcheance);
        const icon = iconMap[action.objet] || <IconCalendarEvent size={18} />;
        const color = colorMap[action.objet] || "gray";
        const statusColor = statusColorMap[action.statut] || "gray";
        const statusIcon = statusIconMap[action.statut] || <IconClock size={14} />;

        return (
          <Box key={action.id} className={styles.timelineItem}>
            <ThemeIcon
              size={32}
              radius="xl"
              color={color}
              className={styles.timelineBullet}
            >
              {icon}
            </ThemeIcon>

            <Paper
              p="md"
              withBorder
              className={styles.timelineContent}
              sx={{
                borderLeft: `4px solid ${color}`,
                backgroundColor: isToday ? '#F0F9FF' : isPast ? '#F7FAFC' : '#F0FFF4',
              }}
            >
              <Group position="apart" mb="xs">
                <Group spacing="xs">
                  <IconCalendarEvent size={16} color="#718096" />
                  <Text className={styles.timelineDate}>
                    {isToday ? "Aujourd'hui" : fullDate}
                    {time && ` à ${time}`}
                  </Text>
                </Group>

                <Badge
                  color={statusColor}
                  variant="filled"
                  size="sm"
                  radius="sm"
                  leftSection={statusIcon}
                >
                  {action.statut === "non_commence" ? "Non commencé" :
                   action.statut === "en_cours" ? "En cours" :
                   action.statut === "termine" ? "Terminé" : action.statut}
                </Badge>
              </Group>

              <Text className={styles.timelineTitle}>
                {action.objet}
              </Text>

              <Text className={styles.timelineDescription}>
                {action.description}
              </Text>

              <Box className={styles.timelineFooter}>
                {action.managerEmail && (
                  <Group spacing="xs">
                    <Avatar
                      size="sm"
                      radius="xl"
                      color="blue"
                      style={{ backgroundColor: "#4299E1" }}
                    >
                      {action.managerEmail.charAt(0).toUpperCase()}
                    </Avatar>
                    <Text size="xs" color="#718096">
                      {action.managerEmail}
                    </Text>
                  </Group>
                )}

                {action.dateRappel && (
                  <Badge
                    color="orange"
                    variant="outline"
                    radius="sm"
                    leftSection={<IconAlertCircle size={12} />}
                  >
                    Rappel: {formatDate(action.dateRappel).date}
                  </Badge>
                )}
              </Box>
            </Paper>
          </Box>
        );
      })}
    </Box>
  );
}
