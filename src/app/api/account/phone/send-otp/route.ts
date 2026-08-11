import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendPhoneOtp } from "@/lib/api";

export async function POST() {
    const session = await getServerSession(authOptions);
    const accessToken = (session as unknown as { accessToken?: string })?.accessToken;
    if (!accessToken) {
        return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    try {
        await sendPhoneOtp(accessToken);
        return NextResponse.json({ message: "Code sent." });
    } catch (err) {
        // Most likely cause of failure here: no phone number on file yet —
        // surface the backend's real message rather than a generic one.
        const message = err instanceof Error ? err.message : "Couldn't send a code.";
        return NextResponse.json({ error: message }, { status: 502 });
    }
}