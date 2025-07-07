import React from 'react';
import { Task } from 'pages/projects';
import { format, differenceInDays, parseISO, addMonths, startOfMonth, endOfMonth, getMonth, getYear } from 'date-fns';
import { fr } from 'date-fns/locale';

interface GridGanttChartProps {
  tasks: Task[];
}

const GridGanttChart: React.FC<GridGanttChartProps> = ({ tasks }) => {
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

  // Couleurs pour les tâches
  const taskColors = [
    '#FFD700', // Or
    '#90EE90', // Vert clair
    '#FFA07A', // Saumon clair
    '#FF6347', // Tomate
    '#00CED1', // Turquoise
    '#FFA500', // Orange
    '#98FB98', // Vert pâle
    '#FFC0CB', // Rose
    '#FF4500', // Rouge-orange
    '#20B2AA', // Vert mer clair
  ];

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

  // Arrondir aux mois complets
  minDate = startOfMonth(minDate);
  maxDate = endOfMonth(maxDate);

  // S'assurer que nous avons au moins une année complète
  if (differenceInDays(maxDate, minDate) < 365) {
    maxDate = endOfMonth(addMonths(minDate, 11));
  }

  // Générer les mois pour l'affichage
  const months = [];
  let currentDate = new Date(minDate);
  
  while (currentDate <= maxDate) {
    months.push({
      name: format(currentDate, 'MMM', { locale: fr }),
      fullName: format(currentDate, 'MMMM', { locale: fr }),
      year: getYear(currentDate),
      month: getMonth(currentDate),
      startDate: startOfMonth(currentDate),
      endDate: endOfMonth(currentDate)
    });
    
    currentDate = addMonths(currentDate, 1);
  }

  // Générer les trimestres
  const quarters = [];
  for (let i = 0; i < months.length; i += 3) {
    if (i + 2 < months.length) {
      quarters.push({
        name: `Q${Math.floor(i / 3) + 1}`,
        startMonth: i,
        endMonth: i + 2
      });
    }
  }

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h2 style={{ marginBottom: '20px', color: '#333', textAlign: 'left' }}>Gantt Chart</h2>
      
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: '900px' }}>
          {/* En-tête avec les trimestres */}
          <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
            <div style={{ width: '100px', flexShrink: 0 }}></div>
            {quarters.map((quarter, index) => (
              <div 
                key={index} 
                style={{ 
                  flex: quarter.endMonth - quarter.startMonth + 1, 
                  textAlign: 'center',
                  padding: '8px',
                  fontWeight: 'bold',
                  color: '#666',
                  borderRight: index < quarters.length - 1 ? '1px solid #eee' : 'none'
                }}
              >
                {quarter.name}
              </div>
            ))}
          </div>
          
          {/* En-tête avec les mois */}
          <div style={{ display: 'flex', borderBottom: '1px solid #ddd' }}>
            <div style={{ width: '100px', flexShrink: 0 }}></div>
            {months.map((month, index) => (
              <div 
                key={index} 
                style={{ 
                  flex: 1, 
                  textAlign: 'center',
                  padding: '8px',
                  fontWeight: 'bold',
                  color: '#666',
                  borderRight: '1px solid #eee',
                  backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white'
                }}
              >
                {month.name}
              </div>
            ))}
          </div>
          
          {/* Lignes des tâches */}
          {sortedTasks.map((task, taskIndex) => {
            try {
              const startDate = parseISO(task.startDate);
              const endDate = parseISO(task.endDate);
              
              // Trouver l'index du mois de début et de fin
              const startMonthIndex = months.findIndex(m => 
                startDate >= m.startDate && startDate <= m.endDate
              );
              
              const endMonthIndex = months.findIndex(m => 
                endDate >= m.startDate && endDate <= m.endDate
              );
              
              // Si les dates sont en dehors de la plage, ajuster
              const adjustedStartIndex = startMonthIndex < 0 ? 0 : startMonthIndex;
              const adjustedEndIndex = endMonthIndex < 0 ? months.length - 1 : endMonthIndex;
              
              // Calculer la position relative dans le mois de début
              const startMonthDays = differenceInDays(endOfMonth(startDate), startOfMonth(startDate)) + 1;
              const startDayOfMonth = differenceInDays(startDate, startOfMonth(startDate)) + 1;
              const startOffset = startDayOfMonth / startMonthDays;
              
              // Calculer la position relative dans le mois de fin
              const endMonthDays = differenceInDays(endOfMonth(endDate), startOfMonth(endDate)) + 1;
              const endDayOfMonth = differenceInDays(endDate, startOfMonth(endDate)) + 1;
              const endOffset = endDayOfMonth / endMonthDays;
              
              // Couleur de la tâche
              const taskColor = taskColors[taskIndex % taskColors.length];
              
              return (
                <div key={task.id} style={{ display: 'flex', borderBottom: '1px solid #eee', height: '40px', alignItems: 'center' }}>
                  <div style={{ 
                    width: '100px', 
                    flexShrink: 0, 
                    padding: '8px',
                    fontWeight: '500',
                    color: '#333',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {task.title}
                  </div>
                  
                  {months.map((month, monthIndex) => {
                    const isStartMonth = monthIndex === adjustedStartIndex;
                    const isEndMonth = monthIndex === adjustedEndIndex;
                    const isMiddleMonth = monthIndex > adjustedStartIndex && monthIndex < adjustedEndIndex;
                    
                    // Calculer la largeur et la position de la barre dans ce mois
                    let barStyle = {};
                    
                    if (isStartMonth && isEndMonth) {
                      // La tâche commence et se termine dans le même mois
                      barStyle = {
                        marginLeft: `${startOffset * 100}%`,
                        width: `${(endOffset - startOffset) * 100}%`,
                        backgroundColor: taskColor,
                        height: '20px',
                        borderRadius: '10px',
                        position: 'relative' as 'relative'
                      };
                    } else if (isStartMonth) {
                      // La tâche commence dans ce mois
                      barStyle = {
                        marginLeft: `${startOffset * 100}%`,
                        width: `${(1 - startOffset) * 100}%`,
                        backgroundColor: taskColor,
                        height: '20px',
                        borderRadius: '10px 0 0 10px',
                        position: 'relative' as 'relative'
                      };
                    } else if (isEndMonth) {
                      // La tâche se termine dans ce mois
                      barStyle = {
                        width: `${endOffset * 100}%`,
                        backgroundColor: taskColor,
                        height: '20px',
                        borderRadius: '0 10px 10px 0',
                        position: 'relative' as 'relative'
                      };
                    } else if (isMiddleMonth) {
                      // La tâche passe par ce mois
                      barStyle = {
                        width: '100%',
                        backgroundColor: taskColor,
                        height: '20px',
                        position: 'relative' as 'relative'
                      };
                    }
                    
                    return (
                      <div 
                        key={monthIndex} 
                        style={{ 
                          flex: 1, 
                          height: '100%',
                          borderRight: '1px solid #eee',
                          backgroundColor: monthIndex % 2 === 0 ? '#f9f9f9' : 'white',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {(isStartMonth || isEndMonth || isMiddleMonth) && (
                          <div style={barStyle}>
                            {isEndMonth && (
                              <div style={{
                                position: 'absolute',
                                right: '-4px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: '#333',
                                zIndex: 2
                              }}></div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            } catch (error) {
              return (
                <div key={task.id} style={{ display: 'flex', borderBottom: '1px solid #eee', height: '40px', alignItems: 'center' }}>
                  <div style={{ 
                    width: '100px', 
                    flexShrink: 0, 
                    padding: '8px',
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    {task.title}
                  </div>
                  <div style={{ flex: months.length, padding: '8px', color: '#dc3545' }}>
                    Dates invalides
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>
      
      {/* Légende */}
      <div style={{ marginTop: '30px', display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
        {sortedTasks.slice(0, 5).map((task, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: taskColors[index % taskColors.length], 
              marginRight: '8px',
              borderRadius: '4px'
            }}></div>
            <span>{task.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GridGanttChart;
