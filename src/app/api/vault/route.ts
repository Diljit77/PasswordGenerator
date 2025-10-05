// app/api/vault/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import VaultItem from "@/app/models/VaultItem";
import connect from "@/app/lib/mongo.";


const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: Request) {
  try {
    await connect();

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const items = await VaultItem.find({ userId }).select("ciphertext iv title createdAt updatedAt");
    
    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error("Vault fetch error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connect();

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const { ciphertext, iv, title } = await req.json();

    // Validate required fields
    if (!ciphertext || !iv || !title) {
      return NextResponse.json(
        { message: "Missing required fields: ciphertext, iv, and title are required" },
        { status: 400 }
      );
    }

    const newItem = new VaultItem({
      userId,
      ciphertext,
      iv,
      title
    });

    await newItem.save();

    return NextResponse.json({ 
      message: "Item saved successfully",
      item: {
        _id: newItem._id,
        title: newItem.title,
        ciphertext: newItem.ciphertext,
        iv: newItem.iv,
        createdAt: newItem.createdAt,
        updatedAt: newItem.updatedAt
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error("Vault save error:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ 
        message: "Validation failed", 
        errors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      message: "Server error",
      error: error.message 
    }, { status: 500 });
  }
}