import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  if (!isLoggedIn && pathname !== "/login") {
    const loginUrl = new URL("/login", req.url);
    return Response.redirect(loginUrl);
  }

  if (isLoggedIn && pathname === "/login") {
    const homeUrl = new URL("/", req.url);
    return Response.redirect(homeUrl);
  }
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|icons|manifest.json|apple-touch-icon.png).*)"],
};
