import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { signupUserWithGoogle, getUserByEmail } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        const email = user.email;
        const name = user.name;
        const googleId = user.id;

        if (!email) {
          return false;
        }

        // Check if user exists, if not create them
        const existingUser = await getUserByEmail(email);
        
        if (!existingUser.success) {
          // Create new user
          const newUser = await signupUserWithGoogle(email, googleId, name);
          if (!newUser.success) {
            return false;
          }
        }

        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
