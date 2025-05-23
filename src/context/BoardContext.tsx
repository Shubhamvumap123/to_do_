
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import io, { Socket } from 'socket.io-client';

// Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

interface BoardState {
  tasks: { [key: string]: Task };
  columns: { [key: string]: Column };
  columnOrder: string[];
  activeUsers: number;
  userActivity: { [key: string]: { task: string; action: string } };
}

interface BoardContextProps {
  boardState: BoardState;
  createTask: (columnId: string, title: string, description?: string) => void;
  updateTask: (taskId: string, title: string, description?: string) => void;
  deleteTask: (taskId: string, columnId: string) => void;
  createColumn: (title: string) => void;
  updateColumn: (columnId: string, title: string) => void;
  deleteColumn: (columnId: string) => void;
  moveTask: (taskId: string, sourceColumnId: string, destinationColumnId: string, newIndex: number) => void;
  moveColumn: (columnId: string, newIndex: number) => void;
  socket: Socket | null;
  isConnected: boolean;
  reconnect: () => void;
}

const defaultBoardState: BoardState = {
  tasks: {},
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'To Do',
      taskIds: []
    },
    'column-2': {
      id: 'column-2',
      title: 'In Progress',
      taskIds: []
    },
    'column-3': {
      id: 'column-3',
      title: 'Done',
      taskIds: []
    }
  },
  columnOrder: ['column-1', 'column-2', 'column-3'],
  activeUsers: 1, // Start with the current user
  userActivity: {}
};

// Create the context
const BoardContext = createContext<BoardContextProps | undefined>(undefined);

// Socket.io server URL - in a production environment, this would be configured properly
const SOCKET_URL = 'https://socket-io-server-url.example.com';

export const TaskBoardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [boardState, setBoardState] = useState<BoardState>(defaultBoardState);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);


  const setupSocketConnection = useCallback(() => {
    
    console.log('Initializing socket connection...');
    
 
    const mockSocket = {
      on: (event: string, callback: (...args: any[]) => void) => {
        console.log(`Socket registered event: ${event}`);
        return mockSocket;
      },
      emit: (event: string, ...args: any[]) => {
        console.log(`Socket emitted event: ${event}`, args);
        return mockSocket;
      },
      disconnect: () => {
        console.log('Socket disconnected');
      },
      connect: () => {
        console.log('Socket connected');
      },
      connected: true,
      id: 'mock-socket-id'
    } as unknown as Socket;
    
    setSocket(mockSocket);
    setIsConnected(true);
    
 
    setBoardState(prev => ({
      ...prev,
      activeUsers: prev.activeUsers + 1
    }));
    
    return mockSocket;
  }, []);

  useEffect(() => {
    const newSocket = setupSocketConnection();
    
   
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [setupSocketConnection]);

  const reconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
    }
    setupSocketConnection();
  }, [socket, setupSocketConnection]);


  const createTask = useCallback((columnId: string, title: string, description?: string) => {
    const newTaskId = `task-${uuidv4()}`;
    const now = new Date().toISOString();
    
    const newTask: Task = {
      id: newTaskId,
      title,
      description,
      createdAt: now,
      updatedAt: now
    };
    
    setBoardState(prevState => {
      const column = prevState.columns[columnId];
      const newTaskIds = Array.from(column.taskIds);
      newTaskIds.push(newTaskId);
      
      return {
        ...prevState,
        tasks: {
          ...prevState.tasks,
          [newTaskId]: newTask
        },
        columns: {
          ...prevState.columns,
          [columnId]: {
            ...column,
            taskIds: newTaskIds
          }
        },
        userActivity: {
          ...prevState.userActivity,
          [newTaskId]: { task: newTaskId, action: 'created' }
        }
      };
    });

    if (socket) {
      socket.emit('createTask', { columnId, task: newTask });
    }
  }, [socket]);

  const updateTask = useCallback((taskId: string, title: string, description?: string) => {
    setBoardState(prevState => {
      const task = prevState.tasks[taskId];
      
      if (!task) return prevState;
      
      const updatedTask = {
        ...task,
        title,
        description,
        updatedAt: new Date().toISOString()
      };
      
      return {
        ...prevState,
        tasks: {
          ...prevState.tasks,
          [taskId]: updatedTask
        },
        userActivity: {
          ...prevState.userActivity,
          [taskId]: { task: taskId, action: 'updated' }
        }
      };
    });
    

    if (socket) {
      socket.emit('updateTask', { taskId, title, description });
    }
  }, [socket]);

  const deleteTask = useCallback((taskId: string, columnId: string) => {
    setBoardState(prevState => {
      const column = prevState.columns[columnId];
      const newTaskIds = column.taskIds.filter(id => id !== taskId);
      
      const newTasks = { ...prevState.tasks };
      delete newTasks[taskId];
      
      const newUserActivity = { ...prevState.userActivity };
      delete newUserActivity[taskId];
      
      return {
        ...prevState,
        tasks: newTasks,
        columns: {
          ...prevState.columns,
          [columnId]: {
            ...column,
            taskIds: newTaskIds
          }
        },
        userActivity: newUserActivity
      };
    });
    

    if (socket) {
      socket.emit('deleteTask', { taskId, columnId });
    }
  }, [socket]);


  const createColumn = useCallback((title: string) => {
    const newColumnId = `column-${uuidv4()}`;
    
    const newColumn: Column = {
      id: newColumnId,
      title,
      taskIds: []
    };
    
    setBoardState(prevState => {
      return {
        ...prevState,
        columns: {
          ...prevState.columns,
          [newColumnId]: newColumn
        },
        columnOrder: [...prevState.columnOrder, newColumnId]
      };
    });
    
   
    if (socket) {
      socket.emit('createColumn', { column: newColumn });
    }
  }, [socket]);

  const updateColumn = useCallback((columnId: string, title: string) => {
    setBoardState(prevState => {
      const column = prevState.columns[columnId];
      
      if (!column) return prevState;
      
      return {
        ...prevState,
        columns: {
          ...prevState.columns,
          [columnId]: {
            ...column,
            title
          }
        }
      };
    });
    

    if (socket) {
      socket.emit('updateColumn', { columnId, title });
    }
  }, [socket]);

  const deleteColumn = useCallback((columnId: string) => {
    setBoardState(prevState => {
    
      const column = prevState.columns[columnId];
      const newTasks = { ...prevState.tasks };
      
      column.taskIds.forEach(taskId => {
        delete newTasks[taskId];
      });
      
  
      const newColumns = { ...prevState.columns };
      delete newColumns[columnId];
      
      const newColumnOrder = prevState.columnOrder.filter(id => id !== columnId);
      
      return {
        ...prevState,
        tasks: newTasks,
        columns: newColumns,
        columnOrder: newColumnOrder
      };
    });
    

    if (socket) {
      socket.emit('deleteColumn', { columnId });
    }
  }, [socket]);

  // Drag and drop operations
  const moveTask = useCallback((
    taskId: string, 
    sourceColumnId: string, 
    destinationColumnId: string, 
    newIndex: number
  ) => {
    setBoardState(prevState => {
      const sourceColumn = prevState.columns[sourceColumnId];
      const destinationColumn = prevState.columns[destinationColumnId];
      
  
      const sourceTaskIds = Array.from(sourceColumn.taskIds);
      const sourceIndex = sourceTaskIds.indexOf(taskId);
      sourceTaskIds.splice(sourceIndex, 1);
      
    
      const destinationTaskIds = 
        sourceColumnId === destinationColumnId 
          ? sourceTaskIds 
          : Array.from(destinationColumn.taskIds);
      
      destinationTaskIds.splice(newIndex, 0, taskId);
      
      return {
        ...prevState,
        columns: {
          ...prevState.columns,
          [sourceColumnId]: {
            ...sourceColumn,
            taskIds: sourceTaskIds
          },
          [destinationColumnId]: {
            ...destinationColumn,
            taskIds: destinationTaskIds
          }
        },
        userActivity: {
          ...prevState.userActivity,
          [taskId]: { task: taskId, action: 'moved' }
        }
      };
    });
    
    // Emit event for real-time sync
    if (socket) {
      socket.emit('moveTask', { 
        taskId, 
        sourceColumnId, 
        destinationColumnId, 
        newIndex 
      });
    }
  }, [socket]);

  const moveColumn = useCallback((columnId: string, newIndex: number) => {
    setBoardState(prevState => {
      const columnOrder = Array.from(prevState.columnOrder);
      const oldIndex = columnOrder.indexOf(columnId);
      
      columnOrder.splice(oldIndex, 1);
      columnOrder.splice(newIndex, 0, columnId);
      
      return {
        ...prevState,
        columnOrder
      };
    });
    
 
    if (socket) {
      socket.emit('moveColumn', { columnId, newIndex });
    }
  }, [socket]);

  return (
    <BoardContext.Provider
      value={{
        boardState,
        createTask,
        updateTask,
        deleteTask,
        createColumn,
        updateColumn,
        deleteColumn,
        moveTask,
        moveColumn,
        socket,
        isConnected,
        reconnect
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};

export const useBoardContext = () => {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useBoardContext must be used within a TaskBoardProvider');
  }
  return context;
};
