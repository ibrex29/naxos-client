
export const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'alumni',
    graduationYear: 2020,
    department: 'Computer Science',
    organization: 'Tech Corp',
    location: 'New York, NY',
    bio: 'Software engineer passionate about AI and machine learning.',
    headline: 'Full-Stack Developer | AI Enthusiast | Building the Future',
    linkedIn: 'https://linkedin.com/in/johndoe',
    website: 'https://johndoe.dev',
    allowMessaging: true,
    connections: ['2', '4'],
    pendingConnections: [],
    skills: ['React', 'Node.js', 'Python', 'Machine Learning', 'AWS'],
    experiences: [
      {
        id: 'exp1',
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        location: 'New York, NY',
        startDate: '2021-01',
        current: true,
        description: 'Leading development of AI-powered applications using React and Python.',
        skills: ['React', 'Python', 'TensorFlow'],
      },
      {
        id: 'exp2',
        title: 'Software Developer',
        company: 'StartupXYZ',
        location: 'New York, NY',
        startDate: '2020-06',
        endDate: '2020-12',
        current: false,
        description: 'Built scalable web applications and APIs.',
        skills: ['Node.js', 'MongoDB', 'Express'],
      },
    ],
    education: [
      {
        id: 'edu1',
        degree: 'Bachelor of Science',
        school: 'University',
        field: 'Computer Science',
        startYear: 2016,
        endYear: 2020,
        current: false,
        description: 'Graduated with honors, focused on AI and software engineering.',
        gpa: '3.8',
      },
    ],
    achievements: [
      {
        id: 'ach1',
        title: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        date: '2022-03',
        description: 'Certified in designing distributed systems on AWS.',
        credentialUrl: 'https://aws.amazon.com/certification/',
      },
    ],
  },
  {
    id: 'admin1',
    name: 'Dr. Robert Wilson',
    email: 'admin@university.edu',
    role: 'Admin',
    department: 'Arts & Sciences',
    location: 'University Campus',
  },
];

export const getUserById = (id: string) => {
  return mockUsers.find((user) => user.id === id);
};

// For login validation
export const validateUserCredentials = (
  email: string,
  password: string,
): { success: boolean; userId?: string; role?: string } => {
  const user = mockUsers.find((u) => u.email === email && u.id === (email === 'admin@university.edu' ? 'admin1' : '1'));
  if (user && password === 'admin' && user.email === 'admin@university.edu') {
    return { success: true, userId: user.id, role: user.role };
  }
  if (user && password === 'password' && user.email === 'john@example.com') {
    return { success: true, userId: user.id, role: user.role };
  }
  return { success: false };
};