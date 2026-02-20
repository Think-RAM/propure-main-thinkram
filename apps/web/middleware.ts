import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { authRoutes, publicRoutes, onBoardingRoutes } from "./routes";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(publicRoutes);
const isAuthRoute = createRouteMatcher(authRoutes);
const isOnBoardingRoute = createRouteMatcher(onBoardingRoutes);
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  const { userId, sessionClaims, redirectToSignIn } = await auth();

  const isPublic = isPublicRoute(req);
  const isAuth = isAuthRoute(req);
  const isOnBoarding = isOnBoardingRoute(req);
  const isDashboard = isDashboardRoute(req);
  const isOnBoardingComplete = sessionClaims?.metadata?.onboardingComplete ?? false;

  const isAdmin = sessionClaims?.metadata?.isAdmin === true && pathname.startsWith("/admin");


  console.log(`Middleware triggered for path: ${pathname}`);
  console.log(`Path is public: ${isPublic}`);
  console.log(`Path is auth: ${isAuth}`);
  console.log(`Path is onboarding: ${isOnBoarding}`);
  console.log(`User is admin: ${isAdmin}`);
  if (isAuth && userId) {
    console.log(
      `User ${userId} is authenticated and accessing an auth route: ${pathname}`
    );
    return NextResponse.redirect(new URL("/dashboard", req.url));
  } else if (!userId && !isPublic && !isAuth) {
    console.log(
      `User is not authenticated and accessing a non-public route: ${pathname}`
    );
    if (isDashboard) {
      return redirectToSignIn();
    }
    return redirectToSignIn({ returnBackUrl: req.url });
  } else if (isOnBoardingComplete && isOnBoarding) {
    console.log(
      `User ${userId} has completed onboarding and is accessing an onboarding route: ${pathname}`
    );
    return NextResponse.redirect(new URL("/dashboard", req.url));
  } else if (!isOnBoardingComplete && !isOnBoarding && userId) {
    console.log(
      `User ${userId} has not completed onboarding and is accessing a non-onboarding route: ${pathname}`
    );
    return NextResponse.redirect(new URL("/onboarding", req.url));
  } else if (pathname === "/admin" && !isAdmin) {
    console.log(
      `Non-admin user ${userId} attempted to access admin route: ${pathname}`
    );
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    // '/(api|trpc)(.*)',
  ],
};
