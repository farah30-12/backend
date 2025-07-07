import React from 'react';
import { Task } from 'pages/projects';
import { format, differenceInDays, addDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SimpleTextGanttChartProps {
  tasks: Task[];
}

const SimpleTextGanttChart: React.FC<SimpleTextGanttChartProps> = ({ tasks }) => {
  // Fonction pour formater les dates
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'dd/MM', { locale: fr });
    } catch (error) {
      return 'Date invalide';
    }
  };

  // Fonction pour calculer la durée en semaines ou jours
  const calculateDuration = (startDate: string, endDate: string) => {
    try {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      const days = differenceInDays(end, start) + 1;
      
      if (days >= 7) {
        const weeks = Math.floor(days / 7);
        return `${weeks} semaine${weeks > 1 ? 's' : ''}`;
      } else {
        return `${days} jour${days > 1 ? 's' : ''}`;
      }
    } catch (error) {
      return 'Durée inconnue';
    }
  };

  // Fonction pour obtenir la couleur en fonction du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
      case 'À faire':
        return '#dc3545'; // Rouge pour "À faire"
      case 'in-progress':
      case 'En cours':
        return '#fd7e14'; // Orange pour "En cours"
      case 'done':
      case 'Achevé':
      case 'Terminé':
        return '#28a745'; // Vert pour "Terminé"
      default:
        return '#6c757d'; // Gris pour les autres statuts
    }
  };

  // Trier les tâches par date de début
  const sortedTasks = [...tasks].sort((a, b) => {
    try {
      return parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime();
    } catch (error) {
      return 0;
    }
  });

  // Trouver les dates min et max pour définir la plage du diagramme
  let minDate = new Date();
  let maxDate = new Date();

  if (sortedTasks.length > 0) {
    try {
      minDate = parseISO(sortedTasks[0].startDate);
      maxDate = parseISO(sortedTasks[0].endDate);

      sortedTasks.forEach(task => {
        try {
          const startDate = parseISO(task.startDate);
          const endDate = parseISO(task.endDate);
          
          if (startDate < minDate) minDate = startDate;
          if (endDate > maxDate) maxDate = endDate;
        } catch (error) {
          // Ignorer les dates invalides
        }
      });
    } catch (error) {
      // Utiliser les dates par défaut
    }
  }

  // Ajouter une marge de 7 jours avant et après
  minDate = addDays(minDate, -7);
  maxDate = addDays(maxDate, 7);

  // Calculer le nombre total de jours dans la plage
  const totalDays = differenceInDays(maxDate, minDate) + 1;

  // Déterminer les mois à afficher
  const months: string[] = [];
  let currentDate = new Date(minDate);
  
  while (currentDate <= maxDate) {
    const monthName = format(currentDate, 'MMMM', { locale: fr });
    if (!months.includes(monthName)) {
      months.push(monthName);
    }
    currentDate = addDays(currentDate, 7); // Avancer d'une semaine pour optimiser
  }

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Diagramme de Gantt</h2>
      
      {/* Tableau des tâches */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Tâche</th>
            <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Durée</th>
            <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Dates</th>
          </tr>
        </thead>
        <tbody>
          {sortedTasks.map(task => (
            <tr key={task.id}>
              <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{task.title}</td>
              <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                {calculateDuration(task.startDate, task.endDate)}
              </td>
              <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                {formatDate(task.startDate)} - {formatDate(task.endDate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Représentation simplifiée */}
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ marginBottom: '15px', color: '#333' }}>Représentation simplifiée :</h3>
        
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '5px',
          border: '1px solid #e9ecef',
          fontFamily: 'monospace',
          whiteSpace: 'pre',
          overflowX: 'auto'
        }}>
          {/* En-tête avec les mois */}
          <div style={{ marginBottom: '10px', display: 'flex' }}>
            <div style={{ width: '200px', paddingRight: '10px' }}>| Tâches</div>
            {months.map((month, index) => (
              <div key={index} style={{ flex: 1, textAlign: 'center' }}>| {month}</div>
            ))}
            <div>|</div>
          </div>
          
          {/* Ligne de séparation */}
          <div style={{ marginBottom: '10px' }}>
            |{'-'.repeat(19)}|{months.map(() => '-'.repeat(20) + '|').join('')}
          </div>
          
          {/* Lignes des tâches */}
          {sortedTasks.map(task => {
            try {
              const startDate = parseISO(task.startDate);
              const endDate = parseISO(task.endDate);
              const taskDays = differenceInDays(endDate, startDate) + 1;
              const startOffset = differenceInDays(startDate, minDate);
              const barLength = Math.max(1, taskDays);
              
              // Calculer la position et la longueur de la barre
              const totalSpace = months.length * 20; // 20 caractères par mois
              const startPos = Math.floor((startOffset / totalDays) * totalSpace);
              const barWidth = Math.max(1, Math.floor((barLength / totalDays) * totalSpace));
              
              // Créer la ligne avec la barre
              let line = `| ${task.title.padEnd(18).substring(0, 18)} |`;
              
              // Ajouter des espaces avant la barre
              line += ' '.repeat(startPos);
              
              // Ajouter la barre avec le caractère approprié selon le statut
              const barChar = '#';
              line += barChar.repeat(barWidth);
              
              // Compléter avec des espaces
              line += ' '.repeat(totalSpace - startPos - barWidth);
              
              line += '|';
              
              return (
                <div key={task.id} style={{ marginBottom: '5px' }}>
                  {line}
                </div>
              );
            } catch (error) {
              return (
                <div key={task.id} style={{ marginBottom: '5px' }}>
                  | {task.title.padEnd(18).substring(0, 18)} | Dates invalides |
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default SimpleTextGanttChart;
