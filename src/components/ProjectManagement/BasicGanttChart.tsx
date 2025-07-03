import React from 'react';
import { Task } from 'pages/projects';
import { format, differenceInDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface BasicGanttChartProps {
  tasks: Task[];
}

const BasicGanttChart: React.FC<BasicGanttChartProps> = ({ tasks }) => {
  // Trier les tâches par date de début
  const sortedTasks = [...tasks].sort((a, b) => {
    try {
      return parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime();
    } catch (error) {
      return 0;
    }
  });

  // Fonction pour formater les dates
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'dd/MM', { locale: fr });
    } catch (error) {
      return 'Date invalide';
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

  // Calculer le nombre total de jours dans la plage
  const totalDays = differenceInDays(maxDate, minDate) + 1;

  // Créer un tableau de mois pour l'affichage
  const months = [];
  let currentDate = new Date(minDate);
  while (currentDate <= maxDate) {
    const monthName = format(currentDate, 'MMMM', { locale: fr });
    const year = format(currentDate, 'yyyy', { locale: fr });
    const key = `${monthName}-${year}`;

    if (!months.find(m => m.key === key)) {
      months.push({
        key,
        name: monthName,
        year
      });
    }

    // Avancer d'un mois
    currentDate.setMonth(currentDate.getMonth() + 1);
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
      {/* En-tête avec les mois */}
      <div style={{
        display: 'flex',
        marginBottom: '20px',
        marginLeft: '250px',
        borderBottom: '1px solid #ddd',
        paddingBottom: '10px'
      }}>
        {months.map((month) => (
          <div key={month.key} style={{
            flex: 1,
            textAlign: 'center',
            fontWeight: 'bold',
            color: '#333'
          }}>
            {month.name}
          </div>
        ))}
      </div>

      {/* Tâches du diagramme */}
      {sortedTasks.map(task => {
        try {
          const startDate = parseISO(task.startDate);
          const endDate = parseISO(task.endDate);
          const taskDays = differenceInDays(endDate, startDate) + 1;
          const startOffset = differenceInDays(startDate, minDate);

          // Calculer la position et la largeur de la barre
          const startPercent = (startOffset / totalDays) * 100;
          const widthPercent = (taskDays / totalDays) * 100;

          // Déterminer la couleur en fonction du statut
          let barColor;
          if (task.status === 'todo' || task.status === 'À faire') {
            barColor = '#dc3545'; // Rouge pour "À faire"
          } else if (task.status === 'in-progress' || task.status === 'En cours') {
            barColor = '#fd7e14'; // Orange pour "En cours"
          } else if (task.status === 'done' || task.status === 'Achevé' || task.status === 'Terminé') {
            barColor = '#28a745'; // Vert pour "Terminé"
          } else {
            // Par défaut, considérer comme "À faire"
            barColor = '#dc3545'; // Rouge
          }

          return (
            <div key={task.id} style={{ display: 'flex', marginBottom: '15px', alignItems: 'center' }}>
              {/* Nom de la tâche */}
              <div style={{
                width: '250px',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#fff',
                marginRight: '10px',
                textAlign: 'center',
                fontWeight: 500,
                color: '#333'
              }}>
                {task.title}
              </div>

              {/* Barre de la tâche */}
              <div style={{
                position: 'relative',
                height: '40px',
                flex: 1,
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#fff'
              }}>
                <div style={{
                  position: 'absolute',
                  left: `${Math.min(100, Math.max(0, startPercent))}%`,
                  width: `${Math.min(100, Math.max(0, widthPercent))}%`,
                  height: '100%',
                  backgroundColor: barColor,
                  borderRadius: '0px'
                }}></div>
              </div>
            </div>
          );
        } catch (error) {
          return (
            <div key={task.id} style={{ display: 'flex', marginBottom: '15px', alignItems: 'center' }}>
              <div style={{
                width: '250px',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#fff',
                marginRight: '10px',
                textAlign: 'center',
                fontWeight: 500,
                color: '#333'
              }}>
                {task.title}
              </div>
              <div style={{ flex: 1, padding: '10px', color: '#dc3545' }}>
                Dates invalides
              </div>
            </div>
          );
        }
      })}

      {/* Légende */}
      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#dc3545', marginRight: '8px' }}></div>
          <span>À faire</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#fd7e14', marginRight: '8px' }}></div>
          <span>En cours</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#28a745', marginRight: '8px' }}></div>
          <span>Terminé</span>
        </div>
      </div>
    </div>
  );
};

export default BasicGanttChart;
