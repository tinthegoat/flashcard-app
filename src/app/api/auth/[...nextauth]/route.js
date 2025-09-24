// src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  adapter: MongoDBAdapter({ connect: connectToDB, databaseName: "studyflash" }),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        pin: { label: "PIN", type: "password" },
      },
      async authorize(credentials) {
        await connectToDB();
        const { username, pin } = credentials;

        if (!username) throw new Error("Username is required");

        const user = await User.findOne({ username });
        if (!user) {
          // Signup: Create new user if not found
          if (pin) {
            const hashedPin = await bcrypt.hash(pin, 10);
            const newUser = new User({ username, pin: hashedPin, score: 0 });
            await newUser.save();
            return { id: newUser._id, name: newUser.username };
          }
          throw new Error("User not found");
        }

        // Login: Verify PIN
        if (pin && user.pin && (await bcrypt.compare(pin, user.pin))) {
          return { id: user._id, name: user.username };
        }
        throw new Error("Incorrect PIN");
      },
    }),
  ],
  session: {
    strategy: "jwt", // Use JWT for sessions (stored in cookies)
    maxAge: 24 * 60 * 60, // 1 day
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.username = token.username;
      return session;
    },
  },
  pages: {
    signIn: "/pages/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
