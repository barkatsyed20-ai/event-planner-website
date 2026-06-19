import { NextRequest } from "next/server";

function isServerActionPost(request: NextRequest) {
  if (request.method !== "POST") return false;

  const h = request.headers;

  return Boolean(
    h.get("Next-Action") ?? h.get("next-action")
  );
}

export default async function proxy(request: NextRequest) {
  const { auth } = await import("@/app/lib/auth/server");

  // Don't redirect Server Action calls — let the action handle auth itself
  if (isServerActionPost(request)) {
    return; // or NextResponse.next(), depending on what auth.middleware needs
  }

  return auth.middleware({
    loginUrl: "/auth/sign-in",
  })(request);
}

export const config = {
  matcher: ["/dashboard/:path*", "/events/:path*"],
}