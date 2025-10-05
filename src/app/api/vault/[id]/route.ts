// app/api/vault/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import VaultItem from "@/app/models/VaultItem";
import connect from "@/app/lib/mongo.";


const JWT_SECRET = process.env.JWT_SECRET!;

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connect();

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const item = await VaultItem.findOne({ _id: params.id, userId });
    if (!item) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    await VaultItem.deleteOne({ _id: params.id, userId });

    return NextResponse.json({ message: "Item deleted" }, { status: 200 });
  } catch (error) {
    console.error("Vault delete error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}