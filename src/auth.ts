import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth: session }) {
      return !!session?.user;
    },
    async signIn({ user }) {
      const allowed = process.env.ALLOWED_EMAILS;
      if (!allowed) return false;
      const list = allowed.split(",").map((e) => e.trim().toLowerCase());
      return list.includes((user.email ?? "").toLowerCase());
    },
  },
});
