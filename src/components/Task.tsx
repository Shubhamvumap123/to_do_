
import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { useBoardContext, Task as TaskType } from '../context/BoardContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

interface TaskProps {
  task: TaskType;
  index: number;
  columnId: string;
}

const Task: React.FC<TaskProps> = ({ task, index, columnId }) => {
  const { updateTask, deleteTask, boardState } = useBoardContext();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  
  const isBeingEdited = boardState.userActivity[task.id]?.action === 'updated';
  const isBeingMoved = boardState.userActivity[task.id]?.action === 'moved';
  
  const handleUpdateTask = () => {
    if (!editTitle.trim()) {
      toast.error('Task title cannot be empty');
      return;
    }
    
    updateTask(task.id, editTitle, editDescription || undefined);
    setIsEditDialogOpen(false);
    toast.success('Task updated successfully');
  };
  
  const handleDeleteTask = () => {
    deleteTask(task.id, columnId);
    toast.success('Task deleted successfully');
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Card
          className={`mb-2 shadow-sm ${snapshot.isDragging ? 'opacity-75' : ''} ${
            isBeingEdited || isBeingMoved ? 'ring-2 ring-blue-400 animate-pulse-light' : ''
          }`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <CardContent className="p-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-medium text-sm">{task.title}</h3>
                {task.description && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {task.description}
                  </p>
                )}
                <div className="text-xs text-gray-400 mt-2">
                  Updated: {formatDate(task.updatedAt)}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => {
                    setEditTitle(task.title);
                    setEditDescription(task.description || '');
                    setIsEditDialogOpen(true);
                  }}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500" onClick={handleDeleteTask}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
};

export default Task;
