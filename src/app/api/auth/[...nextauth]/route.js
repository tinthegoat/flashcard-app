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
        username: {
          label: "Username",
          type: "text",
          placeholder: "Enter username",
        },
        pin: {
          label: "PIN",
          type: "password",
          placeholder: "Enter 4-8 digit PIN",
        },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.pin) {
          throw new Error("Username and PIN are required");
        }

        const username = credentials.username.trim();
        const pin = credentials.pin.trim();

        // Basic validation
        if (username.length < 3 || username.length > 20) {
          throw new Error("Username must be 3-20 characters long");
        }
        if (!/^[a-zA-Z0-9]+$/.test(username)) {
          throw new Error("Username must be alphanumeric");
        }
        if (!/^\d{4,8}$/.test(pin)) {
          throw new Error("PIN must be 4-8 digits");
        }

        await connectToDB();

        const user = await User.findOne({ username });
        if (!user) {
          // Signup: Create new user
          const hashedPin = await bcrypt.hash(pin, 10);
          const newUser = new User({ username, pin: hashedPin, score: 0 });
          await newUser.save();
          return { id: newUser._id, name: newUser.username };
        }

        // Login: Verify PIN
        if (await bcrypt.compare(pin, user.pin)) {
          return { id: user._id, name: user.username };
        }
        throw new Error("Incorrect PIN");
      },
    }),
  ],
  session: {
    strategy: "jwt",
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