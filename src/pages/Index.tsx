
import React from 'react';
import TaskBoard from '@/components/TaskBoard';
import UserStatusBar from '@/components/UserStatusBar';
import { TaskBoardProvider } from '@/context/BoardContext';
import { Toaster } from 'sonner';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TaskBoardProvider>
        <div className="flex-grow flex flex-col h-[calc(100vh-40px)]">
          <TaskBoard />
        </div>
        <UserStatusBar />
        <Toaster position="top-right" richColors />
      </TaskBoardProvider>
    </div>
  );
};

export default Index;
