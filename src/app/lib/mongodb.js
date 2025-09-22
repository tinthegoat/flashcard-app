// src/app/lib/mongodb.js
import mongoose from "mongoose";

let isConnected = false;

export async function connectToDB() {
  mongoose.set('strictQuery', true);
  
  if (isConnected) {
    console.log("Already connected to MongoDB");
    return;
  }
  
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }
  
  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "studyflash",
    });
    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    isConnected = false;
    throw new Error(`MongoDB connection failed: ${err.message}`);
  }
}