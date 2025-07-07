declare module 'react-beautiful-dnd' {
  import * as React from 'react';

  export interface DraggableProps {
    draggableId: string;
    index: number;
    children: (provided: any, snapshot: any) => React.ReactElement;
  }

  export interface DroppableProps {
    droppableId: string;
    children: (provided: any, snapshot: any) => React.ReactElement;
  }

  export interface DragDropContextProps {
    onDragEnd: (result: any) => void;
    children: React.ReactNode;
  }

  export class Droppable extends React.Component<DroppableProps> {}
  export class Draggable extends React.Component<DraggableProps> {}
  export class DragDropContext extends React.Component<DragDropContextProps> {}
}
