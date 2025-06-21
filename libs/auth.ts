import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        let user = null;
        const { email, password } = credentials || {};

        if (!email || !password) {
          throw new Error("Correo y conraseña son requeridos");
        }

        user = await prisma.user.findUnique({
          where: { email: email as string },
          include: { Partner: true },
        });

        if (!user) {
          throw new Error("Credenciales inválidas");
        }

        const verifiedPassword = await bcrypt.compare(
          password as string,
          user.password
        );

        if (!verifiedPassword) {
          throw new Error("Credenciales inválidas");
        }

        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            lastLogin: new Date(),
          },
        });

        console.log(`Último inicio de sesión registrada: ${user.email}`);

        return {
          id: user.id,
          email: user.email,
          name: user.Partner?.name ?? null,
          slug: user.slug,
          emailVerified: null,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.slug = user.slug;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.slug = token.slug as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
export { handlers, auth, signIn, signOut };

// export const { handlers } = NextAuth(authOptions);
