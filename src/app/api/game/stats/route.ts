/**
 * API route for retrieving player statistics
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

    const userId = session.user.id;

    // Get total games played
    const totalGames = await prisma.gameResult.count({
      where: {
        players: {
          has: userId,
        },
      },
    });

    // Get games won
    const gamesWon = await prisma.gameResult.count({
      where: {
        winnerId: userId,
      },
    });

    // Get games by variant
    const gamesByVariant = await prisma.gameResult.groupBy({
      by: ['variant'],
      where: {
        players: {
          has: userId,
        },
      },
      _count: {
        id: true,
      },
    });

    // Get recent games
    const recentGames = await prisma.gameResult.findMany({
      where: {
        players: {
          has: userId,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        winner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Calculate win rate
    const winRate = totalGames > 0 ? (gamesWon / totalGames) * 100 : 0;

    return NextResponse.json({
      stats: {
        totalGames,
        gamesWon,
        gamesLost: totalGames - gamesWon,
        winRate: Math.round(winRate * 100) / 100,
        gamesByVariant: gamesByVariant.map(g => ({
          variant: g.variant,
          count: g._count.id,
        })),
        recentGames: recentGames.map(game => ({
          id: game.id,
          gameId: game.gameId,
          variant: game.variant,
          winnerId: game.winnerId,
          winner: game.winner,
          moves: game.moves,
          duration: game.duration,
          createdAt: game.createdAt,
          isWin: game.winnerId === userId,
        })),
      },
    });

  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}