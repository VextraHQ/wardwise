import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔐 Auth attempt:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
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

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        console.log("🔐 Password valid:", isPasswordValid);

        if (!isPasswordValid) {
          console.log("❌ Invalid password");
          return null;
        }

        console.log("✅ Authentication successful");
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          candidateId: user.candidateId,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.candidateId = user.candidateId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.candidateId = token.candidateId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/candidate/login",
    error: "/candidate/login",
  },
};
