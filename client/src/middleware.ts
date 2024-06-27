import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	const token = req.cookies.get("token")?.value.trim();


	if (["/sign-in", "/sign-up"].includes(pathname)) {
		return NextResponse.next();
	}
	// Redirect to sign-in if token is empty or missing
	if (
		(!token || token == "") &&
		["/sign-in", "/sign-up", "/"].includes(pathname)
	) {
		return NextResponse.redirect(new URL("/sign-in", req.url));
	}

	return NextResponse.next();
}
