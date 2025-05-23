
import React from 'react';
import { useBoardContext } from '../context/BoardContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const UserStatusBar: React.FC = () => {
  const { boardState, isConnected, reconnect } = useBoardContext();
  
  const handleReconnect = () => {
    reconnect();
    toast.success('Reconnected to server');
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 p-2 bg-white border-t flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        <div className="text-sm">
          {boardState.activeUsers} {boardState.activeUsers === 1 ? 'user' : 'users'} online
        </div>
      </div>
      
      {!isConnected && (
        <Button variant="outline" size="sm" onClick={handleReconnect}>
          Reconnect
        </Button>
      )}
    </div>
  );
};

export default UserStatusBar;
