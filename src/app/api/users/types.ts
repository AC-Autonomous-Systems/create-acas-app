export type User = {
  id: string;
  name: string | null;
  email: string;
  profilePictureURL: string | null;
  role: 'user' | 'admin';
};
