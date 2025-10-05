// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "@/app/models/User";
import connect from "@/app/lib/mongo.";


export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    // Input validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await connect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists with this email" },
        { status: 400 }
      );
    }

    // Hash password and create encryption salt
    const passwordHash = await bcrypt.hash(password, 12);
    const encryptionSalt = crypto.randomBytes(16).toString("base64");

    // Create new user
    const newUser = new User({
      username,
      email,
      passwordHash,
      encryptionSalt,
    });

    await newUser.save();

    return NextResponse.json(
      { 
        message: "Account created successfully! You can now log in.",
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Error creating account. Please try again." },
      { status: 500 }
    );
  }
}