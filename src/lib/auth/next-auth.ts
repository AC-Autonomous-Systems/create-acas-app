import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';

/* -------------------------------------------------------------------------- */
/*                               Loads the .env                               */
/* -------------------------------------------------------------------------- */
import * as dotenv from 'dotenv';
import { db } from '../db/db';
import { usersTable } from '@/app/api/users/schema';
import { eq } from 'drizzle-orm';
dotenv.config({
  path: '.env.local',
});

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is not set');
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],

  callbacks: {
    jwt: async function jwt({ session, token, user }) {
      // Check if user exists, if not, create that user in DB:
      if (token.email) {
        const userFromDbRes = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, token.email));

        // Create user if it doesn't exist:
        if (!userFromDbRes || userFromDbRes.length === 0) {
          const createdUserRes = await db
            .insert(usersTable)
            .values({
              email: token.email,
              name: user.name,
              profilePictureURL: user.image,
            })
            .returning();
        }
      }
      return token;
    },

    session: async function ({ session, token }) {
      if (session.user && session.user.email) {
        const userFromDbRes = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, session.user.email));

        session.user.role = userFromDbRes[0].role;
      }

      return session;
    },
  },
};
