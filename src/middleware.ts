import { NextRequest, NextResponse } from "next/server";
import { analytics } from "./lib/analytics";

export default async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/") {
    try {
      await analytics.track("pageview", {
        page: "/",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        country: (req as any).geo.country,
      });
    } catch (err) {
      // fail silently to not affect request
      console.error(err);
    }
  }

  return NextResponse.next();
}

export const matcher = {
  matcher: ["/"],
};
