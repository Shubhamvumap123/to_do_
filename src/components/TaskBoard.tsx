
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useBoardContext } from '../context/BoardContext';
import Column from './Column';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const TaskBoard: React.FC = () => {
  const { 
    boardState, 
    moveTask, 
    moveColumn, 
    createColumn,
    isConnected,
    reconnect
  } = useBoardContext();
  
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  
  const onTaskDrop = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;
    
    if (!destination || (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )) {
      return;
    }
    
    if (type === 'column') {
      moveColumn(draggableId, destination.index);
      return;
    }
    
    moveTask(
      draggableId,
      source.droppableId,
      destination.droppableId,
      destination.index
    );
  };
  
  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) {
      toast.error('Column title cannot be empty');
      return;
    }
    
    createColumn(newColumnTitle);
    setNewColumnTitle('');
    setIsAddColumnDialogOpen(false);
    toast.success('Column added successfully');
  };
  
  const handleReconnect = () => {
    reconnect();
    toast.success('Reconnected to server');
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 bg-white border-b">
        <h1 className="text-2xl font-bold">Collaborative Task Board</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">
              {isConnected 
                ? `${boardState.activeUsers} ${boardState.activeUsers === 1 ? 'user' : 'users'} online` 
                : 'Disconnected'}
            </span>
          </div>
          {!isConnected && (
            <Button variant="outline" size="sm" onClick={handleReconnect}>
              Reconnect
            </Button>
          )}
          <Button onClick={() => setIsAddColumnDialogOpen(true)}>Add Column</Button>
        </div>
      </div>
      
      <DragDropContext onDragEnd={onTaskDrop}>
        <Droppable droppableId="all-columns" direction="horizontal" type="column">
          {(provided) => (
            <div 
              className="flex p-4 overflow-x-auto h-full bg-board-bg"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {boardState.columnOrder.map((columnId, index) => {
                const column = boardState.columns[columnId];
                const tasks = column.taskIds.map(taskId => boardState.tasks[taskId]);
                
                return (
                  <Draggable
                    key={column.id}
                    draggableId={column.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <Column 
                          column={column} 
                          tasks={tasks} 
                          dragHandleProps={provided.dragHandleProps}
                        />
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      <Dialog open={isAddColumnDialogOpen} onOpenChange={setIsAddColumnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Column Title"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddColumnDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddColumn}>
              Add Column
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskBoard;
