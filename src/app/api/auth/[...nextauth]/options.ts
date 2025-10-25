/* eslint-disable @typescript-eslint/no-explicit-any */
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';
import { AuthOptions, getServerSession, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { rolesMap } from '@/types/form'; 
import  api  from '@/utils/api';



const credentialsProviderOptions: any = {
  name: 'Login',
  credentials: {
    email: { label: 'Email', type: 'text', placeholder: 'admin@example.com' },
    password: { label: 'Password', type: 'password', placeholder: 'Password' }
  },
  authorize: async (credentials: any) => {
    if (!credentials?.email || !credentials?.password) {
      throw new Error('Email and password are required');
    }

    const { email, password } = credentials;
    try {
      // Use the Axios instance to make the POST request
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, profile } = response.data;

      // Check for a valid profile and token
      if (!profile || !accessToken) {
        throw new Error('Authentication failed: Missing user profile or token');
      }

      // Construct the custom user object with the new payload structure
      const user: User = {
        id: profile.id,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        role: profile.role, 
        token: { accessToken, refreshToken },
      };
      
      return user;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Authentication failed');
    }
  }
};

export const authOptions: AuthOptions = {
  providers: [CredentialsProvider(credentialsProviderOptions)],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.access = user.token.accessToken;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Pass the JWT data to the session object available on the client
      if (!token.access) {
        return {} as typeof session;
      }

      session.user = { 
        id: token.id as string,
        email: token.email as string,
        firstName: token.firstName as string,
        lastName: token.lastName as string,
        role: token.role as string,
        token: {
          accessToken: token.access as string,
          refreshToken: token.refresh as string,
        }
      };
      session.token = token.access as string;
      return session;
    },
    async signIn({ user }) {
      if (user && user.role) {
        // Ensure the role exists in your map
        const route = rolesMap[user.role];
        if (route) {
          return true;
        }
      }
      return false;
    }
  },
  pages: {
    signIn: '/signin'
  }
};

export function auth(
  ...args:
    | [GetServerSidePropsContext['req'], GetServerSidePropsContext['res']]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authOptions);
}
