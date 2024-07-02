import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      email: string;
      image: string;
      name: string;
      role: string;
    };
  }

  interface User {
    email: string;
    image: string;
    name: string;
    role: string;
  }
}
