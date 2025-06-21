// next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    slug: string;
  }

  interface Session {
    user: {
      slug: string;
    } & DefaultSession["user"];
  }
}
