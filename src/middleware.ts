import { NextRequest, NextResponse } from "next/server";
import { analytics } from "./lib/analytics";

export default async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/") {
    try {
      await analytics.track("pageview", {
        page: "/",
        // country: req.destination,
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
