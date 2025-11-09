/**
 * API route for retrieving game history
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const variant = searchParams.get('variant');

    const where = {
      ...(variant && { variant }),
      players: {
        has: session.user.id,
      },
    };

    const [games, total] = await Promise.all([
      prisma.gameResult.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          winner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.gameResult.count({ where }),
    ]);

    return NextResponse.json({
      games: games.map(game => ({
        id: game.id,
        gameId: game.gameId,
        variant: game.variant,
        players: game.players,
        winnerId: game.winnerId,
        winner: game.winner,
        moves: game.moves,
        duration: game.duration,
        createdAt: game.createdAt,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });

  } catch (error) {
    console.error('Game history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}