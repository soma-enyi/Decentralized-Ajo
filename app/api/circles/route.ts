import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

// POST - Create a new circle
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      category,
      contributionAmount,
      contributionFrequencyDays,
      maxRounds,
    } = body;

    // Valid categories enum
    const validCategories = [
      'GENERAL',
      'EDUCATION',
      'MEDICAL',
      'BUSINESS',
      'HOUSING',
      'EMERGENCY',
      'INVESTMENT',
      'COMMUNITY',
      'FAMILY',
      'TRAVEL',
    ];

    // Validate category if provided
    if (category) {
      const normalizedCategory = category.trim().toUpperCase();
      if (!validCategories.includes(normalizedCategory)) {
        return NextResponse.json(
          { 
            error: 'Invalid category',
            validCategories: validCategories,
          },
          { status: 400 }
        );
      }
    }

    // Validate inputs
    if (!name || contributionAmount <= 0 || contributionFrequencyDays <= 0 || maxRounds <= 0) {
      return NextResponse.json(
        { error: 'Invalid input parameters' },
        { status: 400 }
      );
    }

    // Create circle
    const circle = await prisma.circle.create({
      data: {
        name,
        description,
        category: category ? category.trim().toUpperCase() : 'GENERAL',
        organizerId: payload.userId,
        contributionAmount,
        contributionFrequencyDays,
        maxRounds,
      },
      include: {
        organizer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        members: true,
      },
    });

    // Add organizer as first member
    await prisma.circleMember.create({
      data: {
        circleId: circle.id,
        userId: payload.userId,
        rotationOrder: 1,
      },
    });

    return NextResponse.json(
      {
        success: true,
        circle,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create circle error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - List circles with optional category filtering
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Extract and validate category query parameter
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get('category');

    // Valid categories enum
    const validCategories = [
      'GENERAL',
      'EDUCATION',
      'MEDICAL',
      'BUSINESS',
      'HOUSING',
      'EMERGENCY',
      'INVESTMENT',
      'COMMUNITY',
      'FAMILY',
      'TRAVEL',
    ];

    // Validate category if provided
    if (categoryParam) {
      const normalizedCategory = categoryParam.trim().toUpperCase();
      
      // Check if category is valid
      if (normalizedCategory && !validCategories.includes(normalizedCategory)) {
        return NextResponse.json(
          { 
            error: 'Invalid category',
            validCategories: validCategories,
          },
          { status: 400 }
        );
      }
    }

    // Build where clause with optional category filter
    const whereClause: any = {
      OR: [
        { organizerId: payload.userId },
        {
          members: {
            some: {
              userId: payload.userId,
            },
          },
        },
      ],
    };

    // Add category filter if provided and valid
    if (categoryParam && categoryParam.trim()) {
      const normalizedCategory = categoryParam.trim().toUpperCase();
      if (validCategories.includes(normalizedCategory)) {
        whereClause.category = normalizedCategory;
      }
    }

    // Get user's circles (as member or organizer) with optional category filter
    const circles = await prisma.circle.findMany({
      where: whereClause,
      include: {
        organizer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        contributions: {
          select: {
            amount: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      {
        success: true,
        circles,
        filter: categoryParam ? { category: categoryParam.trim().toUpperCase() } : null,
        count: circles.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('List circles error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
