import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data
  await prisma.contribution.deleteMany();
  await prisma.governanceVote.deleteMany();
  await prisma.governanceProposal.deleteMany();
  await prisma.paymentSchedule.deleteMany();
  await prisma.withdrawal.deleteMany();
  await prisma.circleMember.deleteMany();
  await prisma.circle.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      password: await hashPassword('TestPassword123!'),
      firstName: 'Alice',
      lastName: 'Johnson',
      verified: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      password: await hashPassword('TestPassword123!'),
      firstName: 'Bob',
      lastName: 'Smith',
      verified: true,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'charlie@example.com',
      password: await hashPassword('TestPassword123!'),
      firstName: 'Charlie',
      lastName: 'Brown',
      verified: true,
    },
  });

  const user4 = await prisma.user.create({
    data: {
      email: 'diana@example.com',
      password: await hashPassword('TestPassword123!'),
      firstName: 'Diana',
      lastName: 'Prince',
      verified: true,
    },
  });

  console.log('Created 4 test users');

  // Create test circles
  const circle1 = await prisma.circle.create({
    data: {
      name: 'Office Team Savings',
      description: 'Monthly savings circle for office team members',
      organizerId: user1.id,
      contributionAmount: 100,
      contributionFrequencyDays: 7,
      maxRounds: 12,
      currentRound: 1,
      status: 'ACTIVE',
    },
  });

  const circle2 = await prisma.circle.create({
    data: {
      name: 'Community Ajo',
      description: 'A community-based savings circle',
      organizerId: user2.id,
      contributionAmount: 50,
      contributionFrequencyDays: 14,
      maxRounds: 8,
      currentRound: 2,
      status: 'ACTIVE',
    },
  });

  console.log('Created 2 test circles');

  // Add members to circles
  await prisma.circleMember.create({
    data: {
      circleId: circle1.id,
      userId: user1.id,
      rotationOrder: 1,
      status: 'ACTIVE',
      totalContributed: 300,
    },
  });

  await prisma.circleMember.create({
    data: {
      circleId: circle1.id,
      userId: user2.id,
      rotationOrder: 2,
      status: 'ACTIVE',
      totalContributed: 200,
    },
  });

  await prisma.circleMember.create({
    data: {
      circleId: circle1.id,
      userId: user3.id,
      rotationOrder: 3,
      status: 'ACTIVE',
      totalContributed: 100,
    },
  });

  await prisma.circleMember.create({
    data: {
      circleId: circle2.id,
      userId: user2.id,
      rotationOrder: 1,
      status: 'ACTIVE',
      totalContributed: 150,
    },
  });

  await prisma.circleMember.create({
    data: {
      circleId: circle2.id,
      userId: user3.id,
      rotationOrder: 2,
      status: 'ACTIVE',
      totalContributed: 100,
    },
  });

  await prisma.circleMember.create({
    data: {
      circleId: circle2.id,
      userId: user4.id,
      rotationOrder: 3,
      status: 'ACTIVE',
      totalContributed: 150,
    },
  });

  console.log('Added members to circles');

  // Create test contributions
  await prisma.contribution.create({
    data: {
      circleId: circle1.id,
      userId: user1.id,
      amount: 100,
      round: 1,
      status: 'COMPLETED',
    },
  });

  await prisma.contribution.create({
    data: {
      circleId: circle1.id,
      userId: user2.id,
      amount: 100,
      round: 1,
      status: 'COMPLETED',
    },
  });

  await prisma.contribution.create({
    data: {
      circleId: circle1.id,
      userId: user3.id,
      amount: 100,
      round: 1,
      status: 'COMPLETED',
    },
  });

  await prisma.contribution.create({
    data: {
      circleId: circle1.id,
      userId: user1.id,
      amount: 100,
      round: 2,
      status: 'COMPLETED',
    },
  });

  await prisma.contribution.create({
    data: {
      circleId: circle1.id,
      userId: user2.id,
      amount: 100,
      round: 2,
      status: 'COMPLETED',
    },
  });

  console.log('Created test contributions');

  // Create payment schedules
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  await prisma.paymentSchedule.create({
    data: {
      circleId: circle1.id,
      round: 1,
      payeeIndex: 1,
      expectedAmount: 300,
      dueDate: nextWeek,
      status: 'COMPLETED',
    },
  });

  await prisma.paymentSchedule.create({
    data: {
      circleId: circle1.id,
      round: 2,
      payeeIndex: 2,
      expectedAmount: 300,
      dueDate: nextTwoWeeks,
      status: 'PENDING',
    },
  });

  console.log('Created payment schedules');

  // Create governance proposals
  const proposal = await prisma.governanceProposal.create({
    data: {
      circleId: circle1.id,
      title: 'Increase contribution amount',
      description: 'Proposal to increase monthly contribution from 100 to 150 XLM',
      proposalType: 'CONTRIBUTION_ADJUSTMENT',
      status: 'ACTIVE',
      votingStartDate: now,
      votingEndDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      requiredQuorum: 50,
      proposalData: JSON.stringify({ newAmount: 150 }),
    },
  });

  console.log('Created governance proposal');

  // Create votes
  await prisma.governanceVote.create({
    data: {
      proposalId: proposal.id,
      userId: user1.id,
      voteChoice: 'YES',
    },
  });

  await prisma.governanceVote.create({
    data: {
      proposalId: proposal.id,
      userId: user2.id,
      voteChoice: 'YES',
    },
  });

  await prisma.governanceVote.create({
    data: {
      proposalId: proposal.id,
      userId: user3.id,
      voteChoice: 'NO',
    },
  });

  console.log('Created governance votes');

  console.log('Database seeded successfully!');
  console.log('\nTest Credentials:');
  console.log('Email: alice@example.com');
  console.log('Email: bob@example.com');
  console.log('Email: charlie@example.com');
  console.log('Email: diana@example.com');
  console.log('Password: TestPassword123!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
