import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import VaultItem from "@/app/models/VaultItem";
import connect from "@/app/lib/mongo.";

const JWT_SECRET = process.env.JWT_SECRET!;

// Proper type definition for Next.js 15 App Router
interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(
  request: Request,
  { params }: RouteParams
): Promise<Response> {
  try {
    await connect();

    // Await the params to get the actual values
    const { id } = await params;

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const item = await VaultItem.findOne({ _id: id, userId });
    if (!item) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    await VaultItem.deleteOne({ _id: id, userId });

    return NextResponse.json({ message: "Item deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Vault delete error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// If you have GET method, update it too
export async function GET(
  request: Request,
  { params }: RouteParams
): Promise<Response> {
  try {
    await connect();
    const { id } = await params;

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const item = await VaultItem.findOne({ _id: id, userId });
    if (!item) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    console.error("Vault get error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// If you have PUT/PATCH method
export async function PUT(
  request: Request,
  { params }: RouteParams
): Promise<Response> {
  try {
    await connect();
    const { id } = await params;

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const body = await request.json();

    const item = await VaultItem.findOne({ _id: id, userId });
    if (!item) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    const updatedItem = await VaultItem.findOneAndUpdate(
      { _id: id, userId },
      { $set: body },
      { new: true }
    );

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error("Vault update error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}