import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { verifyEmailOtp } from "@/lib/api";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    const { otp } = await request.json();
    if (!otp || String(otp).length !== 6) {
        return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });
    }
    try {
        await verifyEmailOtp(session.user.email, String(otp));
        return NextResponse.json({ message: "Email verified." });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Invalid or expired code.";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}