import React from 'react';
import { Box, Text, ThemeIcon, Paper, Container } from '@mantine/core';
import styles from '../../styles/SimpleTimeline.module.css';
import {
  IconCalendarEvent,
  IconMail,
  IconPhone,
  IconFileText,
  IconBriefcase,
  IconUser,
} from '@tabler/icons-react';

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

interface SimpleTimelineProps {
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

// Fonction pour formater la date
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    // Extraire l'année
    return date.getFullYear().toString();
  } catch (e) {
    return dateString;
  }
};

const SimpleTimeline: React.FC<SimpleTimelineProps> = ({ actions }) => {
  // Trier les actions par date d'échéance (de la plus ancienne à la plus récente)
  const sortedActions = [...actions].sort((a, b) => {
    return new Date(a.dateEcheance).getTime() - new Date(b.dateEcheance).getTime();
  });

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
          {/* Segments colorés */}
          {sortedActions.map((action, index) => {
            const color = getColor(index);
            const position = `${(index / (sortedActions.length - 1)) * 100}%`;
            
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
                  sx={{ backgroundColor: color }}
                >
                  {getActionIcon(action.objet)}
                </ThemeIcon>
                
                {/* Année */}
                <Text
                  weight={700}
                  size="xl"
                  className={styles.timelineYear}
                  sx={{ color }}
                >
                  {formatDate(action.dateEcheance)}
                </Text>
                
                {/* Contenu de l'action */}
                <Paper
                  p="md"
                  radius="md"
                  withBorder
                  shadow="sm"
                  className={styles.timelineContent}
                  sx={{ borderTop: `3px solid ${color}` }}
                >
                  <Text weight={700} size="sm" color={color} mb="xs">
                    {action.objet}
                  </Text>
                  <Text size="xs" color="dimmed" lineClamp={2}>
                    {action.description || "Aucune description"}
                  </Text>
                </Paper>
              </Box>
            );
          })}
        </Box>
        
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
                top: '60px',
                zIndex: 1
              }}
            />
          );
        })}
        
        {/* Cercles de début et fin */}
        <Box
          className={styles.startEndCircle}
          sx={{
            left: '0',
            backgroundColor: '#F9D949'
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
            backgroundColor: '#22C55E'
          }}
        >
          <Text weight={700} size="sm" color="white">
            Fin
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default SimpleTimeline;
