import { cookies } from "next/headers"; import { NextResponse } from "next/server";
export const POST = async () => { cookies().delete("session"); return NextResponse.json({ ok: true }); };
