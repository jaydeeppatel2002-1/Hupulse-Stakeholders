import { PrismaClient, UserRole, StakeholderType, SentimentType, CommunicationChannel } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create organization
  const org = await prisma.organization.upsert({
    where: { slug: 'hupulse-demo' },
    update: {},
    create: {
      name: 'HuPulse Demo Organization',
      slug: 'hupulse-demo',
      domain: 'demo.hupulse.com',
    },
  });

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@demo.hupulse.com' },
    update: {},
    create: {
      supabaseUserId: 'seed-admin-user-id',
      email: 'admin@demo.hupulse.com',
      fullName: 'Admin User',
      role: UserRole.ADMIN,
      organizationId: org.id,
    },
  });

  // Create tags
  const tags = await Promise.all(
    [
      { name: 'Executive', color: '#8b5cf6' },
      { name: 'Technical', color: '#3b82f6' },
      { name: 'Finance', color: '#10b981' },
      { name: 'Operations', color: '#f59e0b' },
      { name: 'Key Decision Maker', color: '#ef4444' },
    ].map((t) =>
      prisma.tag.upsert({
        where: { organizationId_name: { organizationId: org.id, name: t.name } },
        update: {},
        create: { ...t, organizationId: org.id },
      }),
    ),
  );

  // Create stakeholders
  const stakeholderData = [
    { firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@example.com', jobTitle: 'VP Engineering', company: 'TechCorp', department: 'Engineering', type: StakeholderType.INTERNAL, powerScore: 9, interestScore: 8, sentiment: SentimentType.SUPPORTIVE },
    { firstName: 'Michael', lastName: 'Torres', email: 'michael.t@example.com', jobTitle: 'CFO', company: 'FinanceHQ', department: 'Finance', type: StakeholderType.INVESTOR, powerScore: 10, interestScore: 7, sentiment: SentimentType.NEUTRAL },
    { firstName: 'Emily', lastName: 'Park', email: 'emily.park@example.com', jobTitle: 'Product Manager', company: 'TechCorp', department: 'Product', type: StakeholderType.INTERNAL, powerScore: 6, interestScore: 9, sentiment: SentimentType.SUPPORTIVE },
    { firstName: 'David', lastName: 'Kim', email: 'david.kim@example.com', jobTitle: 'Director of Sales', company: 'SalesForce Inc', department: 'Sales', type: StakeholderType.PARTNER, powerScore: 7, interestScore: 6, sentiment: SentimentType.NEUTRAL },
    { firstName: 'Lisa', lastName: 'Wang', email: 'lisa.wang@example.com', jobTitle: 'Regulatory Analyst', company: 'GovTech', department: 'Compliance', type: StakeholderType.REGULATOR, powerScore: 8, interestScore: 4, sentiment: SentimentType.RESISTANT },
    { firstName: 'James', lastName: 'Anderson', email: 'james.a@example.com', jobTitle: 'CTO', company: 'InnovateTech', department: 'Engineering', type: StakeholderType.EXTERNAL, powerScore: 9, interestScore: 9, sentiment: SentimentType.SUPPORTIVE },
    { firstName: 'Maria', lastName: 'Garcia', email: 'maria.g@example.com', jobTitle: 'Head of Marketing', company: 'MarketPro', department: 'Marketing', type: StakeholderType.PARTNER, powerScore: 5, interestScore: 8, sentiment: SentimentType.SUPPORTIVE },
    { firstName: 'Robert', lastName: 'Johnson', email: 'robert.j@example.com', jobTitle: 'Operations Manager', company: 'TechCorp', department: 'Operations', type: StakeholderType.INTERNAL, powerScore: 4, interestScore: 5, sentiment: SentimentType.NEUTRAL },
  ];

  const stakeholders = await Promise.all(
    stakeholderData.map((s) =>
      prisma.stakeholder.upsert({
        where: { organizationId_email: { organizationId: org.id, email: s.email } },
        update: {},
        create: { ...s, organizationId: org.id },
      }),
    ),
  );

  // Tag stakeholders
  for (let i = 0; i < Math.min(stakeholders.length, tags.length); i++) {
    await prisma.stakeholderTag.upsert({
      where: {
        stakeholderId_tagId: {
          stakeholderId: stakeholders[i].id,
          tagId: tags[i].id,
        },
      },
      update: {},
      create: { stakeholderId: stakeholders[i].id, tagId: tags[i].id },
    });
  }

  // Create communications
  const channels: CommunicationChannel[] = ['EMAIL', 'MEETING', 'PHONE', 'VIDEO_CALL'];
  for (let i = 0; i < 12; i++) {
    const stakeholder = stakeholders[i % stakeholders.length];
    const comm = await prisma.communication.create({
      data: {
        organizationId: org.id,
        createdById: adminUser.id,
        channel: channels[i % channels.length],
        direction: i % 2 === 0 ? 'OUTBOUND' : 'INBOUND',
        subject: `Meeting about Q${Math.ceil((i + 1) / 3)} planning`,
        body: `Discussed project milestones and stakeholder alignment for upcoming quarter.`,
        summary: `Productive ${channels[i % channels.length].toLowerCase()} session covering key deliverables.`,
        sentiment: i % 3 === 0 ? 'SUPPORTIVE' : i % 3 === 1 ? 'NEUTRAL' : 'RESISTANT',
        occurredAt: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.communicationStakeholder.create({
      data: { communicationId: comm.id, stakeholderId: stakeholder.id },
    });
  }

  // Create surveys
  const survey = await prisma.survey.create({
    data: {
      organizationId: org.id,
      createdById: adminUser.id,
      title: 'Q1 Stakeholder Satisfaction Survey',
      description: 'Quarterly pulse check on stakeholder engagement and satisfaction.',
      type: 'SATISFACTION',
      status: 'ACTIVE',
      questions: [
        { id: 1, text: 'How satisfied are you with our communication?', type: 'rating' },
        { id: 2, text: 'How clear are project objectives?', type: 'rating' },
        { id: 3, text: 'Any concerns about the current roadmap?', type: 'text' },
      ],
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Submit some responses
  for (let i = 0; i < 5; i++) {
    await prisma.surveyResponse.create({
      data: {
        surveyId: survey.id,
        stakeholderId: stakeholders[i].id,
        submittedById: adminUser.id,
        answers: { 1: Math.floor(Math.random() * 5) + 5, 2: Math.floor(Math.random() * 5) + 4, 3: 'Looking good overall.' },
        sentiment: i % 2 === 0 ? 'SUPPORTIVE' : 'NEUTRAL',
        score: Math.round((Math.random() * 4 + 6) * 10) / 10,
      },
    });
  }

  // Create courses
  const course = await prisma.course.create({
    data: {
      organizationId: org.id,
      title: 'Stakeholder Engagement Fundamentals',
      description: 'Learn the essentials of stakeholder management and engagement strategies.',
      objectives: ['Identify key stakeholders', 'Map influence networks', 'Build engagement plans'],
      durationHours: 2.5,
      status: 'PUBLISHED',
      content: {
        modules: [
          { id: 1, title: 'Introduction to Stakeholder Management', duration: '30m' },
          { id: 2, title: 'Power-Interest Mapping', duration: '45m' },
          { id: 3, title: 'Communication Strategies', duration: '45m' },
          { id: 4, title: 'Engagement Planning', duration: '30m' },
        ],
      },
    },
  });

  // Assign course to some stakeholders
  for (let i = 0; i < 4; i++) {
    await prisma.courseAssignment.create({
      data: {
        courseId: course.id,
        stakeholderId: stakeholders[i].id,
        assignedById: adminUser.id,
        status: i === 0 ? 'COMPLETED' : i === 1 ? 'IN_PROGRESS' : 'NOT_STARTED',
        progress: i === 0 ? 100 : i === 1 ? 45 : 0,
        startedAt: i <= 1 ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : undefined,
        completedAt: i === 0 ? new Date() : undefined,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Create engagement scores
  for (const stakeholder of stakeholders) {
    for (let month = 0; month < 6; month++) {
      await prisma.engagementScore.create({
        data: {
          stakeholderId: stakeholder.id,
          score: Math.round((Math.random() * 40 + 50) * 10) / 10,
          dimensions: {
            communication: Math.round(Math.random() * 100),
            sentiment: Math.round(Math.random() * 100),
            responsiveness: Math.round(Math.random() * 100),
          },
          calculatedAt: new Date(Date.now() - month * 30 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  // Create notifications
  await prisma.notification.createMany({
    data: [
      { userId: adminUser.id, type: 'IN_APP', title: 'New survey response', body: 'Sarah Chen submitted a survey response.', severity: 'LOW' },
      { userId: adminUser.id, type: 'IN_APP', title: 'At-risk stakeholder alert', body: 'Lisa Wang sentiment has declined to resistant.', severity: 'HIGH' },
      { userId: adminUser.id, type: 'IN_APP', title: 'Course completed', body: 'Sarah Chen completed Stakeholder Engagement Fundamentals.', severity: 'LOW' },
    ],
  });

  console.log('✅ Seed completed successfully');
  console.log(`  Organization: ${org.name} (${org.id})`);
  console.log(`  Admin user: ${adminUser.email} (${adminUser.id})`);
  console.log(`  Stakeholders: ${stakeholders.length}`);
  console.log(`  Tags: ${tags.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
