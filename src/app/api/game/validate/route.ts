/**
 * API route for validating game moves
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { validateMove } from '@/lib/gameLogic';
import { GameState, Move } from '@/types/game';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { gameState, move }: { gameState: GameState; move: Move } = body;

    if (!gameState || !move) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const isValid = validateMove(gameState, move);
    
    return NextResponse.json({
      valid: isValid,
      message: isValid ? 'Move is valid' : 'Invalid move',
    });

  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}