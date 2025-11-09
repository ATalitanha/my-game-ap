/**
 * Socket.IO client hook for real-time multiplayer
 */

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { GameRoom, GameState, Move } from '@/types/game';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  rooms: any[];
  currentRoom: GameRoom | null;
  gameState: GameState | null;
  joinLobby: () => void;
  createRoom: (variant: string) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  makeMove: (roomId: string, move: Move) => void;
  error: string | null;
}

export const useSocket = (): UseSocketReturn => {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Initialize socket connection
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      auth: {
        token: session.user.id,
      },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
      
      // Authenticate with the server
      socket.emit('authenticate', {
        userId: session.user.id,
        username: session.user.name || session.user.email,
      });
      
      // Join lobby
      socket.emit('join-lobby');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    socket.on('lobby-rooms', (roomsData) => {
      setRooms(roomsData);
    });

    socket.on('room-created', (data) => {
      setCurrentRoom(data.room);
      setGameState(data.room.gameState);
    });

    socket.on('player-joined', (data) => {
      setCurrentRoom(data.room);
      setGameState(data.room.gameState);
    });

    socket.on('player-left', (data) => {
      setCurrentRoom(data.room);
      setGameState(data.room.gameState);
    });

    socket.on('move-made', (data) => {
      setGameState(data.gameState);
      setCurrentRoom(prev => prev ? { ...prev, gameState: data.gameState } : null);
    });

    socket.on('game-ended', (data) => {
      setGameState(data.gameState);
      setCurrentRoom(prev => prev ? { ...prev, gameState: data.gameState, status: 'finished' } : null);
    });

    socket.on('game-state', (data) => {
      setGameState(data.gameState);
    });

    socket.on('error', (errorData) => {
      setError(errorData.message);
      console.error('Socket error:', errorData.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [session]);

  const joinLobby = () => {
    if (socketRef.current) {
      socketRef.current.emit('join-lobby');
    }
  };

  const createRoom = (variant: string) => {
    if (socketRef.current) {
      socketRef.current.emit('create-room', { variant });
    }
  };

  const joinRoom = (roomId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join-room', { roomId });
    }
  };

  const leaveRoom = (roomId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave-room', { roomId });
      setCurrentRoom(null);
      setGameState(null);
    }
  };

  const makeMove = (roomId: string, move: Move) => {
    if (socketRef.current) {
      socketRef.current.emit('make-move', { roomId, move });
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    rooms,
    currentRoom,
    gameState,
    joinLobby,
    createRoom,
    joinRoom,
    leaveRoom,
    makeMove,
    error,
  };
};