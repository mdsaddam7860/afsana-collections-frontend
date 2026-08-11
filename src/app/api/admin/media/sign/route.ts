import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { signMediaUpload } from "@/lib/admin-api";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if ((session?.user as { role?: string })?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const accessToken = (session as unknown as { accessToken?: string })?.accessToken;
    if (!accessToken) {
        return NextResponse.json({ error: "No backend session." }, { status: 401 });
    }
    const { productId } = await request.json();
    if (!productId) {
        return NextResponse.json({ error: "productId is required." }, { status: 400 });
    }
    try {
        const params = await signMediaUpload(productId, accessToken);
        return NextResponse.json(params);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to sign upload.";
        return NextResponse.json({ error: message }, { status: 502 });
    }
}