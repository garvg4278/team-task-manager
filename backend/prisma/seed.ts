import { PrismaClient, Role, Priority, TaskStatus, ProjectStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.subtask.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const memberPassword = await bcrypt.hash('Member@123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@taskflow.com',
      password: adminPassword,
      name: 'Alex Johnson',
      role: Role.ADMIN,
      bio: 'Team lead and project coordinator',
      emailVerified: true,
    },
  });

  const member1 = await prisma.user.create({
    data: {
      email: 'sarah@taskflow.com',
      password: memberPassword,
      name: 'Sarah Chen',
      role: Role.MEMBER,
      bio: 'Frontend developer',
      emailVerified: true,
    },
  });

  const member2 = await prisma.user.create({
    data: {
      email: 'marcus@taskflow.com',
      password: memberPassword,
      name: 'Marcus Williams',
      role: Role.MEMBER,
      bio: 'Backend engineer',
      emailVerified: true,
    },
  });

  const member3 = await prisma.user.create({
    data: {
      email: 'priya@taskflow.com',
      password: memberPassword,
      name: 'Priya Sharma',
      role: Role.MEMBER,
      bio: 'UI/UX designer',
      emailVerified: true,
    },
  });

  console.log('✅ Users created');

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      title: 'E-Commerce Platform Redesign',
      description: 'Complete overhaul of the customer-facing e-commerce platform with modern UI and improved performance.',
      status: ProjectStatus.ACTIVE,
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      color: '#6366f1',
      ownerId: admin.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      title: 'Mobile App Development',
      description: 'Cross-platform mobile application for iOS and Android using React Native.',
      status: ProjectStatus.ACTIVE,
      priority: Priority.CRITICAL,
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      color: '#10b981',
      ownerId: admin.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      title: 'API Gateway Migration',
      description: 'Migrate legacy REST APIs to GraphQL with improved caching and performance.',
      status: ProjectStatus.ACTIVE,
      priority: Priority.MEDIUM,
      dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      color: '#f59e0b',
      ownerId: admin.id,
    },
  });

  console.log('✅ Projects created');

  // Add project members
  await prisma.projectMember.createMany({
    data: [
      { projectId: project1.id, userId: admin.id, role: Role.ADMIN },
      { projectId: project1.id, userId: member1.id, role: Role.MEMBER },
      { projectId: project1.id, userId: member3.id, role: Role.MEMBER },
      { projectId: project2.id, userId: admin.id, role: Role.ADMIN },
      { projectId: project2.id, userId: member1.id, role: Role.MEMBER },
      { projectId: project2.id, userId: member2.id, role: Role.MEMBER },
      { projectId: project3.id, userId: admin.id, role: Role.ADMIN },
      { projectId: project3.id, userId: member2.id, role: Role.MEMBER },
    ],
  });

  console.log('✅ Project members added');

  // Create tasks for project 1
  const tasks1 = await prisma.task.createMany({
    data: [
      {
        title: 'Design new homepage wireframes',
        description: 'Create wireframes for the redesigned homepage including hero, features, and testimonials sections.',
        status: TaskStatus.COMPLETED,
        priority: Priority.HIGH,
        projectId: project1.id,
        assigneeId: member3.id,
        creatorId: admin.id,
        tags: ['design', 'wireframe'],
        position: 0,
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Implement product listing page',
        description: 'Build the product listing page with filters, sorting, and pagination.',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        projectId: project1.id,
        assigneeId: member1.id,
        creatorId: admin.id,
        tags: ['frontend', 'react'],
        position: 1,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Shopping cart functionality',
        description: 'Implement add to cart, update quantity, and checkout flow.',
        status: TaskStatus.TODO,
        priority: Priority.CRITICAL,
        projectId: project1.id,
        assigneeId: member1.id,
        creatorId: admin.id,
        tags: ['frontend', 'state-management'],
        position: 2,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Payment gateway integration',
        description: 'Integrate Stripe payment gateway with 3D Secure support.',
        status: TaskStatus.TODO,
        priority: Priority.CRITICAL,
        projectId: project1.id,
        assigneeId: null,
        creatorId: admin.id,
        tags: ['backend', 'payments'],
        position: 3,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Performance optimization',
        description: 'Improve page load times, implement lazy loading and code splitting.',
        status: TaskStatus.REVIEW,
        priority: Priority.MEDIUM,
        projectId: project1.id,
        assigneeId: member1.id,
        creatorId: admin.id,
        tags: ['performance', 'optimization'],
        position: 4,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Create tasks for project 2
  await prisma.task.createMany({
    data: [
      {
        title: 'Setup React Native project',
        description: 'Initialize the React Native project with proper configuration and folder structure.',
        status: TaskStatus.COMPLETED,
        priority: Priority.HIGH,
        projectId: project2.id,
        assigneeId: member1.id,
        creatorId: admin.id,
        tags: ['setup', 'react-native'],
        position: 0,
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'User authentication flow',
        description: 'Implement login, register, and OAuth with Google/Apple.',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.CRITICAL,
        projectId: project2.id,
        assigneeId: member2.id,
        creatorId: admin.id,
        tags: ['auth', 'backend'],
        position: 1,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Push notification system',
        description: 'Implement push notifications using Firebase Cloud Messaging.',
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        projectId: project2.id,
        assigneeId: member2.id,
        creatorId: admin.id,
        tags: ['notifications', 'firebase'],
        position: 2,
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Create tasks for project 3
  await prisma.task.createMany({
    data: [
      {
        title: 'GraphQL schema design',
        description: 'Design the GraphQL schema for all existing REST endpoints.',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        projectId: project3.id,
        assigneeId: member2.id,
        creatorId: admin.id,
        tags: ['graphql', 'architecture'],
        position: 0,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Implement resolvers',
        description: 'Build GraphQL resolvers with DataLoader for N+1 prevention.',
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        projectId: project3.id,
        assigneeId: member2.id,
        creatorId: admin.id,
        tags: ['graphql', 'backend'],
        position: 1,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Tasks created');

  // Create some comments
  const tasks = await prisma.task.findMany({ take: 3 });
  
  if (tasks.length > 0) {
    await prisma.comment.createMany({
      data: [
        {
          content: 'Wireframes look great! I\'ve reviewed them and they align perfectly with our brand guidelines.',
          taskId: tasks[0].id,
          authorId: admin.id,
        },
        {
          content: 'Should we consider adding a dark mode variant to the wireframes?',
          taskId: tasks[0].id,
          authorId: member1.id,
        },
        {
          content: 'Working on the filter implementation. Using Tanstack Query for caching.',
          taskId: tasks[1].id,
          authorId: member1.id,
        },
      ],
    });
  }

  console.log('✅ Comments created');

  // Create activity logs
  await prisma.activityLog.createMany({
    data: [
      {
        action: 'CREATED_PROJECT',
        entityType: 'project',
        entityId: project1.id,
        projectId: project1.id,
        userId: admin.id,
        metadata: { projectTitle: project1.title },
      },
      {
        action: 'ADDED_MEMBER',
        entityType: 'project',
        entityId: project1.id,
        projectId: project1.id,
        userId: admin.id,
        metadata: { memberName: member1.name },
      },
      {
        action: 'TASK_COMPLETED',
        entityType: 'task',
        entityId: tasks[0].id,
        projectId: project1.id,
        taskId: tasks[0].id,
        userId: member3.id,
        metadata: { taskTitle: tasks[0].title },
      },
    ],
  });

  console.log('✅ Activity logs created');

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        type: 'TASK_ASSIGNED',
        title: 'New task assigned',
        message: 'You have been assigned to "Implement product listing page"',
        userId: member1.id,
        link: `/projects/${project1.id}`,
      },
      {
        type: 'DEADLINE_REMINDER',
        title: 'Deadline approaching',
        message: 'Task "User authentication flow" is due in 5 days',
        userId: member2.id,
        link: `/projects/${project2.id}`,
      },
    ],
  });

  console.log('✅ Notifications created');
  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📋 Test credentials:');
  console.log('  Admin: admin@taskflow.com / Admin@123');
  console.log('  Member: sarah@taskflow.com / Member@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
