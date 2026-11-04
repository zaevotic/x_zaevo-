import { clerkMiddleware } from "@clerk/nextjs/server";

const handler = clerkMiddleware();

export default handler;
export { handler as proxy };

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|pem)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
