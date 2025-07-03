import React from 'react';
import { Task } from 'pages/projects';

interface SimpleGanttChartProps {
  tasks: Task[];
}

const SimpleGanttChart: React.FC<SimpleGanttChartProps> = ({ tasks }) => {
  // Définir les tâches pour le diagramme de Gantt avec leurs couleurs spécifiques
  const ganttTasks = [
    { id: 1, name: 'Determine tasks', startDay: 1, endDay: 3, color: '#3f51b5' }, // Bleu foncé
    { id: 2, name: 'Identify how tasks are related', startDay: 1, endDay: 4, color: '#f44336' }, // Rouge
    { id: 3, name: 'Create a timeline', startDay: 3, endDay: 5, color: '#4caf50' }, // Vert
    { id: 4, name: 'Organize tasks', startDay: 2, endDay: 6, color: '#f44336' }, // Rouge
    { id: 5, name: 'Build Gantt chart', startDay: 4, endDay: 6, color: '#ffeb3b' }, // Jaune
    { id: 6, name: 'Share chart', startDay: 3, endDay: 7, color: '#4caf50' }, // Vert
    { id: 7, name: 'Track progress', startDay: 6, endDay: 7, color: '#3f51b5' }, // Bleu foncé
  ];

  // Nombre total de jours dans le diagramme
  const totalDays = 7;

  // Fonction pour obtenir la couleur en fonction du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return '#dc3545'; // Rouge pour "À faire"
      case 'in-progress': return '#fd7e14'; // Orange pour "En cours"
      case 'done': return '#28a745'; // Vert pour "Terminé"
      case 'waiting': return '#ffeb3b'; // Jaune pour "En attente"
      default: return '#9e9e9e'; // Gris pour les autres statuts
    }
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>

      {/* Timeline avec les jours */}
      <div style={{ display: 'flex', marginBottom: '20px', marginLeft: '250px' }}>
        {Array.from({ length: totalDays }, (_, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100px'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#333',
              marginBottom: '5px'
            }}></div>
            <div style={{ fontSize: '12px', color: '#666' }}>1/{i+1}</div>
          </div>
        ))}
      </div>

      {/* Tâches du diagramme */}
      {ganttTasks.map(task => (
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
            {task.name}
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
              left: `${(task.startDay - 1) * (100 / totalDays)}%`,
              width: `${(task.endDay - task.startDay + 1) * (100 / totalDays)}%`,
              height: '100%',
              backgroundColor: task.color,
              borderRadius: '0px'
            }}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SimpleGanttChart;
