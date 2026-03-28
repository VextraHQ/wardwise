import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// NextAuth configuration for candidate authentication
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // Custom authorization logic for email/password login
      async authorize(credentials) {
        console.log("🔐 Auth attempt:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials");
          return null;
        }

        // Fetch user from database including their candidate profile
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
          include: {
            candidate: true,
          },
        });

        console.log("👤 User found:", user ? "Yes" : "No");
        console.log("🔑 Has password:", user?.password ? "Yes" : "No");

        if (!user || !user.password) {
          console.log("❌ User not found or no password");
          return null;
        }

        // Verify password using bcrypt
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        console.log("🔐 Password valid:", isPasswordValid);

        if (!isPasswordValid) {
          console.log("❌ Invalid password");
          return null;
        }

        console.log("✅ Authentication successful");
        // Return user data to be stored in JWT token
        return {
          id: user.id,
          email: user.email as string,
          name: user.name,
          role: user.role,
          candidateId: user.candidateId as string,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt", // Use JWT tokens instead of database sessions
    maxAge: 7 * 24 * 60 * 60, // 7 days - reasonable for demo purposes
  },
  callbacks: {
    // Add custom fields to JWT token
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.candidateId = user.candidateId;
      }
      return token;
    },
    // Add custom fields from JWT to session object
    async session({ session, token }) {
      // Artificial delay for local testing of loading states
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.candidateId = token.candidateId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};
