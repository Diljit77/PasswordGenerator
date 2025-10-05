// lib/auth.ts
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import cookie from "cookie";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET not set in .env");

export function signToken(userId: any) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function setTokenCookie(res: NextApiResponse, token: string) {
  const isProd = process.env.NODE_ENV === "production";
  res.setHeader("Set-Cookie", cookie.serialize("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  }));
}

export function clearTokenCookie(res: NextApiResponse) {
  res.setHeader("Set-Cookie", cookie.serialize("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  }));
}

export function getUserIdFromReq(req: NextApiRequest) : string | null {
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.token;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    return payload.sub;
  } catch (e) {
    return null;
  }
}
