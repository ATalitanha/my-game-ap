/**
 * Socket.IO server configuration for real-time multiplayer
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { prisma } from '@/lib/prisma';
import { validateMove, checkWinner, makeMove } from '@/lib/gameLogic';
import { GameRoom, GameState, Move, Player } from '@/types/game';

export interface SocketWithAuth extends Socket {
  userId?: string;
  username?: string;
}

export class GameSocketServer {
  private io: SocketIOServer;
  private rooms: Map<string, GameRoom> = new Map();
  private playerRooms: Map<string, string> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.initializeSocketHandlers();
  }

  private initializeSocketHandlers() {
    this.io.on('connection', (socket: SocketWithAuth) => {
      console.log('User connected:', socket.id);

      socket.on('authenticate', (data: { userId: string; username: string }) => {
        socket.userId = data.userId;
        socket.username = data.username;
        console.log(`User authenticated: ${data.username} (${data.userId})`);
      });

      socket.on('join-lobby', () => {
        this.handleJoinLobby(socket);
      });

      socket.on('create-room', (data: { variant: string }) => {
        this.handleCreateRoom(socket, data.variant);
      });

      socket.on('join-room', (data: { roomId: string }) => {
        this.handleJoinRoom(socket, data.roomId);
      });

      socket.on('leave-room', (data: { roomId: string }) => {
        this.handleLeaveRoom(socket, data.roomId);
      });

      socket.on('make-move', async (data: { roomId: string; move: Move }) => {
        await this.handleMakeMove(socket, data.roomId, data.move);
      });

      socket.on('game-ready', (data: { roomId: string }) => {
        this.handleGameReady(socket, data.roomId);
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  private handleJoinLobby(socket: SocketWithAuth) {
    socket.join('lobby');
    
    const publicRooms = Array.from(this.rooms.values())
      .filter(room => room.status === 'waiting' && room.players.length < 2)
      .map(room => ({
        id: room.id,
        name: room.name,
        variant: room.variant,
        players: room.players.length,
        maxPlayers: room.maxPlayers,
      }));

    socket.emit('lobby-rooms', publicRooms);
  }

  private handleCreateRoom(socket: SocketWithAuth, variant: string) {
    if (!socket.userId) {
      socket.emit('error', { message: 'User not authenticated' });
      return;
    }

    const roomId = this.generateRoomId();
    const room: GameRoom = {
      id: roomId,
      name: `${socket.username}'s Game`,
      variant: variant as any,
      status: 'waiting',
      players: [{
        id: socket.userId,
        name: socket.username || 'Player 1',
        symbol: 'X',
        isOnline: true,
        socketId: socket.id,
      }],
      maxPlayers: 2,
      gameState: null,
      currentPlayer: 0,
      createdAt: new Date(),
    };

    this.rooms.set(roomId, room);
    this.playerRooms.set(socket.userId, roomId);
    socket.join(roomId);

    socket.emit('room-created', { roomId, room });
    this.broadcastLobbyUpdate();
  }

  private handleJoinRoom(socket: SocketWithAuth, roomId: string) {
    if (!socket.userId) {
      socket.emit('error', { message: 'User not authenticated' });
      return;
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }

    if (room.players.some(p => p.id === socket.userId)) {
      socket.emit('error', { message: 'Already in room' });
      return;
    }

    const player: Player = {
      id: socket.userId,
      name: socket.username || `Player ${room.players.length + 1}`,
      symbol: room.players.length === 0 ? 'X' : 'O',
      isOnline: true,
      socketId: socket.id,
    };

    room.players.push(player);
    this.playerRooms.set(socket.userId, roomId);
    socket.join(roomId);

    // Initialize game state when room is full
    if (room.players.length === room.maxPlayers) {
      room.status = 'playing';
      room.gameState = {
        board: [],
        currentPlayer: 0,
        status: 'playing',
        variant: room.variant,
        players: room.players,
        moves: [],
        winner: null,
        winningLine: null,
      };
    }

    this.io.to(roomId).emit('player-joined', { room, player });
    this.broadcastLobbyUpdate();
  }

  private handleLeaveRoom(socket: SocketWithAuth, roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const playerIndex = room.players.findIndex(p => p.id === socket.userId);
    if (playerIndex !== -1) {
      room.players.splice(playerIndex, 1);
      room.players.forEach(p => p.isOnline = false);
      
      if (room.players.length === 0) {
        this.rooms.delete(roomId);
      } else {
        room.status = 'waiting';
        room.gameState = null;
      }

      this.playerRooms.delete(socket.userId!);
      socket.leave(roomId);
      
      this.io.to(roomId).emit('player-left', { room });
      this.broadcastLobbyUpdate();
    }
  }

  private async handleMakeMove(socket: SocketWithAuth, roomId: string, move: Move) {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameState) {
      socket.emit('error', { message: 'Invalid game state' });
      return;
    }

    const player = room.players.find(p => p.id === socket.userId);
    if (!player) {
      socket.emit('error', { message: 'Player not in room' });
      return;
    }

    // Validate it's player's turn
    if (room.players[room.gameState.currentPlayer].id !== socket.userId) {
      socket.emit('error', { message: 'Not your turn' });
      return;
    }

    // Validate move
    if (!validateMove(room.gameState, move)) {
      socket.emit('error', { message: 'Invalid move' });
      return;
    }

    try {
      // Make the move
      const newGameState = makeMove(room.gameState, move);
      room.gameState = newGameState;
      room.gameState.currentPlayer = (room.gameState.currentPlayer + 1) % room.players.length;

      // Check for winner
      const winner = checkWinner(newGameState);
      if (winner) {
        newGameState.winner = winner;
        newGameState.status = 'finished';
        room.status = 'finished';
        
        // Save game result to database
        await this.saveGameResult(room, newGameState);
      } else if (newGameState.status === 'draw') {
        room.status = 'finished';
        await this.saveGameResult(room, newGameState);
      }

      this.io.to(roomId).emit('move-made', { 
        roomId, 
        gameState: newGameState,
        move,
        player: player.name,
      });

      if (newGameState.status === 'finished') {
        this.io.to(roomId).emit('game-ended', { 
          roomId, 
          gameState: newGameState,
        });
      }

    } catch (error) {
      console.error('Move error:', error);
      socket.emit('error', { message: 'Move failed' });
    }
  }

  private handleGameReady(socket: SocketWithAuth, roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameState) return;

    socket.emit('game-state', { gameState: room.gameState });
  }

  private handleDisconnect(socket: SocketWithAuth) {
    console.log('User disconnected:', socket.id);
    
    const roomId = this.playerRooms.get(socket.userId!);
    if (roomId) {
      this.handleLeaveRoom(socket, roomId);
    }
  }

  private generateRoomId(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  private broadcastLobbyUpdate() {
    const publicRooms = Array.from(this.rooms.values())
      .filter(room => room.status === 'waiting' && room.players.length < 2)
      .map(room => ({
        id: room.id,
        name: room.name,
        variant: room.variant,
        players: room.players.length,
        maxPlayers: room.maxPlayers,
      }));

    this.io.to('lobby').emit('lobby-rooms', publicRooms);
  }

  private async saveGameResult(room: GameRoom, gameState: GameState) {
    try {
      await prisma.gameResult.create({
        data: {
          gameId: room.id,
          variant: room.variant,
          players: room.players.map(p => p.id),
          winnerId: gameState.winner?.playerId || null,
          moves: gameState.moves.length,
          duration: Date.now() - room.createdAt.getTime(),
          gameState: JSON.stringify(gameState),
        },
      });
    } catch (error) {
      console.error('Failed to save game result:', error);
    }
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}

let socketServer: GameSocketServer | null = null;

export function initializeSocketServer(server: HTTPServer): GameSocketServer {
  if (!socketServer) {
    socketServer = new GameSocketServer(server);
  }
  return socketServer;
}

export function getSocketServer(): GameSocketServer | null {
  return socketServer;
}