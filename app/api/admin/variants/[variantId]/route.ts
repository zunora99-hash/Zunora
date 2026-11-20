import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { readJsonBody } from "@/lib/request-body";

export async function PATCH(request: Request, { params }: { params: { variantId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await readJsonBody(request, 1024);
  const stock = body.ok && body.value && typeof body.value === "object" ? (body.value as { stock?: unknown }).stock : undefined;
  if (typeof stock !== "number" || !Number.isInteger(stock) || stock < 0 || stock > 1_000_000) {
    return NextResponse.json({ error: "Stock must be a whole number from 0 to 1,000,000." }, { status: 400 });
  }

  try {
    const variant = await prisma.variant.update({ where: { id: params.variantId }, data: { stock }, select: { id: true, stock: true } });
    return NextResponse.json(variant);
  } catch {
    return NextResponse.json({ error: "Variant not found." }, { status: 404 });
  }
}
