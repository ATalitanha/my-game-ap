/**
 * API route for retrieving leaderboard data
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const variant = searchParams.get('variant');
    const limit = parseInt(searchParams.get('limit') || '10');
    const timeRange = searchParams.get('timeRange') || 'all'; // all, week, month, year

    // Calculate date filter based on time range
    const getDateFilter = () => {
      const now = new Date();
      switch (timeRange) {
        case 'week':
          return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case 'month':
          return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case 'year':
          return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        default:
          return null;
      }
    };

    const dateFilter = getDateFilter();

    // Get leaderboard data
    const leaderboard = await prisma.gameResult.groupBy({
      by: ['winnerId'],
      where: {
        ...(variant && { variant }),
        ...(dateFilter && { createdAt: { gte: dateFilter } }),
        winnerId: { not: null },
      },
      _count: {
        winnerId: true,
      },
      orderBy: {
        _count: {
          winnerId: 'desc',
        },
      },
      take: limit,
    });

    // Get user details for leaderboard
    const userIds = leaderboard.map(item => item.winnerId!);
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    // Get additional stats for each user
    const leaderboardWithStats = await Promise.all(
      leaderboard.map(async (item) => {
        const user = users.find(u => u.id === item.winnerId);
        
        // Get total games played by this user
        const totalGames = await prisma.gameResult.count({
          where: {
            players: {
              has: item.winnerId!,
            },
            ...(variant && { variant }),
            ...(dateFilter && { createdAt: { gte: dateFilter } }),
          },
        });

        // Get win rate
        const winRate = totalGames > 0 ? (item._count.winnerId / totalGames) * 100 : 0;

        return {
          user: {
            id: user?.id || item.winnerId!,
            name: user?.name || 'Unknown Player',
            email: user?.email || '',
            image: user?.image || null,
          },
          wins: item._count.winnerId,
          totalGames,
          winRate: Math.round(winRate * 100) / 100,
        };
      })
    );

    return NextResponse.json({
      leaderboard: leaderboardWithStats,
      metadata: {
        variant,
        timeRange,
        limit,
      },
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}