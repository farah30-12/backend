import React from 'react';
import { Task } from 'pages/projects';
import { format, differenceInDays, parseISO, addMonths, startOfMonth, endOfMonth, getMonth, getYear, isValid, isBefore, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ExactGanttChartProps {
  tasks: Task[];
}

const ExactGanttChart: React.FC<ExactGanttChartProps> = ({ tasks }) => {
  // Couleurs pour les tâches - exactement comme dans l'image
  const taskColors = [
    '#FFD700', // Or
    '#90EE90', // Vert clair
    '#FFA07A', // Saumon clair
    '#FF6347', // Rouge
    '#00CED1', // Turquoise
  ];

  // Fonction pour vérifier si une tâche est en retard
  const isTaskDelayed = (task: Task) => {
    const today = new Date();

    try {
      const startDate = parseISO(task.startDate);
      const endDate = parseISO(task.endDate);
      const statusLower = (task.status || '').toLowerCase();

      // Cas 1: Tâche "à faire" dont la date de début est passée
      if ((statusLower.includes('todo') || statusLower.includes('faire')) && isBefore(startDate, today)) {
        return true;
      }

      // Cas 2: Tâche "en cours" dont la date de fin est passée
      if ((statusLower.includes('progress') || statusLower.includes('cours')) && isBefore(endDate, today)) {
        return true;
      }

      // Cas 3: Tâche non commencée dont la date de fin est passée (retard critique)
      if ((statusLower.includes('todo') || statusLower.includes('faire')) && isBefore(endDate, today)) {
        return true;
      }

      return false;
    } catch (error) {
      // En cas d'erreur de parsing des dates, on considère que la tâche n'est pas en retard
      return false;
    }
  };

  // Fonction pour calculer le nombre de jours de retard d'une tâche
  const calculateDelayDays = (task: Task) => {
    const today = new Date();

    try {
      const startDate = parseISO(task.startDate);
      const endDate = parseISO(task.endDate);
      const statusLower = (task.status || '').toLowerCase();

      // Cas 1: Tâche "à faire" dont la date de début est passée
      if ((statusLower.includes('todo') || statusLower.includes('faire')) && isBefore(startDate, today)) {
        return differenceInDays(today, startDate);
      }

      // Cas 2: Tâche "en cours" dont la date de fin est passée
      if ((statusLower.includes('progress') || statusLower.includes('cours')) && isBefore(endDate, today)) {
        return differenceInDays(today, endDate);
      }

      // Cas 3: Tâche non commencée dont la date de fin est passée (retard critique)
      if ((statusLower.includes('todo') || statusLower.includes('faire')) && isBefore(endDate, today)) {
        return differenceInDays(today, endDate);
      }

      return 0;
    } catch (error) {
      return 0;
    }
  };

  // Fonction pour obtenir une couleur en fonction du statut de la tâche et du retard
  const getStatusColor = (task: Task) => {
    if (!task.status) return taskColors[0];

    const statusLower = task.status.toLowerCase();

    // Vérifier si la tâche est "à faire" et en retard
    if ((statusLower.includes('todo') || statusLower.includes('faire')) && isTaskDelayed(task)) {
      return '#808080'; // Gris pour les tâches "à faire" en retard
    }

    // Couleurs normales selon le statut
    if (statusLower.includes('todo') || statusLower.includes('faire')) {
      return '#FF6347'; // Rouge pour "à faire"
    } else if (statusLower.includes('progress') || statusLower.includes('cours')) {
      return '#FFD700'; // Or pour "en cours" (même si en retard)
    } else if (statusLower.includes('done') || statusLower.includes('termin')) {
      return '#90EE90'; // Vert clair pour "terminé"
    }

    return taskColors[0]; // Couleur par défaut
  };

  // Filtrer les tâches qui ont des dates valides
  const validTasks = tasks.filter(task => {
    try {
      const startDate = parseISO(task.startDate);
      const endDate = parseISO(task.endDate);
      return isValid(startDate) && isValid(endDate);
    } catch (error) {
      return false;
    }
  });

  // Trier les tâches par date de début
  const sortedTasks = [...validTasks].sort((a, b) => {
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
      minDate = new Date(new Date().getFullYear(), 0, 1); // 1er janvier de l'année en cours
      maxDate = new Date(new Date().getFullYear(), 11, 31); // 31 décembre de l'année en cours
    }
  } else {
    // S'il n'y a pas de tâches, utiliser l'année en cours
    minDate = new Date(new Date().getFullYear(), 0, 1); // 1er janvier de l'année en cours
    maxDate = new Date(new Date().getFullYear(), 11, 31); // 31 décembre de l'année en cours
  }

  // Arrondir aux mois complets
  minDate = startOfMonth(minDate);
  maxDate = endOfMonth(maxDate);

  // Ajuster la plage de dates pour que les tâches apparaissent plus longues
  // Réduire la plage totale pour que les tâches occupent plus d'espace
  const totalDaysOriginal = differenceInDays(maxDate, minDate) + 1;

  // Si la plage est trop grande, la réduire pour que les tâches apparaissent plus longues
  if (totalDaysOriginal > 180) {
    // Trouver la tâche la plus longue
    let maxTaskDuration = 0;
    sortedTasks.forEach(task => {
      try {
        const startDate = parseISO(task.startDate);
        const endDate = parseISO(task.endDate);
        const duration = differenceInDays(endDate, startDate) + 1;
        if (duration > maxTaskDuration) {
          maxTaskDuration = duration;
        }
      } catch (error) {
        // Ignorer les erreurs
      }
    });

    // Calculer une plage optimale qui rend les tâches plus visibles
    // Utiliser une formule qui donne plus d'espace aux tâches
    const optimalRange = Math.max(maxTaskDuration * 4, 120);

    // Réduire la plage pour concentrer l'affichage
    // Limiter à 3 mois maximum pour que les tâches apparaissent plus longues
    const maxMonths = 3;
    const currentMonthsDiff = differenceInDays(maxDate, minDate) / 30;

    if (currentMonthsDiff > maxMonths) {
      // Limiter à 3 mois maximum
      maxDate = addMonths(minDate, maxMonths);
    }

    // Si toutes les tâches sont dans une période plus courte, ajuster la plage
    if (sortedTasks.length > 0) {
      const lastTaskEndDate = parseISO(sortedTasks[sortedTasks.length - 1].endDate);
      if (lastTaskEndDate < maxDate) {
        // Ajouter une marge de 15 jours après la dernière tâche
        maxDate = new Date(lastTaskEndDate);
        maxDate.setDate(maxDate.getDate() + 15);
      }
    }
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
      padding: '30px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'Segoe UI, Arial, sans-serif'
    }}>
      <div style={{ marginBottom: '25px', textAlign: 'center' }}>
        <h2 style={{
          color: '#333',
          fontWeight: '600',
          fontSize: '28px',
          margin: '0 0 10px 0'
        }}>
          Diagramme de Gantt
        </h2>
        <p style={{
          color: '#666',
          fontSize: '16px',
          margin: 0
        }}>
          Planification des tâches du projet sur la période {format(minDate, 'MMMM yyyy', { locale: fr })} - {format(maxDate, 'MMMM yyyy', { locale: fr })}
        </p>
      </div>

      {/* Barre de période totale du projet */}
      <div style={{
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f0f8ff',
        borderRadius: '8px',
        border: '1px solid #d1e6ff',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '10px',
          justifyContent: 'space-between'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#0d47a1'
          }}>
            Période totale du projet
          </div>
          <div style={{
            fontSize: '14px',
            color: '#555',
            backgroundColor: '#e3f2fd',
            padding: '5px 10px',
            borderRadius: '12px',
            fontWeight: '500'
          }}>
            {format(minDate, 'dd MMM yyyy', { locale: fr })} - {format(maxDate, 'dd MMM yyyy', { locale: fr })}
          </div>
        </div>

        <div style={{ position: 'relative', height: '16px', marginTop: '5px' }}>
          {/* Barre de progression du projet */}
          <div style={{
            position: 'absolute',
            left: '0',
            right: '0',
            height: '10px',
            backgroundColor: '#e0e0e0',
            borderRadius: '5px',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              left: '0',
              width: `${Math.min(100, (differenceInDays(new Date(), minDate) / differenceInDays(maxDate, minDate)) * 100)}%`,
              height: '100%',
              backgroundColor: '#2196f3',
              borderRadius: '5px'
            }}></div>
          </div>

          {/* Marqueur pour aujourd'hui */}
          <div style={{
            position: 'absolute',
            left: `${Math.min(100, (differenceInDays(new Date(), minDate) / differenceInDays(maxDate, minDate)) * 100)}%`,
            top: '-4px',
            width: '4px',
            height: '18px',
            backgroundColor: '#f44336',
            borderRadius: '2px',
            transform: 'translateX(-50%)'
          }}></div>
        </div>
      </div>

      <div style={{ overflowX: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: '8px' }}>
        <div style={{ minWidth: '1000px' }}>
          {/* En-tête avec les trimestres */}
          <div style={{ display: 'flex', backgroundColor: '#f0f4f8' }}>
            <div style={{
              width: '180px',
              flexShrink: 0,
              padding: '12px',
              fontWeight: 'bold',
              color: '#444',
              borderRight: '1px solid #e0e0e0',
              borderBottom: '1px solid #e0e0e0',
              backgroundColor: '#e6eef5'
            }}>
              Tâches
            </div>
            <div style={{ flex: 1, display: 'flex' }}>
              {quarters.map((quarter, index) => (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '12px',
                    fontWeight: 'bold',
                    color: '#444',
                    borderBottom: '1px solid #e0e0e0',
                    borderRight: index < quarters.length - 1 ? '1px solid #e0e0e0' : 'none',
                    backgroundColor: '#e6eef5'
                  }}
                >
                  {quarter.name}
                </div>
              ))}
            </div>
          </div>

          {/* En-tête avec les mois */}
          <div style={{ display: 'flex', backgroundColor: '#f8fafc' }}>
            <div style={{
              width: '180px',
              flexShrink: 0,
              padding: '10px',
              fontWeight: '500',
              color: '#555',
              borderRight: '1px solid #e0e0e0',
              borderBottom: '2px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              backgroundColor: '#f0f4f8'
            }}>
              <span>Nom</span>
              <span>Durée (j)</span>
            </div>
            <div style={{ flex: 1, display: 'flex' }}>
              {months.map((month, index) => (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '10px',
                    fontWeight: '500',
                    color: '#555',
                    borderBottom: '2px solid #e0e0e0',
                    borderRight: '1px solid #e0e0e0',
                    backgroundColor: index % 2 === 0 ? '#f0f4f8' : '#f8fafc'
                  }}
                >
                  {month.name}
                </div>
              ))}
            </div>
          </div>

          {/* Lignes des tâches */}
          {sortedTasks.map((task, index) => {
            try {
              const startDate = parseISO(task.startDate);
              const endDate = parseISO(task.endDate);

              // Calculer la position de début et de fin en pourcentage
              const totalDays = differenceInDays(maxDate, minDate) + 1;
              const startOffset = differenceInDays(startDate, minDate);
              const taskDuration = differenceInDays(endDate, startDate) + 1;

              // Étirer les tâches pour qu'elles apparaissent plus longues
              // Facteur d'étirement pour rendre les barres plus longues
              const stretchFactor = 2.5; // Facteur augmenté pour des barres beaucoup plus longues

              // Calculer les pourcentages avec le facteur d'étirement
              let startPercent = (startOffset / totalDays) * 100;
              let widthPercent = (taskDuration / totalDays) * 100 * stretchFactor;

              // S'assurer que les barres ne dépassent pas la largeur totale
              if (startPercent + widthPercent > 100) {
                widthPercent = 100 - startPercent;
              }

              // Assurer une largeur minimale pour les tâches très courtes
              if (widthPercent < 5) {
                widthPercent = 5;
              }

              // Couleur de la tâche basée sur le statut et le retard
              const taskColor = getStatusColor(task);

              // Formater les dates pour l'affichage
              const formattedStartDate = format(startDate, 'dd/MM/yyyy', { locale: fr });
              const formattedEndDate = format(endDate, 'dd/MM/yyyy', { locale: fr });

              return (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    borderBottom: '1px solid #e0e0e0',
                    height: '50px',
                    alignItems: 'center',
                    backgroundColor: index % 2 === 0 ? '#fff' : '#f9fafc',
                    transition: 'background-color 0.2s',
                    ':hover': {
                      backgroundColor: '#f0f4f8'
                    }
                  }}
                >
                  <div style={{
                    width: '250px',
                    flexShrink: 0,
                    padding: '10px',
                    borderRight: '1px solid #e0e0e0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      fontWeight: '600',
                      color: '#333',
                      fontSize: '14px',
                      marginBottom: '4px'
                    }}>
                      {task.title}
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        fontSize: '12px',
                        color: '#666',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span>{formattedStartDate}</span>
                        <span>→</span>
                        <span>{formattedEndDate}</span>
                      </div>
                      <div style={{
                        backgroundColor: '#e6eef5',
                        color: '#444',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {taskDuration}j
                      </div>
                    </div>
                  </div>

                  <div style={{
                    flex: 1,
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {/* Ligne pointillée horizontale */}
                    <div style={{
                      position: 'absolute',
                      width: '100%',
                      height: '1px',
                      borderTop: '1px dashed #ccc',
                      top: '50%',
                      zIndex: 1
                    }}></div>

                    {/* Barre de la tâche */}
                    <div style={{
                      position: 'absolute',
                      left: `${Math.max(0, startPercent)}%`,
                      width: `${Math.min(100 - startPercent, widthPercent)}%`,
                      height: '32px',
                      backgroundColor: taskColor,
                      borderRadius: '16px',
                      zIndex: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#333',
                      fontWeight: '600',
                      fontSize: '14px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      border: '2px solid rgba(255,255,255,0.4)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      ':hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 12px rgba(0,0,0,0.25)'
                      }
                    }}>


                      {widthPercent > 12 ? (
                        <div style={{
                          padding: '0 15px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          width: '100%',
                          justifyContent: 'space-between'
                        }}>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}>
                            <span style={{
                              fontWeight: '600',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '150px'
                            }}>
                              {task.title}
                            </span>
                            {widthPercent > 25 && (
                              <span style={{
                                fontSize: '11px',
                                opacity: 0.8,
                                marginTop: '2px'
                              }}>
                                {formattedStartDate} - {formattedEndDate}
                              </span>
                            )}
                          </div>
                          <div style={{
                            backgroundColor: 'rgba(255,255,255,0.3)',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap'
                          }}>
                            {taskDuration}j
                          </div>
                        </div>
                      ) : widthPercent > 5 ? (
                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{taskDuration}j</span>
                      ) : null}
                    </div>

                    {/* Point à la fin de la tâche */}
                    <div style={{
                      position: 'absolute',
                      left: `${Math.min(100, startPercent + widthPercent)}%`,
                      width: '14px',
                      height: '14px',
                      backgroundColor: '#333',
                      borderRadius: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 3,
                      boxShadow: '0 0 0 3px white, 0 0 0 5px rgba(0,0,0,0.1)',
                      border: '2px solid ' + taskColor
                    }}></div>

                    {/* Barre de retard plus visible */}
                    {isTaskDelayed(task) && calculateDelayDays(task) > 0 && (
                      <div style={{
                        position: 'absolute',
                        left: `${Math.min(100, startPercent + widthPercent)}%`,
                        width: `${Math.min(25, calculateDelayDays(task) / 1.5)}%`, // Largeur plus grande pour plus de visibilité
                        height: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 2,
                        backgroundColor: 'rgba(220, 20, 60, 0.2)', // Fond rouge transparent
                        borderRadius: '6px',
                        border: '2px solid #DC143C', // Bordure rouge
                        boxShadow: '0 0 8px rgba(220, 20, 60, 0.5)', // Ombre plus visible
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {/* Texte indiquant le nombre de jours de retard */}
                        <div style={{
                          color: '#DC143C',
                          fontWeight: 'bold',
                          fontSize: '10px',
                          textShadow: '0 0 2px white',
                          whiteSpace: 'nowrap'
                        }}>
                          {calculateDelayDays(task)}j
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            } catch (error) {
              return null;
            }
          })}
        </div>
      </div>

      {/* Légende */}
      <div style={{
        marginTop: '30px',
        padding: '25px',
        backgroundColor: '#f8fafc',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        border: '1px solid #e0e0e0'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{
              marginTop: 0,
              marginBottom: 0,
              color: '#333',
              fontWeight: '600',
              fontSize: '18px'
            }}>
              Détails des tâches
            </h3>
          </div>



          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', backgroundColor: '#FF6347', borderRadius: '4px' }}></div>
              <span style={{ fontSize: '14px', color: '#555' }}>À faire</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', backgroundColor: '#808080', borderRadius: '4px' }}></div>
              <span style={{ fontSize: '14px', color: '#555' }}>À faire (en retard)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', backgroundColor: '#FFD700', borderRadius: '4px' }}></div>
              <span style={{ fontSize: '14px', color: '#555' }}>En cours</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', backgroundColor: '#90EE90', borderRadius: '4px' }}></div>
              <span style={{ fontSize: '14px', color: '#555' }}>Terminé</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '40px',
                height: '12px',
                backgroundColor: 'rgba(220, 20, 60, 0.2)',
                borderRadius: '6px',
                border: '2px solid #DC143C',
                boxShadow: '0 0 8px rgba(220, 20, 60, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  color: '#DC143C',
                  fontWeight: 'bold',
                  fontSize: '9px',
                  textShadow: '0 0 2px white'
                }}>
                  5j
                </div>
              </div>
              <span style={{ fontSize: '14px', color: '#555' }}>Jours de retard</span>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          justifyContent: 'flex-start'
        }}>
          {sortedTasks.slice(0, 5).map((task, index) => {
            try {
              const startDate = parseISO(task.startDate);
              const endDate = parseISO(task.endDate);
              const taskDuration = differenceInDays(endDate, startDate) + 1;

              return (
                <div key={index} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
                  border: '1px solid #e0e0e0',
                  width: 'calc(50% - 10px)',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      backgroundColor: getStatusColor(task),
                      marginRight: '10px',
                      borderRadius: '4px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}></div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#333',
                      flex: 1
                    }}>
                      {task.title}
                    </div>
                    <div style={{
                      backgroundColor: '#e6eef5',
                      color: '#444',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {taskDuration}j
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    gap: '8px 15px',
                    fontSize: '13px',
                    color: '#555'
                  }}>
                    <div style={{ fontWeight: '500' }}>Début:</div>
                    <div>{format(startDate, 'dd MMMM yyyy', { locale: fr })}</div>

                    <div style={{ fontWeight: '500' }}>Fin:</div>
                    <div>{format(endDate, 'dd MMMM yyyy', { locale: fr })}</div>

                    <div style={{ fontWeight: '500' }}>Statut:</div>
                    <div style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: getStatusColor(task),
                      color: '#333',
                      fontWeight: '500',
                      fontSize: '12px'
                    }}>
                      {task.status || 'Non défini'}
                    </div>

                    {/* Afficher les détails du retard si la tâche est en retard */}
                    {isTaskDelayed(task) && (
                      <>
                        <div style={{ fontWeight: '500', color: '#DC143C' }}>Retard:</div>
                        <div style={{ color: '#DC143C', fontWeight: '500' }}>
                          {calculateDelayDays(task)} jours
                          {task.status?.toLowerCase().includes('faire') ?
                            " (tâche non commencée)" :
                            task.status?.toLowerCase().includes('cours') ?
                              " (tâche en cours)" : ""}
                        </div>
                      </>
                    )}

                    {task.description && (
                      <>
                        <div style={{ fontWeight: '500' }}>Description:</div>
                        <div style={{
                          fontSize: '12px',
                          color: '#666',
                          maxHeight: '40px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {task.description}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            } catch (error) {
              return null;
            }
          })}
        </div>
      </div>

      {/* Explication des retards en bas du diagramme */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        marginTop: '30px',
        border: '1px solid #e9ecef',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
      }}>
        <p style={{ fontSize: '16px', color: '#333', marginBottom: '10px', fontWeight: 'bold' }}>
          Explication des retards :
        </p>
        <ul style={{ fontSize: '14px', color: '#555', paddingLeft: '25px', margin: '0' }}>
          <li style={{ marginBottom: '8px' }}>
            Les tâches <strong style={{ color: '#808080' }}>grises</strong> sont des tâches "à faire" qui auraient déjà dû commencer.
          </li>
          <li style={{ marginBottom: '8px' }}>
            Les <strong style={{ color: '#DC143C', backgroundColor: 'rgba(220, 20, 60, 0.1)', padding: '2px 5px', borderRadius: '3px' }}>barres rouges</strong> indiquent le nombre de jours de retard.
          </li>
          <li>
            Plus la barre rouge est longue, plus le retard est important.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ExactGanttChart;
