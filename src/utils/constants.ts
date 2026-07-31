export const DUMMY_USERS = [
  {
    id: 'user_teacher_1',
    username: 'teacher',
    email: 'teacher@mentlink.com',
    password: '123t',
    role: 'mentor' as const,
    name: 'Prof. Sarah Jenkins',
  },
  {
    id: 'user_student_1',
    username: 'student',
    email: 'student@mentlink.com',
    password: '123s',
    role: 'student' as const,
    name: 'Alex Johnson',
  },
  {
    id: 'user_admin_1',
    username: 'admin',
    email: 'admin@mentlink.com',
    password: '123a',
    role: 'admin' as const,
    name: 'System Administrator',
  },
];

export const findDummyUser = (identifier: string, passwordInput: string) => {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = passwordInput.trim();

  return DUMMY_USERS.find(
    (u) =>
      (u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId) &&
      u.password === cleanPass
  );
};