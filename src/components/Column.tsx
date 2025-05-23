
import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { useBoardContext, Task as TaskType } from '../context/BoardContext';
import Task from './Task';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { MoreHorizontal, Plus, X, Pencil, Trash2 } from 'lucide-react';

interface ColumnProps {
  column: {
    id: string;
    title: string;
  };
  tasks: TaskType[];
  dragHandleProps?: DraggableProvidedDragHandleProps;
}

const getColumnColor = (title: string): string => {
  title = title.toLowerCase();
  if (title.includes('to do') || title.includes('todo')) return 'bg-board-column-todo';
  if (title.includes('progress') || title.includes('doing')) return 'bg-board-column-inprogress';
  if (title.includes('done') || title.includes('complete')) return 'bg-board-column-done';
  return 'bg-board-column-bg';
};

const Column: React.FC<ColumnProps> = ({ column, tasks, dragHandleProps }) => {
  const { createTask, updateColumn, deleteColumn } = useBoardContext();
  
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isEditColumnDialogOpen, setIsEditColumnDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [editColumnTitle, setEditColumnTitle] = useState(column.title);
  
  const handleAddTask = () => {
    if (!newTaskTitle.trim()) {
      toast.error('Task title cannot be empty');
      return;
    }
    
    createTask(column.id, newTaskTitle, newTaskDescription);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setIsAddTaskDialogOpen(false);
    toast.success('Task added successfully');
  };
  
  const handleUpdateColumn = () => {
    if (!editColumnTitle.trim()) {
      toast.error('Column title cannot be empty');
      return;
    }
    
    updateColumn(column.id, editColumnTitle);
    setIsEditColumnDialogOpen(false);
    toast.success('Column updated successfully');
  };
  
  const handleDeleteColumn = () => {
    if (tasks.length > 0) {
      if (!confirm(`This column contains ${tasks.length} tasks. Are you sure you want to delete it?`)) {
        return;
      }
    }
    
    deleteColumn(column.id);
    toast.success('Column deleted successfully');
  };
  
  const columnColor = getColumnColor(column.title);
  
  return (
    <div className={`flex flex-col w-72 mx-2 rounded-lg ${columnColor} shadow-sm`}>
      <div 
        className="flex justify-between items-center p-2 font-semibold border-b"
        {...dragHandleProps}
      >
        <h2 className="text-lg">{column.title}</h2>
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setIsAddTaskDialogOpen(true)}
          >
            <Plus className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => {
                setEditColumnTitle(column.title);
                setIsEditColumnDialogOpen(true);
              }}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Column
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-500" onClick={handleDeleteColumn}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <Droppable droppableId={column.id} type="task">
        {(provided, snapshot) => (
          <div
            className={`flex-grow p-2 min-h-[200px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-50' : ''
            }`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tasks.map((task, index) => (
              <Task key={task.id} task={task} index={index} columnId={column.id} />
            ))}
            {provided.placeholder}
            {tasks.length === 0 && (
              <div className="h-full flex items-center justify-center text-gray-400 italic">
                No tasks
              </div>
            )}
          </div>
        )}
      </Droppable>
      
      <div className="p-2 text-sm text-gray-500">
        {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
      </div>
      
      {/* Add Task Dialog */}
      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label htmlFor="task-title" className="block text-sm font-medium mb-1">
                Title
              </label>
              <Input
                id="task-title"
                placeholder="Task Title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="task-description" className="block text-sm font-medium mb-1">
                Description (optional)
              </label>
              <Textarea
                id="task-description"
                placeholder="Task Description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask}>
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Column Dialog */}
      <Dialog open={isEditColumnDialogOpen} onOpenChange={setIsEditColumnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Column</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Column Title"
              value={editColumnTitle}
              onChange={(e) => setEditColumnTitle(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditColumnDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateColumn}>
              Update Column
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Column;
