import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { verifyPhoneOtp } from "@/lib/api";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    const accessToken = (session as unknown as { accessToken?: string })?.accessToken;
    if (!accessToken) {
        return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    const { otp } = await request.json();
    if (!otp || String(otp).length !== 6) {
        return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });
    }
    try {
        await verifyPhoneOtp(String(otp), accessToken);
        return NextResponse.json({ message: "Phone verified." });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Invalid or expired code.";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}