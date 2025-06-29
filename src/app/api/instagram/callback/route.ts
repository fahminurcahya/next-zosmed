import { auth } from "@/server/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.redirect(new URL(`${process.env.NEXT_PUBLIC_APP_URL}/signin?error=unauthorized`, request.url));
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    console.log(searchParams)

    // Handle errors from Instagram
    if (error) {
        console.error("Instagram OAuth error:", error, errorDescription);
        return NextResponse.redirect(
            new URL(
                `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=${encodeURIComponent(
                    errorDescription || "Connection failed"
                )}`,
                request.url
            )
        );
    }

    if (!code || !state) {
        return NextResponse.redirect(
            new URL(`${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=invalid_request`, request.url)
        );
    }

    // Redirect to callback page with params
    const callbackUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL}/integrations/instagram/callback`, request.url);
    callbackUrl.searchParams.set("code", code);
    callbackUrl.searchParams.set("state", state);

    return NextResponse.redirect(callbackUrl);
}