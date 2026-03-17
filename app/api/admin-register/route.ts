import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function POST(request: Request) {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return NextResponse.json(
      { message: "Admin registration is not configured" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { name, email, password } = body;
  if (!name || !email || !password) {
    return NextResponse.json(
      { message: "Name, email, and password are required" },
      { status: 400 }
    );
  }

  const res = await fetch(`${API_URL}/auth/admin/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, adminSecret }),
  });

  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
