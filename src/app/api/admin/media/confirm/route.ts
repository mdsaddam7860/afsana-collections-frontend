import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { confirmMediaUpload } from "@/lib/admin-api";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if ((session?.user as { role?: string })?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const accessToken = (session as unknown as { accessToken?: string })?.accessToken;
    if (!accessToken) {
        return NextResponse.json({ error: "No backend session." }, { status: 401 });
    }
    const { publicId, productId } = await request.json();
    if (!publicId || !productId) {
        return NextResponse.json({ error: "publicId and productId are required." }, { status: 400 });
    }
    try {
        const media = await confirmMediaUpload(publicId, productId, accessToken);
        return NextResponse.json(media);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to confirm upload.";
        return NextResponse.json({ error: message }, { status: 502 });
    }
}