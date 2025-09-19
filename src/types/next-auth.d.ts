import 'next-auth';
import 'next-auth/jwt';




declare module 'next-auth' {
    interface User {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
        token: {
            accessToken: string;
            refreshToken: string;
        };
    }

    interface Session {
        user: Partial<User>;
        token: token;
    }
}


declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    access: string;
    role: string;
  }
}
