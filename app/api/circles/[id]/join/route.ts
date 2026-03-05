import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Get circle
    const circle = await prisma.circle.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!circle) {
      return NextResponse.json(
        { error: 'Circle not found' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.circleMember.findUnique({
      where: {
        circleId_userId: {
          circleId: id,
          userId: payload.userId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'You are already a member of this circle' },
        { status: 409 }
      );
    }

    // Check if circle is accepting members
    if (circle.status !== 'ACTIVE' && circle.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'This circle is not accepting new members' },
        { status: 403 }
      );
    }

    // Add user as member
    const newMember = await prisma.circleMember.create({
      data: {
        circleId: id,
        userId: payload.userId,
        rotationOrder: circle.members.length + 1,
      },
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
    });

    return NextResponse.json(
      {
        success: true,
        member: newMember,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Join circle error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
