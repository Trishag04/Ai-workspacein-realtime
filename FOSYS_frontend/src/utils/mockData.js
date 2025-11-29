// Mock credentials for testing
export const MOCK_USERS = [
  {
    email: 'intern@fosys.com',
    password: 'Intern@123',
    role: 'intern',
    name: 'Alex Johnson',
    id: 'INT001',
    department: 'Engineering',
    pronouns: 'they/them',
    jobTitle: 'Software Development Intern',
    about: 'Passionate about learning and contributing to innovative projects.',
    signupDate: '2025-01-15'
  },
  {
    email: 'employee@fosys.com',
    password: 'Employee@123',
    role: 'employee',
    name: 'Sarah Chen',
    id: 'EMP001',
    department: 'Engineering',
    pronouns: 'she/her',
    jobTitle: 'Senior Software Engineer',
    about: 'Experienced developer focused on building scalable solutions.',
    signupDate: '2024-03-20'
  },
  {
    email: 'manager@fosys.com',
    password: 'Manager@123',
    role: 'manager',
    name: 'Michael Torres',
    id: 'MGR001',
    department: 'Engineering',
    pronouns: 'he/him',
    jobTitle: 'Engineering Manager',
    about: 'Leading teams to deliver exceptional products.',
    signupDate: '2023-06-10'
  },
  {
    email: 'admin@fosys.com',
    password: 'Admin@123',
    role: 'admin',
    name: 'Jessica Williams',
    id: 'ADM001',
    department: 'Operations',
    pronouns: 'she/her',
    jobTitle: 'System Administrator',
    about: 'Ensuring smooth operations and system integrity.',
    signupDate: '2023-01-05'
  }
];

// Mock tasks data
export const MOCK_TASKS = [
  {
    id: 'TASK001',
    title: 'Implement user authentication module',
    description: 'Build JWT-based authentication system',
    status: 'InProgress',
    assignee: 'Alex Johnson',
    dueDate: '2025-01-25',
    createdDate: '2025-01-20',
    projectId: 'PRJ001'
  },
  {
    id: 'TASK002',
    title: 'Review PR #234 for dashboard updates',
    description: 'Code review and testing',
    status: 'Pending',
    assignee: 'Sarah Chen',
    dueDate: '2025-01-24',
    createdDate: '2025-01-22',
    projectId: 'PRJ001'
  },
  {
    id: 'TASK003',
    title: 'Fix navigation bug in mobile view',
    description: 'Responsive design issues',
    status: 'Completed',
    assignee: 'Alex Johnson',
    dueDate: '2025-01-23',
    createdDate: '2025-01-21',
    completedDate: '2025-01-23',
    projectId: 'PRJ001'
  },
  {
    id: 'TASK004',
    title: 'Update API documentation',
    description: 'Document all endpoints with examples',
    status: 'Pending',
    assignee: 'Sarah Chen',
    dueDate: '2025-01-26',
    createdDate: '2025-01-22',
    projectId: 'PRJ002'
  }
];

// Mock PRs data
export const MOCK_PRS = [
  {
    id: 'PR001',
    prId: '#234',
    title: 'Add user dashboard',
    task: 'TASK001',
    assignee: 'Alex Johnson',
    status: 'InReview',
    lastUpdated: '2025-01-23T10:30:00',
    projectId: 'PRJ001'
  },
  {
    id: 'PR002',
    prId: '#235',
    title: 'Fix authentication bug',
    task: 'TASK003',
    assignee: 'Sarah Chen',
    status: 'Merged',
    lastUpdated: '2025-01-23T14:20:00',
    projectId: 'PRJ001'
  },
  {
    id: 'PR003',
    prId: '#236',
    title: 'Update database schema',
    task: 'TASK002',
    assignee: 'Alex Johnson',
    status: 'Open',
    lastUpdated: '2025-01-23T09:15:00',
    projectId: 'PRJ002'
  }
];

// Mock projects data
export const MOCK_PROJECTS = [
  {
    id: 'PRJ001',
    title: 'AI Workspace Platform',
    description: 'Building the next-generation workspace management tool',
    status: 'Ongoing',
    progress: 65,
    deadline: '2025-03-15'
  },
  {
    id: 'PRJ002',
    title: 'Mobile App Development',
    description: 'Native mobile application for iOS and Android',
    status: 'Upcoming',
    progress: 20,
    deadline: '2025-05-20'
  },
  {
    id: 'PRJ003',
    title: 'API Gateway Redesign',
    description: 'Modernizing API infrastructure',
    status: 'Completed',
    progress: 100,
    deadline: '2024-12-30'
  }
];

// Mock calendar events
export const MOCK_EVENTS = [
  {
    id: 'EVT001',
    date: '2025-01-24',
    title: 'Daily Scrum',
    description: 'Team standup meeting',
    type: 'SCRUM'
  },
  {
    id: 'EVT002',
    date: '2025-01-26',
    title: 'Public Holiday',
    description: 'Republic Day',
    type: 'Holiday'
  },
  {
    id: 'EVT003',
    date: '2025-01-27',
    title: 'Sprint Planning',
    description: 'Planning for Sprint 5',
    type: 'Meeting'
  }
];

// Mock team members
export const MOCK_TEAM = [
  {
    id: 'INT001',
    name: 'Alex Johnson',
    role: 'intern',
    tasksAssigned: 5,
    progress: 60,
    projectId: 'PRJ001'
  },
  {
    id: 'EMP001',
    name: 'Sarah Chen',
    role: 'employee',
    tasksAssigned: 8,
    progress: 75,
    projectId: 'PRJ001'
  },
  {
    id: 'EMP002',
    name: 'David Kumar',
    role: 'employee',
    tasksAssigned: 6,
    progress: 50,
    projectId: 'PRJ002'
  },
  {
    id: 'INT002',
    name: 'Emma Wilson',
    role: 'intern',
    tasksAssigned: 4,
    progress: 80,
    projectId: 'PRJ002'
  }
];

export const mockCalendarEvents = [
  {
    id: 1,
    title: "Orientation Day",
    start: new Date("2025-11-01T09:00:00"),
    end: new Date("2025-11-01T12:00:00"),
    description: "Welcome session for new interns",
  },
  {
    id: 2,
    title: "Team Meeting",
    start: new Date("2025-11-03T10:00:00"),
    end: new Date("2025-11-03T11:00:00"),
    description: "Weekly sync with mentor and project team",
  },
  {
    id: 3,
    title: "Training Workshop",
    start: new Date("2025-11-05T14:00:00"),
    end: new Date("2025-11-05T16:00:00"),
    description: "Intro to internal tools and workflow",
  },
];
export const MOCK_EMPLOYEES = [
  { id: 'EMP001', name: 'John Doe', managerId: 'M001' },
  { id: 'EMP002', name: 'Jane Smith', managerId: 'M001' },
  { id: 'EMP003', name: 'Ravi Kumar', managerId: 'M002' },
];
