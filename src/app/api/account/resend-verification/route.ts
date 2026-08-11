import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resendVerificationOtp } from "@/lib/api";

export async function POST() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    try {
        await resendVerificationOtp(session.user.email);
        return NextResponse.json({ message: "A new code has been sent." });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Couldn't resend the code.";
        return NextResponse.json({ error: message }, { status: 502 });
    }
}